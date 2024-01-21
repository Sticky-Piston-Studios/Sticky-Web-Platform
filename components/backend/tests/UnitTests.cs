using NUnit.Platform;
using StickyWebBackend;
using Microsoft.Extensions.Configuration;
namespace Sticky_Web_Platform_Tests;

public class Tests
{
    [SetUp]
    public void Setup()
    {
    }

    [Test]
    public void Test1()
    {
        Assert.Pass();
    }

    [Test]
    public void GettingDynamicConfigurationPath()
    {   
        string? DirectoryPath = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        
        if (DirectoryPath == null)
        {
            Assert.Fail();
            return;
        }

        string settingFilePath = Path.Combine(DirectoryPath, @"appsettings.json");
        var configuration = new ConfigurationBuilder().AddJsonFile(settingFilePath).Build();
        Assert.That(configuration["DynamicConfigurationPath"], Is.Not.Null);
    }

    [Test]
    public void DeserializingDynamicConfiguration()
    {   
        string dynamicConfigurationFilePath = Path.Combine(TestContext.CurrentContext.TestDirectory, "tests", "data", "config.json");

        // This should never fail, it is checking if reference config file exists for the tests
        // (not related to the project code)
        Assert.That(File.Exists(dynamicConfigurationFilePath), Is.True);

        DynamicConfiguration dynamicConfiguration = new DynamicConfiguration(dynamicConfigurationFilePath);


        Assert.That(dynamicConfiguration.DatabaseConnectionString, Is.EqualTo("mongodb://root:root@swp-database:27017"));

        // Databases
        Assert.That(dynamicConfiguration.Databases?[0].Name, Is.EqualTo("Main"));
        Assert.That(dynamicConfiguration.Databases?[1].Name, Is.EqualTo("MainCopy"));
        Assert.That(dynamicConfiguration.Databases?[0].Collections?[1].Name, Is.EqualTo("Restaurants"));

        // EndpointGroups
        Assert.That(dynamicConfiguration.EndpointGroups?[0].Name, Is.EqualTo("Companies"));
        Assert.That(dynamicConfiguration.EndpointGroups?[0].Path, Is.EqualTo("/api/companies"));
        Assert.That(dynamicConfiguration.EndpointGroups?[0].Endpoints.Count, Is.GreaterThan(0));

        Assert.That(dynamicConfiguration.EndpointGroups?[0].Endpoints[0].Name, Is.EqualTo("GetCompany"));
        Assert.That(dynamicConfiguration.EndpointGroups?[0].Endpoints[0].Action.Type, Is.EqualTo(EndpointActionType.Default));
        Assert.That((dynamicConfiguration.EndpointGroups?[0].Endpoints[0].Action as EndpointDefaultActionDefinition)?.DatabaseCollectionName, Is.EqualTo("Companies"));
        Assert.That(dynamicConfiguration.EndpointGroups?[0].Endpoints[1].Action.Type, Is.EqualTo(EndpointActionType.Custom));
        Assert.That((dynamicConfiguration.EndpointGroups?[0].Endpoints[1].Action as EndpointCustomActionDefinition)?.Name, Is.EqualTo("AddCompanyCustom"));

        // DatabaseModels
        Assert.That(dynamicConfiguration.DatabaseModels?[0].Name, Is.EqualTo("Company"));
        Assert.That(dynamicConfiguration.DatabaseModels?[0].Fields?[2].Name, Is.EqualTo("RestaurantIds"));

        // EndpointBodies
        Assert.That(dynamicConfiguration.EndpointBodies?[0].Name, Is.EqualTo("GetCompany"));
        Assert.That(dynamicConfiguration.EndpointBodies?[0].Fields[1].Name, Is.EqualTo("RestaurantIds"));
    }
}