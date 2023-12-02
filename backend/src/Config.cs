using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Driver;


namespace StickyWebBackend
{
    public class Database 
    {
        public required IMongoDatabase Value { get; set; }
        public required Dictionary<string, IMongoCollection<BsonDocument>> Collections { get; set; }
    }

    public enum EndpointActionType
    {
        Default,
        Custom,
    }

    public abstract class EndpointActionDefinition
    {
        [EnumDataType(typeof(EndpointActionType))]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public required EndpointActionType Type { get; set; }
    }

    public class EndpointDefaultActionDefinition : EndpointActionDefinition
    {
        public required string DatabaseName { get; set; }
        public required string DatabaseCollectionName { get; set; }
    }

    public class EndpointCustomActionDefinition : EndpointActionDefinition
    {
        public required string Name { get; set; }
    }

    public class DynamicConfiguration
    {
        public string? DatabaseConnectionString { get; set; }
        public List<DatabaseDefinition>? Databases { get; set; }
        public List<EndpointGroupDefinition>? EndpointGroups { get; set; }
        public List<DatabaseModelDefinition>? DatabaseModels { get; set; }
        public List<EndpointBodyDefinition>? EndpointBodies { get; set; }

        public DynamicConfiguration() {}

        public DynamicConfiguration(string dynamicConfigurationFilePath)
        {
            if (!File.Exists(dynamicConfigurationFilePath)) 
            {
                Utils.ErrorExit($"Dynamic configuration file doesn't exist: {dynamicConfigurationFilePath}");
            }

            // Read dynamic configuration
            var absoluteConfigurationPath = Path.Combine(Directory.GetCurrentDirectory(), dynamicConfigurationFilePath);
            string json = File.ReadAllText(absoluteConfigurationPath);

            JsonSerializerOptions options = new JsonSerializerOptions
            {
                Converters = { new EndpointActionDefinitionConverter() },
                PropertyNameCaseInsensitive = true,
            };

            DynamicConfiguration? dynamicConfiguration = null;
            try 
            {
                dynamicConfiguration = JsonSerializer.Deserialize<DynamicConfiguration>(json, options);
            }
            catch (Exception ex)
            {
                Utils.ErrorExit("Json file with dynamic configuration is invalid!", ex);
            }

            if (dynamicConfiguration != null) 
            {
                DatabaseConnectionString = dynamicConfiguration.DatabaseConnectionString;
                Databases = dynamicConfiguration.Databases;
                EndpointGroups = dynamicConfiguration.EndpointGroups; 
                DatabaseModels = dynamicConfiguration.DatabaseModels;
                EndpointBodies = dynamicConfiguration.EndpointBodies;
            }
            else
            {
                Utils.ErrorExit($"Dynamic configuration file is empty: {dynamicConfigurationFilePath}");
            }
        }
    }

    public class DatabaseDefinition {
        public required string Name { get; set; }
        public required List<DatabaseCollectionDefinition> Collections { get; set; }
    }

    public class DatabaseCollectionDefinition
    {
        public required string Name { get; set; }
        public required string Model { get; set; }
    }

    public class FieldDefinition
    {
        public required string Name { get; set; }
        public required string Type { get; set; }
    }

    public class EndpointGroupDefinition
    {
        public required string Name { get; set; }
        public required string Path { get; set; }
        public required List<EndpointDefinition> Endpoints { get; set; }
    }

    public class EndpointDefinition
    {
        public required string Name { get; set; }
        public required string Method { get; set; }
        public string? Subroute { get; set; }

        public string? BodyName { get; set; }

        [JsonConverter(typeof(EndpointActionDefinitionConverter))]
        public required EndpointActionDefinition Action { get; set; }
    }

    public class EndpointBodyDefinition
    {
        public required string Name { get; set; }
        public required List<FieldDefinition> Fields { get; set; }
    }

    public class DatabaseModelDefinition
    {
        public required string Name { get; set; }
        public required List<FieldDefinition> Fields { get; set; }
    }



    public class EndpointActionDefinitionConverter : JsonConverter<EndpointActionDefinition>
    {
        public override EndpointActionDefinition Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            using (JsonDocument doc = JsonDocument.ParseValue(ref reader))
            {
                var root = doc.RootElement;

                // Deserialize the EndpointActionDefinition based on the EndpointActionType
                EndpointActionType endpointActionType;
                Enum.TryParse(root.GetProperty("Type").ToString(), out endpointActionType);


                switch (endpointActionType){    
                    case EndpointActionType.Default:
                        EndpointDefaultActionDefinition DefaultAction;
                        if (!Utils.GetValue(JsonSerializer.Deserialize<EndpointDefaultActionDefinition>(root.GetRawText()), out DefaultAction))
                        {
                            Utils.ErrorExit($"Incorrect configuration of Default action!");
                        }
                        return DefaultAction;
                    case EndpointActionType.Custom:
                        EndpointCustomActionDefinition CustomAction;
                        if (!Utils.GetValue(JsonSerializer.Deserialize<EndpointCustomActionDefinition>(root.GetRawText()), out CustomAction))
                        {
                            Utils.ErrorExit($"Incorrect configuration of Custom action!");
                        }
                        return CustomAction;
                    default:
                        Utils.ErrorExit($"Unknown action type {endpointActionType} in configuration! Use Default or Custom");
                        throw new UnreachableException();
                }
            }
        }

        public override void Write(Utf8JsonWriter writer, EndpointActionDefinition value, JsonSerializerOptions options)
        {
            JsonSerializer.Serialize(writer, value, value.GetType(), options);
        }
    }

}