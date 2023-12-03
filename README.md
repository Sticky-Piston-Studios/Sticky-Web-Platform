# Sticky Web Framework (SWF)

## Overview

The Sticky Web Framework (SWF), developed by Sticky Piston Studios, is an innovative open-source framework designed to streamline the development of web applications. This framework uniquely enables the dynamic creation of endpoints through a single configuration file, which is utilized by both the frontend and backend components of an application.

**Key Features:**

- Dynamic Endpoint Configuration: SWF allows for the dynamic definition of endpoints, databases, models, and request & response bodies through a simple JSON configuration file. This file serves as the central point of reference for both frontend and backend, significantly reducing the need for code modifications.
- No-Code Backend and Frontend Integration: The framework offers a no-code, dynamically-configurable backend and a corresponding frontend. This integration is particularly beneficial for users with minimal or no programming experience, as it simplifies the process of web app creation.
- Extensible and Flexible Architecture: Despite its no-code approach, SWF is designed to be extensible, catering to more complex and customized application needs. Its generic architecture ensures flexibility and adaptability across various use cases.
- Frontend Utility Functions: A set of utility functions is provided for the frontend, facilitating seamless communication with the backend. These functions are aware of the definitions set in the configuration file, ensuring consistency and ease of use.

## Usage

The core of SWF's functionality lies in its configuration file. Users define their application's structure and behavior in this JSON file, which the framework then interprets to set up the necessary backend and frontend components. This approach eliminates the need for repetitive coding tasks and recompilation, making the development process more efficient and user-friendly.

**Target Audience:**

- SWF is ideal for individuals and teams looking to develop web applications without delving deeply into coding. It's particularly useful for:
- Developers seeking a quick and efficient way to set up both frontend and backend components.
- Non-technical users who need to create web applications without extensive programming knowledge.
- Teams aiming to reduce development time and focus on application design and user experience.

## Contributing

We welcome contributions to the Sticky Web Framework! Whether it's feature enhancements, bug fixes, or documentation improvements, your input is valuable. Please refer to our contributing guidelines for more information on how to participate in the development of SWF.

## Table of Contents

- Development
  - DB
  - Backend
  - Frontend
- How does it work?
- User Guide

---

## Development

### Using Sticky Web Framework Manager

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

To run frontend locally (for hot reloading support):

- `cd <PROJECT_FOLDER>/frontend`
- `npm run dev`

To run backend locally:

- `cd <PROJECT_FOLDER>`
- `dotnet restore` (just once)
- `dotnet run --environment "Development"`

## Database

Download MongoDB Compass and use `mongodb://root:root@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false` connection string to connect.

## Calling backend TO BE REMOVED

- `GET http://localhost:4000/api/companies/648dd88df15a948fdbbdd001`
- `DELETE http://localhost:4000/api/companies/648dd88df15a948fdbbdd001`
- `POST http://localhost:4000/api/companies` (No working?)

## TODO

- File database
- Filtering
- Pagination
- When inserting data to the collection via manager check if initial data actually matches collection's model
- Other config variables should be settable in configuration.json (MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD, BACKEND_PORT, FRONTEND_PORT)
- ClearDatabase should have an option to specify the path to the volume directory
- Registering custom looping services
- Add support for other field types
