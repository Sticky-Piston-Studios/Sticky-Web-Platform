using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Text.Json;
using System.Linq;
using System.Text.Json.Serialization;
using System.Diagnostics;
using Microsoft.IdentityModel.Tokens;


namespace StickyWebBackend
{
    public interface IDataFilter<T>
    {
        public abstract FilterDefinition<T> GetFilter();
        public abstract IEnumerable<T> FilterEventsByLocation(IEnumerable<T> events);
    }

    public class DataSorter
    {
        // Data field by which to sort
        public string SortProperty { get; set; } 
        
        // Direction of filtering
        public bool Ascending { get; set; }

        public DataSorter()
        {
            this.SortProperty = String.Empty;
            this.Ascending = true;
        }

        public DataSorter(string sortProperty, bool ascending, string defaultSortProperty)
        {
            this.SortProperty = string.IsNullOrEmpty(sortProperty) ? defaultSortProperty : sortProperty;
            this.Ascending = ascending;
        }
    }

    public class PaginationFilter
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }

        public PaginationFilter()
        {
            this.PageNumber = 1;
            this.PageSize = 5;
        }

        public PaginationFilter(int pageNumber, int pageSize)
        {
            this.PageNumber = pageNumber < 1 ? 1 : pageNumber;
            this.PageSize = pageSize > 15 ? 15 : pageSize;
        }
    }

    public static class Utils 
    {
        public static DateTime GetTimezonedDateTimeNow(string timeZone)
        {
            TimeZoneInfo timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(timeZone);
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneInfo);
        }

        public static void ErrorExit(string message, Exception? exception = null)
        {
            string finalMessage = $"ERROR: {message}";

            if (exception != null)
            {
                int index = exception.Message.IndexOf("Unhandled exception.");
                string exceptionMessage = index != -1 ? exception.Message.Substring(0, index).Trim() : exception.Message;
                finalMessage += $"\n{exceptionMessage}";
            }
          
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine(finalMessage);
            Console.ResetColor();

            Environment.Exit(1);
            throw new UnreachableException();
        }

        public static bool GetValue<T>(T? nullableValue, out T Value, string message = "", Exception? exception = null)  
        {
            #pragma warning disable CS8601
            Value = nullableValue;
            #pragma warning restore CS8601

            return !(nullableValue == null || (nullableValue is string && (nullableValue as string).IsNullOrEmpty()));
        }
    }

    public class StickyException: Exception
    {
        bool printStackTrace;

        public StickyException(string message, bool printStackTrace = false) : base(message) 
        { 
            this.printStackTrace = printStackTrace;
        }

        // Return stack trace if set and exist
        public override string StackTrace 
        {
            get 
            { 
                return printStackTrace ? (base.StackTrace != null ? base.StackTrace : string.Empty) : string.Empty; 
            }
        }
    }

    public static class BsonDocumentExtensions
    {
        public static BsonDocument MapToEndpointBody(this BsonDocument inputDocument, EndpointBodyDefinition endpointBodyDefinition)
        {
            var output = new BsonDocument();

            foreach (FieldDefinition field in endpointBodyDefinition.Fields)
            {   
                bool success = inputDocument.TryGetValue(field.Name, out BsonValue fieldValue);
                output.Add(field.Name, success ? fieldValue : BsonValue.Create(null));
            }

            return output;
        }
    }
 
    public class PageDTO<T> {
        
        public required List<T> Items { get; set; }

        public int CurrentPage { get; set; }

        public int TotalItemCount { get; set; }

        public int TotalPageCount { get; set; }
    }

    public static class DatabaseUtils 
    {
        public static async Task<EndpointAnswer<T>> FetchItemFromCollection<T>(IMongoCollection<T> collection, FilterDefinition<T> filter)
        {
            try 
            {
                T item = await collection.Find(filter).FirstOrDefaultAsync();

                if (item == null) 
                {
                    return new EndpointAnswer<T>(Status.Failure, "Item for given search criteria wasn't found");        
                }

                return new EndpointAnswer<T>(Status.Success, "", item);
            }
            catch (Exception ex)
            {
                return new EndpointAnswer<T>(Status.Failure, $"Database error while fetching item from collection. Message: {ex.Message}");
            }
        }

        public static async Task<(List<T> items, int totalItemCount)> FetchItemsFromCollection<T>(IMongoCollection<T> collection, IDataFilter<T> dataFilter, DataSorter dataSorter, PaginationFilter paginationFilter)
        {
            var filter = dataFilter.GetFilter();
            var findOptions = new FindOptions<T>
            {
                Sort = dataSorter.Ascending ? Builders<T>.Sort.Ascending(dataSorter.SortProperty) : Builders<T>.Sort.Descending(dataSorter.SortProperty),
                Skip = (paginationFilter.PageNumber - 1) * paginationFilter.PageSize,
                Limit = paginationFilter.PageSize,
            };

            var filteredItemsCursor = await collection.FindAsync(filter, findOptions);
            var filteredItems = await filteredItemsCursor.ToListAsync();
            
            int filteredItemCount = (int)collection.CountDocuments(filter);

            return (filteredItems, filteredItemCount);
        }

        public static async Task<T> AddItemToCollection<T>(IMongoCollection<T> collection, T item)
        {
            await collection.InsertOneAsync(item);
            return item;
        }

        public static async Task<bool> DeleteItemFromCollection<T>(IMongoCollection<T> collection, string id)
        {
            var filter = Builders<T>.Filter.Eq("_id", ObjectId.Parse(id));
            var result = await collection.DeleteOneAsync(filter);

            return result.DeletedCount == 1;
        }
    
        public static async Task<EndpointAnswer<T>> ReplaceItemInCollection<T>(IMongoCollection<T> collection, string id, T newItem)
        {
            try 
            {
                var filter = Builders<T>.Filter.Eq("_id", ObjectId.Parse(id));
                var replaceOptions = new FindOneAndReplaceOptions<T>
                {
                    ReturnDocument = ReturnDocument.After
                };
                var item = await collection.FindOneAndReplaceAsync(filter, newItem, replaceOptions);

                if (item == null) 
                {
                    return new EndpointAnswer<T>(Status.Failure, $"Failed to replace item {id} in collection");        
                }

                return new EndpointAnswer<T>(Status.Success, "", item);
            }
            catch (Exception ex)
            {
                return new EndpointAnswer<T>(Status.Failure, $"Database error while replacing item in collection. Message: {ex.Message}");
            }
        }
    }
}