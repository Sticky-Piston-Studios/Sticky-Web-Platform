using Microsoft.AspNetCore.Mvc;

namespace StickyWebBackend
{
    public class CustomActions
    {
        public static OkObjectResult ExampleAction(int x) 
        {
            return new OkObjectResult("Hello, world!");
        }
    }
}