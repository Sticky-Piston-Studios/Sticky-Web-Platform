
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
    public class CustomActions
    {
        public static OkObjectResult ExampleAction() 
        {
            return new OkObjectResult("Hello, world!");
        }
    }
}