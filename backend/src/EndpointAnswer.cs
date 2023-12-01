using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using Newtonsoft.Json.Linq;
using System.Text.Json.Nodes;
using MongoDB.Bson.IO;
using System.Text.RegularExpressions;

namespace StickyWebBackend
{
    public enum Status
    {
        Success,
        Failure,
    }

    public class EndpointAnswer<T>
    {
        [EnumDataType(typeof(Status))]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public Status Status { get; set; }

        public string Message { get; set; }

        public T Data { get; set; }

        public EndpointAnswer(Status status, string message = "", T data = default) 
        {
            Status = status;
            Message = message;
            Data = data;
        }

        public EndpointAnswer(T data)
        {
            Status = Status.Failure;
            Message = "";
            Data = data;
        }

        public EndpointAnswer<string?> ConvertToEndpointAnswer<BsonDocument>(Func<BsonDocument?>? dataConversion) 
        {
            if (Status == Status.Success && dataConversion != null) 
            {
                // Convert data to endpoint body
                BsonDocument? data = dataConversion();

                var jsonWriterSettings = new JsonWriterSettings { OutputMode = JsonOutputMode.Shell };
                string? json = data?.ToJson(jsonWriterSettings);

                return new EndpointAnswer<string?>(Status, Message, json); 
            }

            // Convert to EndpointAnswer with empty data
            return new EndpointAnswer<string?>(Status, Message);
        }
    }
}

