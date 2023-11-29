echo "Build & Push & Deploy started!"

export ContainerRegistry="szymonduchregistry"
export SubscriptionId="xxxxxxxxxxxxxxxxxxxxxxxxxXX"
export BackendAppName="js-backend"
export FrontendAppName="js-frontend"
export DatabaseAppName="js-database"
export TenantId="xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export ContainerInstanceContext="CotwAppAciContext"

echo "  >>  Logging in to Azure"
docker login azure --tenant-id $TenantId
echo "a2"
az account set --subscription $SubscriptionId 
echo "a4"
#az acr login --name $ContainerRegistry
echo "a5"

echo "  >>  Building locally"
docker context use default
docker compose -f "docker-compose.yaml" build

echo "  >>  Pushing backend image to Azure Container Registry"
docker tag "$BackendAppName" "$ContainerRegistry.azurecr.io/$BackendAppName"
docker push "$ContainerRegistry.azurecr.io/$BackendAppName"
az acr repository show --name $ContainerRegistry --repository $BackendAppName

echo "  >>  Pushing frontend image to Azure Container Registry"
docker tag "$FrontendAppName" "$ContainerRegistry.azurecr.io/$FrontendAppName"
docker push "$ContainerRegistry.azurecr.io/$FrontendAppName"
az acr repository show --name $ContainerRegistry --repository $FrontendAppName

echo "  >>  Pushing database image to Azure Container Registry"
docker tag "$FrontendAppName" "$ContainerRegistry.azurecr.io/$DatabaseAppName"
docker push "$ContainerRegistry.azurecr.io/$DatabaseAppName"
az acr repository show --name $ContainerRegistry --repository $DatabaseAppName

echo "  >>  Deploying containers"
docker context create aci $ContainerInstanceContext --subscription-id $SubscriptionId
docker context use $ContainerInstanceContext 
docker compose -f "docker-compose-azure.yaml" up

echo "  >>  Checking deployed containers"
docker ps

# docker logs campfire-on-the-wall_js-frontend
# docker logs campfire-on-the-wall_js-backend

