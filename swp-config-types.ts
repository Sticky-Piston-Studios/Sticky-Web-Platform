
// Define interfaces for configurations and other structured data
export interface Config {
    Components: Component[];
    ContainerNetworkNames: string[];
}

export enum ComponentType {
    Database = "Database",
    Backend = "Backend",
    Frontend = "Frontend",
    WebServer = "WebServer",
}

export interface Component {
    Name: string,
    Type: ComponentType,
    Create: boolean;
    ContainerConfig: ContainerConfig;
}

export interface ContainerConfig {
    // Either ImageName or DockerfilePath must be set
    ImageName: string, // If set image will be pulled from Docker Hub
    DockerfilePath: string, // If set, docker build command will be used to build the image using Dockerfile at this path, name of the image will be set to the name of component
    
    DomainSubPath: string; // Optional
    ContainerNetworkName: string, // Optional
    PortsMapping: [string, string][], // One required (source port, destination port)
    VolumeMappings: [string, string][]; // Optional (tho usually required to access SWP Config file)
    EnvironmentVariables: [string, string][]; // Optional
} 

export interface DatabaseComponent extends Component {
    DatabaseConnectionString: string;
    Databases: Database[];
}

export interface Database {
    Name: string;
    Collections: Collection[];
}

export interface Collection {
    Name: string;
    InitialData: string;
    Models: Model[];
}

export interface Model {
    Name: string;
    Fields: Field[];
}

export interface Field {
    Name: string;
    Type: string; // Can be more specific, e.g., 'Id' | 'String' | 'Int' | 'List<Id>'
}

export interface BackendComponent extends Component {
    EndpointGroups: EndpointGroup[];
    EndpointBodies: EndpointBody[];
}

export interface EndpointGroup {
    Name: string;
    Path: string;
    Endpoints: Endpoint[];
}

export interface Endpoint {
    Name: string;
    Method: string; // Can be more specific, e.g., 'GET' | 'POST' | 'PUT' | 'DELETE'
    Subroute?: string;
    BodyName: string;
    Action: Action;
}

export interface Action {
    Type: string; // Can be more specific based on your application's needs
    DatabaseName: string;
    DatabaseCollectionName: string;
}

export interface EndpointBody {
    Name: string;
    Fields: Field[]; // Reusing Field interface from above
}

export interface FrontendComponent extends Component {
}

export interface WebServerComponent extends Component {
    ConfigExtensionFilePath: string;
}