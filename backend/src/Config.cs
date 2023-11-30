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

    

    public class EndpointActionDefinitionConverter : JsonConverter<EndpointActionDefinition>
{
    public override EndpointActionDefinition Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using (JsonDocument doc = JsonDocument.ParseValue(ref reader))
        {
            var root = doc.RootElement;
            var type = root.GetProperty("Type").GetString();

            return type switch
            {
                "Default" => JsonSerializer.Deserialize<EndpointDefaultActionDefinition>(root.GetRawText(), options),
                "Custom" => JsonSerializer.Deserialize<EndpointCustomActionDefinition>(root.GetRawText(), options),
                _ => throw new NotSupportedException($"Unsupported EndpointActionType: {type}")
            };
        }
    }

    public override void Write(Utf8JsonWriter writer, EndpointActionDefinition value, JsonSerializerOptions options)
    {
        // For simplicity, let's assume we only need to serialize from the object to JSON,
        // and not the reverse. If bidirectional serialization is required, additional
        // logic for the Write method should be implemented.
        throw new NotImplementedException();
    }
}

public class EndpointActionDefinitionConverteraX : JsonConverter<EndpointActionDefinition>
{
    public override EndpointActionDefinition Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using (JsonDocument doc = JsonDocument.ParseValue(ref reader))
        {
            var root = doc.RootElement;
            if (root.TryGetProperty("Type", out var typeProperty))
            {
                if (typeProperty.ValueKind == JsonValueKind.String)
                {
                    string typeString = typeProperty.GetString();
                    return typeString switch
                    {
                        "Default" => JsonSerializer.Deserialize<EndpointDefaultActionDefinition>(root.GetRawText(), options),
                        "Custom" => JsonSerializer.Deserialize<EndpointCustomActionDefinition>(root.GetRawText(), options),
                        _ => throw new JsonException($"Unexpected 'Type' value: {typeString}"),
                    };
                }
                else
                {
                    throw new JsonException($"Unexpected 'Type' value type: {typeProperty.ValueKind}");
                }
            }
            throw new JsonException("Missing 'Type' property");
        }
    }

    public override void Write(Utf8JsonWriter writer, EndpointActionDefinition value, JsonSerializerOptions options)
    {
        JsonSerializer.Serialize(writer, value, value.GetType(), options);
    }
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
                throw new Exception($"Dynamic configuration file doesn't exist: {dynamicConfigurationFilePath}");
            }

            // Read dynamic configuration
            var absoluteConfigurationPath = Path.Combine(Directory.GetCurrentDirectory(), dynamicConfigurationFilePath);
            string json = File.ReadAllText(absoluteConfigurationPath);


           // DynamicConfiguration endpoint = JsonConverter. JsonConvert.DeserializeObject<DynamicConfiguration>(json);
            
            DynamicConfiguration dynamicConfiguration = JsonSerializer.Deserialize<DynamicConfiguration>(json, new JsonSerializerOptions
            {
                 Converters = { new EndpointActionDefinitionConverteraX() },
                PropertyNameCaseInsensitive = true,
            });

            // DynamicConfiguration dynamicConfiguration = JsonSerializer.Deserialize<DynamicConfiguration>(json, new JsonSerializerOptions
            // {
            //     Converters = { new EndpointActionDefinitionConverter() },
            //     PropertyNameCaseInsensitive = true, // Use this if your JSON has different casing
            //     // Add other options as needed
            // });


            // DynamicConfiguration configuration = JsonSerializer.Deserialize<DynamicConfiguration>(json, new JsonSerializerOptions
            // {
            //     Converters = { new EndpointActionDefinitionConverter() },
            //     PropertyNameCaseInsensitive = true, // Use this if your JSON has different casing
            //     // Add other options as needed
            // });


            // DynamicConfiguration? dynamicConfiguration = new ConfigurationBuilder()
            //     .AddJsonFile(absoluteConfigurationPath, optional: false, reloadOnChange: true)
            //     .Build().GetSection("Configuration").Get<DynamicConfiguration>();

            if (dynamicConfiguration == null) 
            {
                throw new Exception($"Dynamic configuration file is empty: {dynamicConfigurationFilePath}");
            }

            DatabaseConnectionString = dynamicConfiguration.DatabaseConnectionString;
            Databases = dynamicConfiguration.Databases;
            EndpointGroups = dynamicConfiguration.EndpointGroups; 
            DatabaseModels = dynamicConfiguration.DatabaseModels;
            EndpointBodies = dynamicConfiguration.EndpointBodies;
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
        public required string BodyName { get; set; }
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
}