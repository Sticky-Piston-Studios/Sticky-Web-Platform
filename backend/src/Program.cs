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

namespace StickyWebBackend
{
    public class Program 
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            Backend backend = new Backend();
            backend.Startup(builder);

            Console.WriteLine("Sticky Web Backend started!");
        }
    }

    public class Backend
    {
        Dictionary<string, Database> databases = new Dictionary<string, Database>();
        Dictionary<string, Func<OkObjectResult>> customActions = new Dictionary<string, Func<OkObjectResult>>();

        public void Startup(WebApplicationBuilder builder)
        {
            // Read configuration            
            ConfigurationManager configuration = builder.Configuration;

            // Add custom actions
            customActions.Add("ExampleCustomAction", CustomActions.ExampleAction);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();

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

            InitializeDynamicConfiguration(app, configuration);



            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                
                app.UseSwagger(option =>
                {   
                    // Json file location (mydomain.com/api/swagger/v1/swagger.json)
                    option.RouteTemplate = "api/swagger/{documentName}/swagger.json";
                });
                app.UseSwaggerUI(option => {
                    // Where to look for json file
                    option.SwaggerEndpoint("/api/swagger/v1/swagger.json", "Backend");

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
            // Read dynamic configuration
            string? dynamicConfigurationPath = configuration.GetValue<string>("DynamicConfigurationPath");

            if (dynamicConfigurationPath == null) 
            {
                throw new Exception("No dynamic configuration path detected in app settings!");
            }

            if (!File.Exists(dynamicConfigurationPath)) 
            {
                throw new Exception($"Dynamic configuration file doesn't exist: {dynamicConfigurationPath}");
            }

            // Read dynamic configuration
            var absoluteConfigurationPath = Path.Combine(Directory.GetCurrentDirectory(), dynamicConfigurationPath);
            DynamicConfiguration? dynamicConfiguration = new ConfigurationBuilder()
                .AddJsonFile(absoluteConfigurationPath, optional: false, reloadOnChange: true)
                .Build().GetSection("Configuration").Get<DynamicConfiguration>();

            if (dynamicConfiguration == null) 
            {
                throw new Exception($"Dynamic configuration file is empty: {dynamicConfigurationPath}");
            }

            // Setup databases
            string? databaseConnectionString = dynamicConfiguration.DatabaseConnectionString;
            if (databaseConnectionString != null && dynamicConfiguration.Databases != null) 
            {
                MongoClient databaseClient = new MongoClient(databaseConnectionString);
                foreach (DatabaseDefinition databaseDefinition in dynamicConfiguration.Databases)
                {
                    Console.WriteLine($"Initializing database: {databaseDefinition.Name}");

                    // Initialize database
                    Database database = new Database()
                    {
                       Value = databaseClient.GetDatabase(databaseDefinition.Name),
                       Collections = new Dictionary<string, IMongoCollection<BsonDocument>>()
                    };

                    // Initialize collections in database
                    foreach (DatabaseCollectionDefinition databaseCollectionDefinition in databaseDefinition.Collections) 
                    {
                        Console.WriteLine($" Initializing database collection: {databaseCollectionDefinition.Name}");
                        database.Collections.Add(databaseCollectionDefinition.Name, database.Value.GetCollection<BsonDocument>(databaseCollectionDefinition.Name));
                    }

                    databases.Add(databaseDefinition.Name, database);
                }
            }

            // Setup endpoints
            foreach (EndpointGroupDefinition endpointGroupDefinition in dynamicConfiguration.EndpointGroups)
            {
                Console.WriteLine($"Initializing endpoint group: {endpointGroupDefinition.Name}");
                string baseEndpointPath = endpointGroupDefinition.Path;

                Console.WriteLine($"Inxx: {endpointGroupDefinition.Path} {endpointGroupDefinition.Endpoints.Count} ");

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
                        default:
                            throw new Exception($"Unknown endpoint method: {endpointDefinition.Method}");
                    }
                }
            }   
        }

        private void CreatePostEndpoint(WebApplication app, DynamicConfiguration dynamicConfiguration, EndpointDefinition endpointDefinition, string baseEndpointPath)
        {
            //throw new NotImplementedException();
        }

        private void CreateGetEndpoint(WebApplication app, DynamicConfiguration dynamicConfiguration, EndpointDefinition endpointDefinition, string baseEndpointPath) 
        {
            Func<string, Task<IActionResult>> handleRequest = async (string id) =>
            {
                EndpointBodyDefinition endpointBodyDefinition = dynamicConfiguration?.EndpointBodies?.First(o => o.Name == endpointDefinition.BodyName);

                // Define dynamic model class to operate on
                if (endpointDefinition.Action.Type == EndpointActionType.Default) 
                {
                    EndpointDefaultActionDefinition endpointDefaultActionDefinition = endpointDefinition.Action as EndpointDefaultActionDefinition;
                    return await DefaultActions.GetAsync(endpointDefaultActionDefinition, databases, id, endpointBodyDefinition);
                }
                else if (endpointDefinition.Action.Type == EndpointActionType.Custom)
                {
                    EndpointCustomActionDefinition endpointCustomActionDefinition = endpointDefinition.Action as EndpointCustomActionDefinition;
                    return customActions[endpointCustomActionDefinition.Name]();
                }
                else
                {
                    throw new Exception($"Unknown endpoint action type: {endpointDefinition.Action.Type}");
                }
            };

            app.MapGet(baseEndpointPath + "/{id}", handleRequest);


            // app.MapGet(baseEndpointPath + "/{id}", async (string id) => {

            // EndpointBodyDefinition endpointBodyDefinition = dynamicConfiguration?.EndpointBodies?.First(o => o.Name == endpointDefinition.BodyName);

            // // Define dynamic model class to operate on
            // if (endpointDefinition.Action.Type == EndpointActionType.Default) 
            // {
            //     EndpointDefaultActionDefinition endpointDefaultActionDefinition = endpointDefinition.Action as EndpointDefaultActionDefinition;
            //     return DefaultActions.GetAsync(endpointDefaultActionDefinition, databases, id, endpointBodyDefinition);
            // }
            // else if (endpointDefinition.Action.Type == EndpointActionType.Custom)
            // {
            //     EndpointCustomActionDefinition endpointCustomActionDefinition = endpointDefinition.Action as EndpointCustomActionDefinition;
            //     return customActions[endpointCustomActionDefinition.Name]();
            // }
            // else
            // {
            //     throw new Exception($"Unknown endpoint action type: {endpointDefinition.Action.Type}");
            // }
            // });
       // }
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
                    System.Reflection.MemberInfo memberInfo = context.Type.GetMember(enumName).FirstOrDefault(m => m.DeclaringType == context.Type);
                    EnumMemberAttribute enumMemberAttribute = memberInfo == null ? null : memberInfo.GetCustomAttributes(typeof(EnumMemberAttribute), false).OfType<EnumMemberAttribute>().FirstOrDefault();
                    string label = enumMemberAttribute == null || string.IsNullOrWhiteSpace(enumMemberAttribute.Value) ? enumName : enumMemberAttribute.Value;
                    model.Enum.Add(new OpenApiString(label));
                }
            }
        }
    }
}

