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
COPY ["/core", "/src/core"]
COPY ["/main", "/src/main"]
COPY ["/plugin", "/src/plugin"]

# Build the files
RUN dotnet publish /src/core/Core.csproj -c Release -o /app/publish
RUN dotnet publish /src/main/Main.csproj -c Release -o /app/publish
RUN dotnet publish /src/plugin/Plugin.csproj -c Release -o /app/publish

# Change current directory in final container
FROM final
WORKDIR /app

# Copy published files to final image
COPY --from=build /app/publish .
ENTRYPOINT ["./Main.exe"]
