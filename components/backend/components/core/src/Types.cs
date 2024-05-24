using Microsoft.AspNetCore.Mvc;
using StickyWebBackend;

namespace StickyWebBackend
{
    public delegate void RegisterCustomEndpointAction(string key, CustomAction customAction);

    public delegate Task<OkObjectResult> CustomAction(
        Dictionary<string, Database> databases, 
        EndpointBodyDefinition? endpointRequestBodyDefinition,
        EndpointBodyDefinition? endpointResponseBodyDefinition
    ); 

    public interface IPlugin
    {
        void RegisterCustomEndpointActions(RegisterCustomEndpointAction register);
    }

    // public class CustomType
    // {
    //     public string Name { get; set; }
    //     public int Value { get; set; }
    // }

   
}