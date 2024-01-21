using Microsoft.AspNetCore.Mvc;

namespace StickyWebBackend
{
    public class CustomActions
    {
        public static OkObjectResult ExampleAction() 
        {
            return new OkObjectResult("Hello, world!");
        }
    }
}