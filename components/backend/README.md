# Sticky Web Backend

Developed by Sticky Piston Studion, **Sticky Web Backend** is a universal, open-source platform revolutinising the creation of API backend application by offering a no-code, no-recompilation, dynamically-configurabl system built with ASP.NET. It is designed with the vision of democratizing API creation, making it approachable and user-friendly for individuals with minimal to no programming skills. Full configurability via a text config file, in combination with its generic achitecture, greately reduces the need for any code changes.

## Features

- No-code: You don't need to write any code to set up your backend.
- Fully configurable: All configuration is done through a simple config file.
- Dynamic setup: The backend sets up dynamically based on the config file.
- Open-source: You can view and modify the source code to suit your needs.
- Simpliticty: A clean base to build upon, in case some additional logic is to be added.

## Installation

TODO

## Usage

TODO

## Contributing

We welcome contributions! Please see our [contributing guidelines](LINK_TO_GUIDELINES) for more details.

## License

This project is open-source and is licensed under the [MIT License](LINK_TO_LICENSE).


## Documentation
Available at: TODO

Local generation:
1. `choco install docfx`
2. `docfx build .\docs\docfx.json`
3. `docfx .\docs\docfx.json --serve` 
4. Preview at [](http://localhost:8080)

## Development
`dotnet run --environment "Development"`

## Dynamic configuration
Dynamic configuration is stored in `config.json` file.
In development build app will fetch it from project's parent folder 
In release build app will fetch it from folder in which it is executed TODO
(Unless changed in appsettings)

## Running
`dotnet restore`
`dotnet run --environment "Development"`

## Testing
This project is using NUnit testing platform.  
Install ".NET Core Test Explorer" extension to perform tests in VS Code.  
Make sure that your VS Code settings have `"dotnet-test-explorer.testProjectPath": "./backend/tests/*.csproj"` added. Tests won't be detected and presented in testing panel without it.  