using System;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using MongoDB.Bson;
using Swashbuckle.AspNetCore.SwaggerGen;
using MongoDB.Driver;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;
using System.Diagnostics;
using System.Reflection;

namespace StickyWebBackend
{
    public class Program 
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            Console.WriteLine("Sticky Web Backend starting!");

            Backend backend = new Backend();
            backend.Startup(builder);
        }
    }

    public class Backend
    {
        Dictionary<string, Database> databases = new Dictionary<string, Database>();
       // Dictionary<string, Func<OkObjectResult, int>> customActions = new Dictionary<string, Func<OkObjectResult>>();
        Dictionary<string, CustomAction> customActions = new Dictionary<string, CustomAction>();

        public void Startup(WebApplicationBuilder builder)
        {
            // Read configuration            
            ConfigurationManager configuration = builder.Configuration;

            // Load plugin DLL
            string dllPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Plugin.dll");
            Assembly pluginAssembly = Assembly.LoadFrom(dllPath);
            foreach (Type type in pluginAssembly.GetTypes())
            {
                if (typeof(IPlugin).IsAssignableFrom(type))
                {
                    IPlugin? pluginInstance = null;
                    object? pluginInstanceObject = Activator.CreateInstance(type);
                    if (pluginInstanceObject != null)
                    {
                        pluginInstance = (IPlugin)pluginInstanceObject;
                    }

                    // Register custom actions from the plugin
                    if (pluginInstance != null)
                    {
                        Console.WriteLine("Registering custom actions from the plugin");
                        pluginInstance.RegisterCustomEndpointActions((string key, CustomAction action) => { customActions[key] = action; });
                    }
                   
                    break;
                }
            }
            
            // Swagger
            builder.Services.AddSwaggerGen(c =>
            {
                c.SchemaFilter<EnumSchemaFilter>(); // Display enum variables of model as strings instead of integers
                c.EnableAnnotations(); // Enable endpoints annotations
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Backend", Version = "v1" });
                var securityScheme = new OpenApiSecurityScheme
                {
                    Name = "JWT Authentication",
                    Description = "Enter JWT Bearer token **_only_**",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer", // must be lower case
                    BearerFormat = "JWT",
                    Reference = new OpenApiReference
                    {
                        Id = JwtBearerDefaults.AuthenticationScheme,
                        Type = ReferenceType.SecurityScheme
                    }
                };
                c.AddSecurityDefinition(securityScheme.Reference.Id, securityScheme);
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {securityScheme, new string[] { }}
                });
            });


            var app = builder.Build();
            Console.WriteLine($"Running in mode: " + (app.Environment.IsDevelopment() ? "Development" : "Production"));

            InitializeDynamicConfiguration(app, configuration);


            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();

                Console.WriteLine("Enabling Swagger");
                
                app.UseSwagger(option =>
                {   
                    // Json file location (mydomain.com/api/swagger/v1/swagger.json)
                    option.RouteTemplate = "api/swagger/{documentName}/swagger.json";
                });
                app.UseSwaggerUI(option => {
                    // Where to look for json file
                    option.SwaggerEndpoint("/api/swagger/v1/swagger.json", "Sticky-Web-Backend");

                    // Prefix in the URL of the UI (mydomain.com/api/swagger/index.html)
                    option.RoutePrefix = "api/swagger";
                });

                // Enable CORS to allow requests from any origin, method, and header
                app.UseCors(builder =>
                {
                    builder.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            }


            //app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors();

            // Creates user identity
            app.UseAuthentication();

            // Responsible for enforcing access control rules based on the authenticated user's identity
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }

        public void InitializeDynamicConfiguration(WebApplication app, IConfiguration configuration) 
        {
            Console.WriteLine("Initializing dynamic configuration");

            // Read project configuration to get path to dynamic configuration file
            string dynamicConfigurationFilePath;
            if (!Utils.GetValue(configuration.GetValue<string>("DynamicConfigurationPath"), out dynamicConfigurationFilePath))
            {
                Utils.ErrorExit($"No path to dynamic configuration file detected in app settings!");
            }

            DynamicConfiguration dynamicConfiguration = new DynamicConfiguration(dynamicConfigurationFilePath);

            // Set base path
            app.UsePathBase(dynamicConfiguration.BasePath + "/backend");

            InitializeDatabases(dynamicConfiguration);
            InitializeEndpoints(app, dynamicConfiguration);
        }

        public void InitializeDatabases(DynamicConfiguration dynamicConfiguration)
        {
             // Setup databases
            string? databaseConnectionString = dynamicConfiguration.DatabaseConnectionString;
            if (databaseConnectionString != null && dynamicConfiguration.Databases != null) 
            {
                MongoClientSettings MongoClientSettings = MongoClientSettings.FromConnectionString(databaseConnectionString);
                MongoClientSettings.ConnectTimeout = TimeSpan.FromSeconds(5);
                MongoClientSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(5);
                MongoClientSettings.SocketTimeout = TimeSpan.FromSeconds(5);

                MongoClient databaseClient = new MongoClient(MongoClientSettings);

                if (databaseClient == null)
                {
                    Utils.ErrorExit($"Could not connect to the database!\nMake sure database is running and connection string is valid");
                    throw new UnreachableException();
                }

                Console.WriteLine($"Connected to mongo database container");


                foreach (DatabaseDefinition databaseDefinition in dynamicConfiguration.Databases)
                {
                    Console.WriteLine($"Initializing database: {databaseDefinition.Name}");

                    // Initialize database
                    IMongoDatabase mongoDatabase = databaseClient.GetDatabase(databaseDefinition.Name);
                    if (mongoDatabase == null)
                    {
                        Utils.ErrorExit($"Could not find database {databaseDefinition.Name}!");
                        throw new UnreachableException();
                    }

                    Database database = new Database()
                    {
                       Value = mongoDatabase,
                       Collections = new Dictionary<string, IMongoCollection<BsonDocument>>()
                    };

                    // Initialize collections in database
                    foreach (DatabaseCollectionDefinition databaseCollectionDefinition in databaseDefinition.Collections) 
                    {
                        Console.WriteLine($" Initializing database collection: {databaseCollectionDefinition.Name}");

                        IMongoCollection<BsonDocument> mongoCollection = database.Value.GetCollection<BsonDocument>(databaseCollectionDefinition.Name);
                        if (mongoDatabase == null)
                        {
                            Utils.ErrorExit($"Could not find collection {databaseCollectionDefinition.Name} in database {databaseDefinition.Name}!");
                        }

                        database.Collections.Add(databaseCollectionDefinition.Name, mongoCollection);
                    }

                    databases.Add(databaseDefinition.Name, database);
                }
            }
        }

        public void InitializeEndpoints(WebApplication app,  DynamicConfiguration dynamicConfiguration)
        {
            List<EndpointGroupDefinition> endpointGroups = new List<EndpointGroupDefinition>();
            if (dynamicConfiguration.EndpointGroups == null || dynamicConfiguration.EndpointGroups.Count == 0) 
            {
                Console.WriteLine($"No endpoint groups to create detected in the dynamic configuration");
                return;
            }
            else
            {
                endpointGroups.AddRange(dynamicConfiguration.EndpointGroups);
            }

            // Setup endpoints
            foreach (EndpointGroupDefinition endpointGroupDefinition in endpointGroups)
            {
                Console.WriteLine($"Initializing endpoint group: {endpointGroupDefinition.Name}");

                string baseEndpointPath;
                if (!Utils.GetValue(endpointGroupDefinition.Path, out baseEndpointPath))
                {
                    Utils.ErrorExit($"Incorrect endpoint group path {endpointGroupDefinition.Name}!");
                }    

                foreach (EndpointDefinition endpointDefinition in endpointGroupDefinition.Endpoints)
                {
                    Console.WriteLine($" Initializing endpoint: {endpointDefinition.Name}");

                    // Create endpoint that will simply return DTO created from an entry fetched from the database
                    switch (endpointDefinition.Method)
                    {
                        case "GET":
                            CreateGetEndpoint(app, dynamicConfiguration, endpointDefinition, baseEndpointPath);
                            break;
                        case "POST":
                            CreatePostEndpoint(app, dynamicConfiguration, endpointDefinition, baseEndpointPath);
                            break;
                        case "DELETE":
                            CreateDeleteEndpoint(app, dynamicConfiguration, endpointDefinition, baseEndpointPath);
                            break;
                        default:
                            Utils.ErrorExit($"Unknown endpoint method {endpointDefinition.Method} for endpoint {endpointDefinition.Name}");
                            break;
                    }
                }
            }   
        }

        private void CreateGetEndpoint(WebApplication app, DynamicConfiguration dynamicConfiguration, EndpointDefinition endpointDefinition, string baseEndpointPath) 
        {
            if (endpointDefinition.Subroute != null)
            {
                app.MapGet($"{baseEndpointPath}/{endpointDefinition.Subroute}", GetHandleRequestFunction(dynamicConfiguration, endpointDefinition));
            }
            else
            {
                app.MapGet(baseEndpointPath, GetHandleRequestFunction(dynamicConfiguration, endpointDefinition));
            }
        }

        private void CreatePostEndpoint(WebApplication app, DynamicConfiguration dynamicConfiguration, EndpointDefinition endpointDefinition, string baseEndpointPath)
        {
            app.MapPost(baseEndpointPath, GetHandleRequestFunction(dynamicConfiguration, endpointDefinition));
        }

        private void CreateDeleteEndpoint(WebApplication app, DynamicConfiguration dynamicConfiguration, EndpointDefinition endpointDefinition, string baseEndpointPath)
        {
            app.MapDelete(baseEndpointPath + "/{id}", GetHandleRequestFunction(dynamicConfiguration, endpointDefinition));  
        }

        private Func<HttpContext, Task<IActionResult>> GetHandleRequestFunction(DynamicConfiguration dynamicConfiguration, EndpointDefinition endpointDefinition) 
        {
            Func<HttpContext, Task<IActionResult>> handleRequest = async (HttpContext context) =>
            {
                //context.Response.Headers.Add("Content-Type", "application/json");

                // Find endpoint body that this endpoint should use
                List<EndpointBodyDefinition> endpointBodies;
                if (!Utils.GetValue(dynamicConfiguration.EndpointBodies, out endpointBodies))
                {
                    Utils.ErrorExit($"No endpoint bodies detected in the dynamic configuration!");
                }    

                // Find request body definition
                EndpointBodyDefinition? endpointRequestBodyDefinition = null;
                if (endpointDefinition.RequestBodyName != null)
                {
                    if (!Utils.GetValue(endpointBodies.Find(o => o.Name == endpointDefinition.RequestBodyName), out endpointRequestBodyDefinition))
                    {
                        Utils.ErrorExit($"No request endpoint body name detected for endpoint {endpointDefinition.Name} in the dynamic configuration!");
                    }
                }

                // Find response body definition
                EndpointBodyDefinition? endpointResponseBodyDefinition = null;
                if (endpointDefinition.ResponseBodyName != null)
                {
                    if (!Utils.GetValue(endpointBodies.Find(o => o.Name == endpointDefinition.ResponseBodyName), out endpointResponseBodyDefinition))
                    {
                        Utils.ErrorExit($"No response endpoint body name detected for endpoint {endpointDefinition.Name} in the dynamic configuration!");
                    }
                }

                // Read action definition from the config
                EndpointActionDefinition endpointActionDefinition;
                if (!Utils.GetValue(endpointDefinition.Action, out endpointActionDefinition))
                {
                    Utils.ErrorExit($"No endpoint action detected for endpoint {endpointDefinition.Name} in the dynamic configuration!");
                }
    
                // Perform default action
                if (endpointDefinition.Action.Type == EndpointActionType.Default) 
                {
                    // Read default action definition from the config
                    EndpointDefaultActionDefinition? endpointDefaultActionDefinition = endpointDefinition.Action as EndpointDefaultActionDefinition;
                    if (endpointDefaultActionDefinition == null)
                    {
                        Utils.ErrorExit($"Wrong setup for default endpoint action detected for endpoint {endpointDefinition.Name} in the dynamic configuration!");
                    }

                    switch(endpointDefinition.Method) 
                    {
                        case "GET":
                        {
                            string? id = context.Request.RouteValues["id"] as string;
                            // TODO: not sure if this is the best way to do this
                            if (string.IsNullOrEmpty(id)) 
                            {
                                return await DefaultActions.GetAsyncAll(endpointDefaultActionDefinition, databases, endpointRequestBodyDefinition, endpointResponseBodyDefinition);
                            } 
                            else 
                            {   
                                return await DefaultActions.GetAsync(endpointDefaultActionDefinition, databases, endpointRequestBodyDefinition, endpointResponseBodyDefinition, id);
                            }
                        }
                        case "POST":
                        {
                            StreamReader reader = new StreamReader(context.Request.Body, Encoding.UTF8);
                            string requestBody = await reader.ReadToEndAsync();
                            return await DefaultActions.PostAsync(endpointDefaultActionDefinition, databases, endpointRequestBodyDefinition, endpointResponseBodyDefinition, requestBody);
                        }
                        case "DELETE":
                        {
                            string? id = context.Request.RouteValues["id"] as string;
                            return await DefaultActions.DeleteAsync(endpointDefaultActionDefinition, databases, endpointRequestBodyDefinition, endpointResponseBodyDefinition, id);
                        }
                        default:
                        {
                            Utils.ErrorExit($"Unknown endpoint method {endpointDefinition.Method} for endpoint {endpointDefinition.Name}");
                            throw new UnreachableException();
                        }
                    }
                
                    throw new UnreachableException();
                }
                else if (endpointDefinition.Action.Type == EndpointActionType.Custom)
                {
                    // Read custom action definition from the config
                    EndpointCustomActionDefinition? endpointCustomActionDefinition = endpointDefinition.Action as EndpointCustomActionDefinition;
                    if (endpointCustomActionDefinition != null)
                    {
                        // Get custom action registered in the plugin DLL
                        if (customActions.TryGetValue(endpointCustomActionDefinition.Name, out var customAction))
                        {
                            return await customAction(databases, endpointRequestBodyDefinition, endpointResponseBodyDefinition);
                        }
                    }
                    else
                    {
                        Utils.ErrorExit($"Wrong setup for custom endpoint action detected for endpoint {endpointDefinition.Name} in the dynamic configuration!");
                        throw new UnreachableException();
                    }
                }
               
                Utils.ErrorExit($"Unknown endpoint action type: {endpointDefinition.Action.Type}");
                throw new UnreachableException();
            };

            return handleRequest;
        }
    }

    // Needed to display enum variables of model as strings instead of integers
    public class EnumSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema model, SchemaFilterContext context)
        {
            if (context.Type.IsEnum)
            {
                model.Type = "string";
                model.Format = null;
                model.Enum.Clear();
                foreach (string enumName in Enum.GetNames(context.Type))
                {
                    System.Reflection.MemberInfo? memberInfo = context.Type.GetMember(enumName).FirstOrDefault(m => m.DeclaringType == context.Type);
                    EnumMemberAttribute? enumMemberAttribute = memberInfo == null ? null : memberInfo.GetCustomAttributes(typeof(EnumMemberAttribute), false).OfType<EnumMemberAttribute>().FirstOrDefault();
                    
                    if (memberInfo == null || enumMemberAttribute == null)
                    {
                        throw new Exception();
                    }

                    string label = enumMemberAttribute == null || string.IsNullOrWhiteSpace(enumMemberAttribute.Value) ? enumName : enumMemberAttribute.Value;
                    model.Enum.Add(new OpenApiString(label));
                }
            }
        }
    }
}

