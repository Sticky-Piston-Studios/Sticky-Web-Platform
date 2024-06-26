// REQUIREMENTS: 
// Install the packages if you haven't already
// npm install typescript yargs mongodb ts-node @types/node @types/yargs @types/mongodb

import { Database, DatabaseComponent, FrontendComponent, BackendComponent, Component, WebServerComponent, ComponentType, Config, ContainerConfig } from "./swp-config-types";

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const { MongoClient, ObjectId } = require('mongodb');
const { exec } = require('child_process');

interface Argv {
    action: string;
    config: string;
    components: string;
}

// -------- MAIN --------
main();

async function main() {

    // Define command-line options
    const argv = yargs
    .option('action', {
        alias: 'a',
        describe: 'Specify the action to perform',
        choices: ["InitializeDatabase", "Start", "StartDev", "Stop", "ClearDatabase"], // Add more actions as needed
        demandOption: true,
    })
    .option('config', {
        alias: 'f',
        describe: 'Specify the path to the configuration file',
        default: './configuration.json',
    })
    .option('components', {
        alias: 'c',
        describe: 'Specify the names of the components (one or multiple) on which to perform the action',
        default: '',
    })
    .help()
    .argv as Argv;

    // Check for action flag
    const configPath = path.resolve(argv.config);
    const config = readConfig(configPath);
    const action = argv.action;

    // Perform operations on all components if no target components were specified
    const target_components = argv.components !== '' ? argv.components.split(" ") : getAllComponentNames(config);

    // Check if all requrested components
    areComponentsInConfig(config, target_components, true)

    switch (action) {
        case 'InitializeDatabase':
            await initializeDatabases(config, target_components);
            break;
        case 'Start':
            await start(config, false, target_components);
            break;
        case 'StartDev':
            await start(config, true, target_components);
            break;
        case 'Stop':
            await stop(config, target_components);
            break;
        case 'ClearDatabase':
            await clearDatabases(config, target_components);
            break;
        case 'GenerateFrontendDefinitions':
            await generateFrontendDefinitions(config, target_components);
            break;
        default:
            printError('Unknown action. Check help using -h flag');
            break;
    }

    // Notify about the success
    console.log(`Operation completed successfully!${Math.floor(Math.random() * Math.floor(5)) === 4 ? " #stay_sticky" : ""}`);
}

// -------- FUNCTIONS --------

function parseConfigComponents(json: any): Config {
    const components = json.Components.map((component: any) => {
        switch (component.Type) {
            case ComponentType.Database:
                return component as DatabaseComponent;
            case ComponentType.Backend:
                return component as BackendComponent;
            case ComponentType.Frontend:
                return component as FrontendComponent;
            case ComponentType.WebServer:
                return component as WebServerComponent;
            default:
                throw new Error(`Unknown component type: ${component.Type}`);
        }
    });

    return { ...json, Components: components };
}

function readConfig(configPath: string): Config {
    try {
        const configData = fs.readFileSync(configPath, 'utf8');
        const configJson = JSON.parse(configData) as Config;
        const config = parseConfigComponents(configJson);
        return config;
    } catch (error) {
        printError(`Error reading configuration file: ${(error as Error).message}`);
        process.exit(1);
    }
}

// Update swp_components_nginx_extension.conf to include locations for created SWP components/services 
function updateWebServerConfig(config: Config, configuration_file_path: string)
{
    const componentBlockTemplate = (component: Component) => 
        `location ${component.ContainerConfig.DomainSubPath} {\n` +
        `    proxy_pass http://${component.Name}:${component.ContainerConfig.PortsMapping[0][0]};\n` +
        `    proxy_set_header Host $host;\n` +
        `    proxy_set_header X-Real-IP $remote_addr;\n` +
        `    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n` +
        `}\n\n`;

    // Clear the file contents
    fs.writeFileSync(configuration_file_path, '', 'utf-8');
    fs.appendFileSync(configuration_file_path, "// This file is auto-generated by Sticky Web Platform Manager at start\n\n\n", 'utf-8');

    config.Components.forEach(component => {
        if (component.Create === true)
        {
            const nginxBlock = componentBlockTemplate(component);
            fs.appendFileSync(configuration_file_path, nginxBlock, 'utf-8');
        }
    });
}

function getAllComponentNames(config: Config) : string[] {
    let componentNames: string[] = [];

    config.Components.forEach(component => {
        componentNames.push(component.Name);
    });

    return componentNames;
}

function areComponentsInConfig(config: Config, ComponentNamesToCheck: string[], exitProcessOnFalse: boolean) : boolean {
    
    let componentsNotFound: string[] = [];
    let componentNames = getAllComponentNames(config);

    ComponentNamesToCheck.forEach(requestedComponentName => {
        if (componentNames.includes(requestedComponentName) === false)
        {
            componentsNotFound.push(requestedComponentName);
        }
    })

    if (exitProcessOnFalse === true && componentsNotFound.length > 0)
    {
        if (componentsNotFound.length === 1)
        {
            printError(`Component \"${componentsNotFound[0]}\" is not defined in the configuration file`);
        }
        else
        {
            printError(`Components \"${componentNames.join("\", \"")}\" are not defined in the configuration file`);
        }
        process.exit(1);
    }

    return componentsNotFound.length === 0;
}

function execCommandAsync(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, { env: { ...process.env } }, (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                reject(`Error executing command: ${error.message}`);
                return;
            }
            
            const output: string = (stderr !== "" && stderr !== "\n" && stderr !== "\n\n") ? stdout + "\n" + stderr : "\n" + stdout;
            resolve(output);
        });
    });
}

function printError(error: string) {
    const red = '\x1b[31m';
    const reset = '\x1b[0m';
    console.log(red, error, reset);
}

function generateDockerBuildCommand(containerName: string, dockerfilePath: string): string {

    let dockerBuildCommand = 'docker build ';

    // Image name (tag)
    dockerBuildCommand += `-t ${containerName}`;

    // Dockerfile 
    dockerBuildCommand += ` ${dockerfilePath}`;

    return dockerBuildCommand
}

function generateDockerRunCommand(containerName: string, config: ContainerConfig): string {

    let dockerRunCommand = 'docker run -d';

    // container_name
    if (containerName !== "") {
        dockerRunCommand += ` --name=${containerName}`; // Container name
    }

    // networks
    if (config.ContainerNetworkName !== "") {
        dockerRunCommand += ` --network=${config.ContainerNetworkName}`; // Container name
    }

    // ports
    if (config.PortsMapping.length > 0) {
        dockerRunCommand += ` ${config.PortsMapping.map(addr => `-p ${addr[0]}:${addr[1]}`).join(' ')}`; // Port mappings
    }

    // volumes
    const currentWorkingDirectory = path.resolve(process.cwd());

    if (config.VolumeMappings.length > 0) {
        dockerRunCommand += ` ${config.VolumeMappings.map(mapping => {
            const sourcePath = mapping[0].replace(/\./g, currentWorkingDirectory); // Replace dot with `pwd`
            return `-v ${sourcePath}:${mapping[1]}`;
        }).join(' ')}`; // Volume mappings
    }

    // environment variables
    if (config.EnvironmentVariables.length > 0) {
        dockerRunCommand += ` ${config.EnvironmentVariables.map(env => `-e ${env[0]}=${env[1]}`).join(' ')}`; // Environment variables
    }

    dockerRunCommand += ` ${config.ImageName}`;

    return dockerRunCommand;
}

// -------- ACTIONS --------

async function start(config: Config, development: boolean, componentNames: string[]) {

    // Find if there is web server component and add locations for all other components to it
    console.log(`Updating web server configuration ...`);
    config.Components.forEach(component => {
        if (component.Type === ComponentType.WebServer && component.Create === true)
        {
            updateWebServerConfig(config, (component as WebServerComponent).ConfigExtensionFilePath);
        }
    });

    // Start Docker services for specified components
    const mode = development ? 'Development' : 'Production';
    console.log(`Starting components in ${mode} mode: ${componentNames.join(', ')} ...`);

    // Set environment variables
    process.env['BACKEND_MODE'] = `${mode}`;
    process.env['FRONTEND_MODE'] = `${mode}`;
    process.env['FRONTEND_BASEPATH'] = `XXXXXXXXXXXX`;

    // Create docker build and run commands and execute them
    let componentsStarted = 0;
    for (const component of config.Components) {

        if (componentNames.includes(component.Name) && component.Create) {

            console.log(`Starting component: ${component.Name} (${componentsStarted + 1}/${componentNames.length}) ...`);

            // Generate docker image only when DockerfilePath is set
            // If not run just docker run command that will pull the image from Docker Hub
            if (component.ContainerConfig.DockerfilePath !== "") {
                console.log(`Building Docker image for: ${component.Name} ...`);
                const dockerBuildCommand = generateDockerBuildCommand(component.Name, component.ContainerConfig.DockerfilePath);
                try {
                    let output: string = await execCommandAsync(dockerBuildCommand);
                    console.log(`${output}`);
                } catch (error) {
                    printError(`Failed to build Docker image for the component: ${component.Name} - ${error}`);
                    process.exit(1);
                }
            }

            // Run the Docker container
            console.log(`Running Docker container for: ${component.Name} ...`);
            const dockerRunCommand = generateDockerRunCommand(component.Name, component.ContainerConfig);
            console.log(dockerRunCommand);

            try {
                let output: string = await execCommandAsync(dockerRunCommand);
                console.log(`${output}`);
            } catch (error) {
                printError(`Failed to start Docker container for component: ${component.Name} - ${error}`);
                process.exit(1);
            }

            componentsStarted++;
        }
    };
}

async function stop(config: Config, componentNames: string[]) {

    console.log(`Stopping Docker containers for components: ${componentNames.join(', ')} ...`);

    let componentNamesToStop: string[] = [];

    // Gather running containers to stop
    const checkRunningContainerOperations = componentNames.map(async (componentName: string) => {
        const dockerCommand: string = `docker ps -q -f name="${componentName}"`;
        let output: string = await execCommandAsync(dockerCommand);
        // Check if id of the container has been printed, indicating that it is running
        if (output.trim() !== '') {
            componentNamesToStop.push(componentName);
        }
    });

    // Wait for all Docker commands to be executed
    await Promise.all(checkRunningContainerOperations);

    if (componentNamesToStop.length == 0)
    {
        console.log(`None of these containers is running`);
        return;
    }

    console.log(`Stopping found Docker containers: ${componentNamesToStop.join(', ')} ...`);

    // Execute the command
    const dockerCommand = `docker stop ${componentNamesToStop.join(' ')}`;
    try {
        let output: string = await execCommandAsync(dockerCommand);
        console.log(`${output}`);
    } catch (error) {
        printError((error as Error).message);
        process.exit(1);
    }
}

async function connectToDatabase(databaseConnectionString: string) {
    if (!databaseConnectionString) {
        printError('DatabaseConnectionString not found in the configuration file');
        process.exit(1);
    }

    // TODO: Remove this when both script and backend will be able to connect to the database vis the same connection string
    databaseConnectionString = databaseConnectionString.replace('swp-database', "localhost");

    // Initialize the database
    const client = new MongoClient(databaseConnectionString);
    try {
        await client.connect();
        console.log('Connected to the database');
        return client;
    } catch (error) {
        printError('Error connecting to the database! Make sure the database is running and is accessible via the connection string provided in the configuration file');
        process.exit(1);
    }
}

async function initializeDatabases(config: Config, componentNames: string[]) 
{
    const initializeDatabaseOperations = componentNames.flatMap(componentName => 
        config.Components
            .filter(component => component.Type === ComponentType.Database && component.Name === componentName)
            .map(component => initializeDatabase(component as DatabaseComponent))
    );

    // Wait for all initialization tasks to complete
    await Promise.all(initializeDatabaseOperations);
}

// Start mongo database container, wait for it to finish, then create databases and collections defined in configuration file
// By default it uses first database it finds
async function initializeDatabase(database: DatabaseComponent) {
    console.log(`Initializing database ${database.Name} ...`);

    // Check if database is enabled
    if (database.Create === false)
    {
        printError("Database creation is disabled in this project in the configuration file");
        return;
    }

    // Check if connection string is available
    if (database.DatabaseConnectionString === null)
    {
        printError("Failed to find database connection string in the project configuration file");
        return;
    }

    const client = await connectToDatabase(database.DatabaseConnectionString);

    try
    {
        const adminDb = client.db('admin');

        for (const databaseDefinition of database.Databases) {
            // Create the database
            const database = client.db(databaseDefinition.Name);
            console.log(`Database: ${databaseDefinition.Name} created`);

            // Create collections
            for (const collectionDefinition of databaseDefinition.Collections) {
                const collection = await database.createCollection(collectionDefinition.Name);

                // Insert data into the collection, item by item, checking it they match the model definition
                const collectionDataFilePath = collectionDefinition.InitialData;

                // Get data from initial data file and insert it into the collection
                const collectionData = require(collectionDataFilePath).data;
                await collection.insertMany(collectionData);

                console.log(`Database: ${databaseDefinition.Name}, Collection: ${collectionDefinition.Name} created`);
            }
        }

        console.log("Database initialized successfully!");
    }
    catch (error)
    {
        printError(`Failed to initialize the database: ${error}`);
    }
    finally
    {
        await client.close();
    }
}

async function clearDatabases(config: Config, componentNames: string[]) 
{
    // Clear all databases
    const cleanDatabaseOperations = componentNames.flatMap(componentName => 
        config.Components
            .filter(component => component.Type === ComponentType.Database && component.Name === componentName)
            .map(component => clearDatabase(component as DatabaseComponent))
    );

    // Wait for all initialization tasks to complete
    await Promise.all(cleanDatabaseOperations);
}

// Deletes whole database volume
async function clearDatabase(database: DatabaseComponent) {
    console.log(`Cleaning database ${database.Name} ...`);

    // Check if connection string is available
    if (database.DatabaseConnectionString === null)
    {
        printError("Failed to find database connection string in the configuration file");
        return;
    }

    const client = await connectToDatabase(database.DatabaseConnectionString);

    try
    {
        // Get the list of databases
        const databaseList = await client.db().admin().listDatabases();

        // List of databases to exclude
        var excludeDatabases = ['admin', 'local', 'config'];

        // Iterate through the list of databases
        const databaseOperations = databaseList.databases.map(async (database: Database) => {
            const databaseName = database.Name;
            if (excludeDatabases.indexOf(databaseName) === -1) {
                const databaseToDelete = await client.db(databaseName);
                await databaseToDelete.dropDatabase();  // Ensure this is awaited
                console.log("Deleting database: " + databaseName);
            } else {
                console.log("Skipping database: " + databaseName);
            }
        });

        // Wait for all database operations to complete
        await Promise.all(databaseOperations);
    }
    catch (error)
    {
        printError(`Failed to clear the database: ${error}`);
    }
    finally
    {
        await client.close();
    }
}

function generateFrontendDefinitions(config: Config, target_components: string[]) {
    // 

}
