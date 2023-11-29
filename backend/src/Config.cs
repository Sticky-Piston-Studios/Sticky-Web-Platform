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

    public abstract class EndpointAction
    {
        public required EndpointActionType Type { get; set; }
    }

    public class EndpointDefaultActionDefinition : EndpointAction
    {
        public required string DatabaseName { get; set; }
        public required string DatabaseCollectionName { get; set; }
    }

    public class EndpointCustomActionDefinition : EndpointAction
    {
        public required string Name { get; set; }
    }

    public class EndpointActionConverter : JsonConverter<EndpointAction>
    {
        public override EndpointAction Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var jsonObject = JsonDocument.ParseValue(ref reader).RootElement;

            if (jsonObject.TryGetProperty("Type", out var typeProperty))
            {
                var type = typeProperty.GetString();

                if (type == "Default")
                {
                    return JsonSerializer.Deserialize<EndpointDefaultActionDefinition>(jsonObject.GetRawText())!;
                }
                else if (type == "Custom")
                {
                    return JsonSerializer.Deserialize<EndpointCustomActionDefinition>(jsonObject.GetRawText())!;
                }
            }

            throw new JsonException();
        }

        public override void Write(Utf8JsonWriter writer, EndpointAction value, JsonSerializerOptions options)
        {
            throw new NotImplementedException();
        }
    }


    public class DynamicConfiguration
    {
        public string? DatabaseConnectionString { get; set; }
        public List<DatabaseDefinition>? Databases { get; set; }
        public List<EndpointGroupDefinition>? EndpointGroups { get; set; }
        public List<DatabaseModelDefinition>? DatabaseModels { get; set; }
        public List<EndpointBodyDefinition>? EndpointBodies { get; set; }
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
        public required EndpointAction Action { get; set; }
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