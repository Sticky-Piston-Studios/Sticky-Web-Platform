# Sticky Web Framework (SWF)

-- nice logo! --

The Sticky Web Framework (SWF), developed by Sticky Piston Studios, is an innovative open-source framework designed to streamline the development of web applications. This framework uniquely enables the dynamic creation of endpoints through a single configuration file, which is utilized by both the frontend and backend components of an application.

**Key Features:**

- **Dynamic Endpoint Configuration:**

  SWF allows for the dynamic definition of endpoints, databases, models, and request & response bodies through a simple JSON configuration file. This file serves as the central point of reference for both frontend and backend, significantly reducing the need for code modifications.

- **No-Code Backend and Frontend Integration:**

  The framework offers a no-code, dynamically-configurable backend and a corresponding frontend. This integration is particularly beneficial for users with minimal or no programming experience, as it simplifies the process of web app creation.

- **Extensible and Flexible Architecture:**

  Despite its no-code approach, SWF is designed to be extensible, catering to more complex and customized application needs. Its generic architecture ensures flexibility and adaptability across various use cases.

- **Frontend Utility Functions:**

  A set of utility functions is provided for the frontend, facilitating seamless communication with the backend. These functions are aware of the definitions set in the configuration file, ensuring consistency and ease of use.

## Usage

The core of SWF's functionality lies in its configuration file. Users define their application's structure and behavior in this JSON file, which the framework then interprets to set up the necessary backend and frontend components. This approach eliminates the need for repetitive coding tasks and recompilation, making the development process more efficient and user-friendly. Also, if you simply want to set up hassle-free frontend-only application where you load data from an API endpoint, this framework is just for you!

**Target Audience:**

SWF is ideal for individuals and teams looking to develop web applications without delving deeply into coding. It's particularly useful for:

- Developers seeking a quick and efficient way to set up both frontend and backend components.
- Non-technical users who need to create web applications without extensive programming knowledge.
- Teams aiming to reduce development time and focus on application design and user experience.

## Contributing

**We welcome contributions to the Sticky Web Framework!** Whether it's feature enhancements, bug fixes, or documentation improvements, your input is valuable. Please refer to our contributing guidelines for more information on how to participate in the development of SWF.

## Table of Contents

- [Development](#development)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Database](#database)
- [How does it work?](#how-does-it-work)
- [User Guide](#user-guide)

---

## Development

To quickly get started with the SWF, please clone the repository and set it up using **Sticky Web Framework Manager**:

### Sticky Web Framework Manager

Install prerequisites: `npm install yargs mongodb`

Actions:

- `node .\StickyWebFrameworkManager.js --help`
  Displays help.
- `node .\StickyWebFrameworkManager.js --action InitializeDatabase`  
  Connects to database container using `DatabaseConnectionString` defined in configuration file.  
  Creates all databases and collections defined in configuration file.  
  Fills the collections with initial data from the file specified in `InitialData` field of collection defined in configuration file.
- `node .\StickyWebFrameworkManager.js --action ClearDatabase`  
  Deletes all databases except `local`, `admin` and `config`.
- `node .\StickyWebFrameworkManager.js --action Start`  
  Starts all `database`, `frontend`, `backend`, `nginx` services defined in docker-compose file in production mode.
- `node .\StickyWebFrameworkManager.js --action StartDev`  
  Starts all `database`, `frontend`, `backend`, `nginx` services defined in docker-compose file in development mode.

To run all containers manually:

- `cd <PROJECT_FOLDER>`
- `docker compose -f "docker-compose.yaml" up database backend frontend nginx -d --build`

### Backend

To run backend locally:

- `cd <PROJECT_FOLDER>`
- `dotnet restore` (just once)
- `dotnet run --environment "Development"`

### Frontend

To run frontend locally (for hot reloading support), first you have generate the dynamic endpoints (this step has to be done just once):

- `cd <PROJECT_FOLDER>/frontend`
- `npm run generate:api`

Then, run the application:

- `npm run dev`

### Database

Download MongoDB Compass and use `mongodb://root:root@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false` connection string to connect.

## User Guide

Since most users will be content with using the framework as it is, in this section we describe how to create a proper endpoint, model and database configuration that will then be used by backend, frontend and the database. If you are concerned about the exact details of how SWF operates and want to dig deeper into its internals, please refer to [the next section](#how-does-it-work).

### `configuration.json` Usage

This file defines the entirety of both frontend-backend and backend to database communication. It also defines how the data should be stored. Changing fields in this file will be reflected in all 3 components the application built on top using SWF.

Let's walk through an exemplary configuration for this repository in parts, discussing relevant details.

First part is mostly concerned with setting up the database(s) and proper collections.

```JSON
{
  "DatabaseConnectionString": "mongodb://root:root@swf-database:27017",
  "Databases": [
    {
      "Name": "Main",
      "Collections": [
        {
          "Name": "Companies",
          "Model": "Company",
          "InitialData": "./database/InitialData/Companies.js"
        }
      ]
    }
  ],
```

Parameters:

- `DatabaseConnectionString` - the connection string used to connect to your database
- `Databases` - list of databases we connect to
  - `Name` - database name -`Collections` - list of collections we have in the database
    - `Name` - name of the collection
    - `Model` - which model to use for this collection, the value must match **exactly** with one in `DatabaseModels`
    - `InitialData` - initial data to be supplied to this collection, done by the `StickyWebFrameworkManager.js`

Then, the backend and frontend endpoints are defined, in groups for easier logical classification:

```JSON
  "EndpointGroups": [
    "Name": "Companies",
    "Path": "/api/companies",
    "Endpoints": [
      {
        "Name": "GetCompany",
        "Method": "GET",
        "Subroute": "id",
        "QueryParameters": ["apikey"],
        "BodyName": "GetCompany",
        "Action": {
          "Type": "Default",
          "DatabaseName": "Main",
          "DatabaseCollectionName": "Companies"
        }
      },
      ...
    ]
  ],
```

Parameters:

- `EndpointGroups` - list of endpoint groups that will share a common `Path`
  - `Name` - name of the endpoint group
  - `Path` - sub-path of the endpoint that will be prepended to the actual path of the endpoint. If it does not have any `QueryParameters`, or `Subroute`s then the endpoint ending with `Path` will be called with appropriate `Method`
    - `Endpoints` - list of endpoints to be called
      - `Name` - unique name for this `Method` + `Subroute` + `QueryParameters` combination
      - `Method` - the HTTP method to be used when calling this endpoint. Allowed methods are: `GET`, `POST`, `DELETE` (for now)
      - `Subroute` - optional, is mostly a marker that this route accepts further parameters
      - `QueryParameters` - these are parameters that are passed as queries to the backend or the API endpoint called
      - `BodyName` - optional, used only when body is necessary. Must match one `Name` in `EndpointBodies`.
      - `Action` - container for fields describing the `Action` that the backend should take when receiving this call
        - `Type` - specifies what action should be taken (`Default` or `Custom`) - refer to [User Guide](#user-guide) for more information
        - `DatabaseName` - which database to use
        - `DatabaseCollectionName` - which database collection to use

Next, the actual models of the data in the database must be supplied:

```JSON
  "DatabaseModels": [
    {
      "Name": "Company",
      "Fields": [
        {
          "Name": "Id",
          "Type": "Id"
        },
        {
          "Name": "Name",
          "Type": "String"
        },
        {
          "Name": "RestaurantIds",
          "Type": "List<Id>"
        },
        {
          "Name": "Value",
          "Type": "Int"
        }
      ]
    }
  ],
```

Parameters:

- `DatabaseModels` - list of data models to for storing the data in the database
  - `Name` - name of this database model
  - `Fields` - list of name:type fields present the database
    - `Name` - name of the field
    - `Type` - type of the field, allowed types: `Id`, `String`, `List<>`, `Int`

Lastly, we need to define what data will be sent over the endpoint to backend:

```JSON
  "EndpointBodies": [
    {
      "Name": "GetCompany",
      "Fields": [
        {
          "Name": "Name",
          "Type": "String"
        },
        {
          "Name": "RestaurantIds",
          "Type": "List<Id>"
        },
        {
          "Name": "Value",
          "Type": "Int"
        },
        {
          "Name": "EmployeeCount",
          "Type": "Int"
        }
      ]
    },
    ...
  ]
}
```

Parameters:

- `EndpointBodies` - list of bodies to send when endpoint with a `Name` is called
  - `Name` - name of the endpoint, must match the `Name` in `Endpoints`
  - `Fields` - list of name:type fields to send to the backend
    - `Name` - name of the field
    - `Type` - type of the field, allowed types: `Id`, `String`, `List<>`, `Int`

## How does it work?

Here we go in details how the magic of the configuration file translates to the actual code. This chapter is more technical and is dedicated to developers and users who simply want to know more about SWF. The configuration file is read both by the frontend and backend and is parsed by each of them during their respective building time.

### Backend

For backend the routes are created during the compilation of the project and are added one by one by the builder. Once a route is called on the backend it is dynamically filtered whether it matches any of the registered routes and if it does, then the checking of necessary `EndpointBodies` ensues. Once everything matches, the data is passed to the database and the result is returned to the user.

This is ilustrated by this diagram:
![Backend Diagram](images/backend.png)

### Frontend

Frontend handles configuration parsing and reading differently because we make usage of **Next.js** dynamic route handling and creation. This is further facilitated by running a script: `generate-api-routes.js` before compiling the project that parses the `configuration.json` and extracts relevant subroutes, creating proper routing structure for the frontend. After the route directory structures are created, the last parts of the routes responsible for last-mile dispatching of endpoints are generated from templates that take into account `QueryParameters` and `Subroute`s for each of the `Endpoints` in the configuration.

The image describes it in more detail:
![Frontend Diagram](images/frontend.png)

## TODO

- File database
- Filtering
- Pagination
- When inserting data to the collection via manager check if initial data actually matches collection's model
- Other config variables should be settable in configuration.json (MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD, BACKEND_PORT, FRONTEND_PORT)
- ClearDatabase should have an option to specify the path to the volume directory
- Registering custom looping services
- Add support for other field types
