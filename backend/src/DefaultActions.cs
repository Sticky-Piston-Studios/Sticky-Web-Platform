using MongoDB.Bson;
using MongoDB.Driver;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson.Serialization.Serializers;

namespace StickyWebBackend
{
    public static class DefaultActions 
    {
        public static async Task<OkObjectResult> GetAsync(
            EndpointDefaultActionDefinition actionDefinition, 
            Dictionary<string, Database> databases, 
            string id, 
            EndpointBodyDefinition endpointBodyDefinition
        ) {
            // Find required database and collection
            Database database = databases[actionDefinition.DatabaseName];
            IMongoCollection<BsonDocument> collection = database.Collections[actionDefinition.DatabaseCollectionName]; 

            // Fetch item from database
            FilterDefinition<BsonDocument> filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(id));
            EndpointAnswer<BsonDocument> fetchResult = await DatabaseUtils.FetchItemFromCollection(collection, filter);

            // Convert result to endpoint body
            Func<BsonDocument> dataConversion = () => { return fetchResult.Data.MapToEndpointBody(endpointBodyDefinition); };
            EndpointAnswer<BsonDocument> endpointAnswer = fetchResult.ConvertToEndpointAnswer(dataConversion);

            // Return
            return new OkObjectResult(endpointAnswer);
        }

        public static async Task<OkObjectResult> PostAsync(
            EndpointDefaultActionDefinition actionDefinition, 
            Dictionary<string, Database> databases, 
            string id, 
            EndpointBodyDefinition endpointBodyDefinition
        ) {
            // Find required database and collection
            Database database = databases[actionDefinition.DatabaseName];
            IMongoCollection<BsonDocument> collection = database.Collections[actionDefinition.DatabaseCollectionName]; 

            BsonDocument addResult = await DatabaseUtils.AddItemToCollection<BsonDocument>(collection, new BsonDocument());

            EndpointAnswer<BsonDocument> endpointAnswer = new EndpointAnswer<BsonDocument>(Status.Success, "", addResult);

            // Return
            return new OkObjectResult(endpointAnswer);
        }

        public static async Task<OkObjectResult> DeleteAsync(
            EndpointDefaultActionDefinition actionDefinition, 
            Dictionary<string, Database> databases, 
            string id, 
            EndpointBodyDefinition endpointBodyDefinition
        ) {
            // Find required database and collection
            Database database = databases[actionDefinition.DatabaseName];
            IMongoCollection<BsonDocument> collection = database.Collections[actionDefinition.DatabaseCollectionName]; 

            bool deleteResult = await DatabaseUtils.DeleteItemFromCollection<BsonDocument>(collection, id);
            
            // Return
            if (deleteResult) 
            {
                return new OkObjectResult(new EndpointAnswer<bool>(Status.Success, ""));
            }
            else
            {
                return new OkObjectResult(new EndpointAnswer<bool>(Status.Failure, $"Event with id {id} was not found"));  
            }
        }
    }
}