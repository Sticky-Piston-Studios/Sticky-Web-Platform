// Install the 'yargs' package if you haven't already
// npm install yargs mongodb

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const { MongoClient, ObjectId } = require('mongodb');
const { exec } = require('child_process');
//const { users, events, images } = require('./init_data/data.js');

// Define command-line options
const argv = yargs
  .option('action', {
    alias: 'a',
    describe: 'Specify the action to perform',
    choices: ["InitializeDatabase", "Start", "StartDev", "ClearDatabase"], // Add more actions as needed
    demandOption: true,
  })
  .option('config', {
    alias: 'c',
    describe: 'Specify the path to the configuration file',
    default: './configuration.json',
  })
  .help()
  .argv;

// Check for action flag
const configPath = path.resolve(argv.config);
const config = readConfig(configPath);
const action = argv.action;

function startDev() {
	console.log("Starting all services in development mode...");
	process.env['ASPNETCORE_ENVIRONMENT'] = 'Development';

	// TODO: Add environment variables for frontend too

	runDockerCompose();
}

function start() {
	console.log("Starting all services in release mode...");
	process.env['ASPNETCORE_ENVIRONMENT'] = 'Production';

	// TODO: Add environment variables for frontend too

	runDockerCompose();
}

function runDockerCompose() {
	// Command to run Docker Compose
	const dockerComposeCommand = 'docker-compose -f docker-compose.yaml up -d database backend frontend nginx';

	// Execute the command
	exec(dockerComposeCommand, (error, stdout, stderr) => {
		if (error) {
			console.error(`Error executing Docker Compose command: ${error}`);
			return;
		}

		console.log(`Docker Compose command output: ${stdout}`);
		if (stderr) {
			console.error(`Docker Compose command error output: ${stderr}`);
		}
	});
}

async function connectToDatabase() {
	// Get DatabaseConnectionString from the config
	const databaseConnectionString = config.DatabaseConnectionString;

	if (!databaseConnectionString) {
		console.error('DatabaseConnectionString not found in the configuration file.');
		process.exit(1);
	}

	// Initialize the database
	const client = new MongoClient(databaseConnectionString);

	try {
    await client.connect();
    console.log('Connected to the database');
		return client;
  } catch (error) {
    console.error('Error connecting to the database! Make sure the database is running and is accessible via the connection string provided in the configuration file');
		process.exit(1);
  }
}

// Start mongo database container, wait for it to finish,
// then create databases and collections defined in configuration file
async function initializeDatabase() {
  console.log("Initializing Database...");

  const client = await connectToDatabase();

	try
  {
    const adminDb = client.db('admin');

		for (const databaseDefinition of config.Databases) {

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
    console.error("Error initializing the database:", error);
  }
  finally
  {
    await client.close();
  }
}

// Deletes whole database volume
async function clearDatabase() {
	console.log("Cleaning Database...");

  const client = await connectToDatabase();

	try
  {
		// Get the list of databases
		const databaseList = await client.db().admin().listDatabases();

		// List of databases to exclude
		var excludeDatabases = ['admin', 'local', 'config'];

		// Iterate through the list of databases
		databaseList.databases.forEach(async function(database) {
				var databaseName = database.name;
				if (excludeDatabases.indexOf(databaseName) === -1) {
						const databaseToDelete = await client.db(databaseName);
						databaseToDelete.dropDatabase();
						console.log("Deleting database: " + databaseName);
				} else {
					console.log("Skipping database: " + databaseName);
				}
		});
	}
  catch (error)
  {
    console.error("Error when clearing database:", error);
  }
  finally
  {
    await client.close();
  }
}

switch (action) {
  case 'InitializeDatabase':
    initializeDatabase();
    break;
	case 'ClearDatabase':
		clearDatabase();
		break;
	case 'Start':
		start();
		break;
	case 'StartDev':
		startDev();
		break;
  default:
    console.error('Unknown action. Check help using -h flag');
    break;
}




function readConfig(configPath) {
    try {
      const configData = fs.readFileSync(configPath);
      return JSON.parse(configData);
    } catch (error) {
      console.error(`Error reading config file: ${error.message}`);
      process.exit(1);
    }
  }

async function initDatabase(connectionString) {
  const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

  try
  {
    console.log("Beginning Database initialisation...");
    await client.connect();

    const adminDb = client.db('admin');

    // Create main database
    const mainDb = client.db('main');

    // Create and initialize users collection
    const usersCollection = await mainDb.createCollection("users");
    await usersCollection.insertMany(users);

    // Create and initialize refresTokens collection
    const refreshTokensCollection = await mainDb.createCollection("refreshTokens");
    await refreshTokensCollection.createIndex({ "tokenString": 1 }, { unique: true });

    // Create and initialize events collection
    const eventsCollection = await mainDb.createCollection("events");
    await eventsCollection.insertMany(events);

    // Create and initialize images collection
    const imagesCollection = await mainDb.createCollection("images");
    await imagesCollection.insertMany(await images(imageDirectoryPath));

    console.log("Database initialized successfully!");
  }
  catch (error)
  {
    console.error("Error initializing the database:", error);
  }
  finally
  {
    await client.close();
  }
}