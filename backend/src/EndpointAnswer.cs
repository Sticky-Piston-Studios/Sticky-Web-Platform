using System;
using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using MongoDB.Bson;

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

        public EndpointAnswer<U> ConvertToEndpointAnswer<U>(Func<U>? dataConversion) 
        {
            if (Status == Status.Success) 
            {
                if (dataConversion != null) 
                {
                    return new EndpointAnswer<U>(Status, Message, dataConversion()); 
                }
                else
                {
                    if (typeof(T) == typeof(U))
                    {
                        throw new Exception($"Conversion of {typeof(T)} to {typeof(U)} is unncesessary");
                    }
                }
            }

            // Convert to EndpointAnswer with empty data
            return new EndpointAnswer<U>(Status, Message);
        }
    }
}

