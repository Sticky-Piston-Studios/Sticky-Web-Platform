using MongoDB.Bson;
using MongoDB.Driver;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson.Serialization.Serializers;
using Newtonsoft.Json.Linq;
using System.Text.Json.Nodes;
using Newtonsoft.Json;

namespace StickyWebBackend
{
    public static class DefaultActions 
    {
        public static async Task<OkObjectResult> GetAsync(
            EndpointDefaultActionDefinition actionDefinition, 
            Dictionary<string, Database> databases, 
            EndpointBodyDefinition? endpointBodyDefinition,
            string id
        ) {
            // Find required database and collection
            Database database = databases[actionDefinition.DatabaseName];
            IMongoCollection<BsonDocument> collection = database.Collections[actionDefinition.DatabaseCollectionName]; 

            // Fetch item from database
            FilterDefinition<BsonDocument> filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(id));
            EndpointAnswer<BsonDocument> fetchResult = await DatabaseUtils.FetchItemFromCollection(collection, filter);

            // Convert result to endpoint body
            Func<BsonDocument?> dataConversion = () => { 
                return endpointBodyDefinition == null ? fetchResult.Data : fetchResult.Data.MapToEndpointBody(endpointBodyDefinition);
            };
            EndpointAnswer<string?> endpointAnswer = fetchResult.ConvertToEndpointAnswer(dataConversion);

            // Return
            return new OkObjectResult(endpointAnswer);
        }

        public static async Task<OkObjectResult> PostAsync(
            EndpointDefaultActionDefinition actionDefinition, 
            Dictionary<string, Database> databases, 
            EndpointBodyDefinition? endpointBodyDefinition,
            string requestBody
        ) {
            // Find required database and collection
            Database database = databases[actionDefinition.DatabaseName];
            IMongoCollection<BsonDocument> collection = database.Collections[actionDefinition.DatabaseCollectionName]; 

            BsonDocument addResult = await DatabaseUtils.AddItemToCollection<BsonDocument>(collection, BsonDocument.Parse(requestBody));

            EndpointAnswer<BsonDocument> endpointAnswer = new EndpointAnswer<BsonDocument>(Status.Success, "", addResult);

            // Return
            return new OkObjectResult(endpointAnswer);
        }

        public static async Task<OkObjectResult> DeleteAsync(
            EndpointDefaultActionDefinition actionDefinition, 
            Dictionary<string, Database> databases, 
            EndpointBodyDefinition? endpointBodyDefinition,
            string id
        ) {
            // Find required database and collection
            Database database = databases[actionDefinition.DatabaseName];
            IMongoCollection<BsonDocument> collection = database.Collections[actionDefinition.DatabaseCollectionName]; 

            bool deleteResult = await DatabaseUtils.DeleteItemFromCollection<BsonDocument>(collection, id);
            
            // Return
            if (deleteResult) 
            {
                return new OkObjectResult(new EndpointAnswer<string?>(Status.Success, ""));
            }
            else
            {
                return new OkObjectResult(new EndpointAnswer<string?>(Status.Failure, $"Event with id {id} was not found"));  
            }
        }
    }
}