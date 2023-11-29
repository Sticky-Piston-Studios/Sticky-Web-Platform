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
            FilterDefinition<BsonDocument> filter = Builders<BsonDocument>.Filter.Eq("id", id);
            StickyWebBackend.EndpointAnswer<BsonDocument> fetchResult = await StickyWebBackend.DatabaseUtils.FetchItemFromCollection(collection, filter);

            // Convert result to endpoint body
            Func<BsonDocument> dataConversion = () => { return fetchResult.Data.MapToEndpointBody(endpointBodyDefinition); };
            StickyWebBackend.EndpointAnswer<BsonDocument> endpointAnswer = fetchResult.ConvertToEndpointAnswer(dataConversion);

            // Return
            return new OkObjectResult(endpointAnswer);
        }
    }
}