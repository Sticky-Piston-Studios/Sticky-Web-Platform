using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using StickyWebBackend;

namespace Plugin
{
    public class Plugin : IPlugin
    {
        public void RegisterCustomEndpointActions(RegisterCustomEndpointAction register)
        {
            register("Alpha", GetAsyncAll);
        }

        public static async Task<OkObjectResult> GetAsyncAll(
            Dictionary<string, Database> databases, 
            EndpointBodyDefinition? endpointRequestBodyDefinition, 
            EndpointBodyDefinition? endpointResponseBodyDefinition)
        {
            return new OkObjectResult(null);
        }
    }
}
