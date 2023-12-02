// scripts/generate-api-routes.js
const fs = require("fs");
const path = require("path");

const config = JSON.parse(fs.readFileSync("../configuration.json", "utf8"));

// The directory where the API route files will be created
const apiDir = path.resolve(__dirname, "../src/pages/api");

// Template for endpoints without parameters
const templateWithoutParams = (path) => `
import { API_URL } from "src/constants";
import { callEndpoint, findEndpointConfig, config } from "src/utils.js";

export default async function handler(req, res) {
  try {
    const endpointPath = \`${path}\`;

    const endpointConfig = findEndpointConfig(endpointPath, req.method, undefined);

    if (!endpointConfig) {
      res.status(404).json({ error: "Endpoint not found" });
      return;
    }

    const url = \`\${API_URL}\${endpointPath}\`;

    const endpointBody = config.EndpointBodies.find(
      (e) => e.Name === endpointConfig.Name
    );

    const result = await callEndpoint(url, req, endpointBody);

    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(500).json({ error: "Error forwarding the request" });
  }
}
`;

// Template for endpoints with parameters
const templateWithParams = (path) => `
import { API_URL } from "src/constants";
import { callEndpoint, findEndpointConfig, config } from "src/utils.js";

export default async function handler(req, res) {
  try {
    const endpointPath = \`${path}\`;

    const endpointConfig = findEndpointConfig(endpointPath, req.method, "id");

    if (!endpointConfig) {
      res.status(404).json({ error: "Endpoint not found" });
      return;
    }

    const url = \`\${API_URL}\${endpointPath}/\${req.query.endpoint}\`;

    const endpointBody = config.EndpointBodies.find(
      (e) => e.Name === endpointConfig.Name
    );

    const result = await callEndpoint(url, req, endpointBody);

    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(500).json({ error: "Error forwarding the request" });
  }
}
`;

// Create a file for each endpoint group
config.EndpointGroups.forEach((group) => {
  const groupDir = path.join(apiDir, group.Path.replace("/api/", ""));

  // Create the directory for the endpoint group if it doesn't exist
  if (!fs.existsSync(groupDir)) {
    fs.mkdirSync(groupDir, { recursive: true });
  }

  // Create index.js for endpoints without parameters
  fs.writeFileSync(
    path.join(groupDir, "index.js"),
    templateWithoutParams(group.Path)
  );

  // Create [endpoint].js for endpoints with parameters
  fs.writeFileSync(
    path.join(groupDir, "[endpoint].js"),
    templateWithParams(group.Path)
  );
});
