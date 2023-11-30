
# Sticky Web Framework

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



To run all containers: 
- `cd <PROJECT_FOLDER>` 
- `docker compose -f "docker-compose.yaml" up database backend frontend nginx -d --build`

To run frontend locally (for hot reloading support):
- `cd <PROJECT_FOLDER>/frontend` 
- `npm run dev`

To run backend locally:
- `cd <PROJECT_FOLDER>`
- `dotnet restore` (just once)
- `dotnet run --environment "Development"` 

Or to run frontend locally in docker container (outside of docker compose):
- `cd <PROJECT_FOLDER>/frontend`
- `docker build -t frontend_otwockapp -f Dockerfile.development .`
- `docker run -it --rm -p 3000:3000 --name jellyfish-otwockapp frontend_otwockapp`

## Database
Download MongoDB Compass and use `mongodb://root:root@localhost:27017/` connection string to connect

## TODO
- File database
- Filtering
- Pagination
- When inserting data to the collection via manager check if initial data actually matches collection's model
- Other config variables should be settable in configuration.json (MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD, BACKEND_PORT, FRONTEND_PORT)
- ClearDatabase should have an option to specify the path to the volume directory