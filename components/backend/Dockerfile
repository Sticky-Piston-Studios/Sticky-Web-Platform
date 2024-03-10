# Pull image for hosting the app
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

# Change current directory in build container
WORKDIR /app
EXPOSE 4002

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

# Pull image for building the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Change current directory in build container
WORKDIR /src

# Copy project file to /src/backend
COPY ["Sticky-Web-Backend.csproj", "/src"]

# Restore dependencies and tools of a project
RUN dotnet restore "Sticky-Web-Backend.csproj"

# Copy all files from current local directory to /src directory in container
COPY . .

# Build the files
RUN dotnet build "Sticky-Web-Backend.csproj" -c Release -o /app/build

# Publish the application and its dependencies to /app/publish directory
#FROM build
RUN dotnet publish "Sticky-Web-Backend.csproj" -c Release -o /app/publish

# Change current directory in final container
FROM final
WORKDIR /app

# Copy published files to final image
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Sticky-Web-Backend.dll"]

# Copy and run sequence:
#    ./Backend/Sticky-Web-Backend.csproj -> [build]/src/Backend/Sticky-Web-Backend.csproj
#    ./Backend -> [build]/src/Backend
#    [build]/app/build
#    [build]/app/publish -> [final]/app