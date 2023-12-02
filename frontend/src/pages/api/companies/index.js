// pages/api/companies/index.js
import { API_URL } from "src/constants";
import { callEndpoint, findEndpointConfig, config } from "src/utils.js";

// TODO: this currently supports one level of nesting, we can create more levels adjusting the /api/<multiple_levels/>/concreteendpoint.js
export default async function handler(req, res) {
  try {
    // Construct the path from the subroute
    console.log("AAAreq.");
    const path = `/api/companies`;

    // Find the endpoint config
    const endpointConfig = findEndpointConfig(path, req.method, undefined);

    console.log("endpoint config: ", endpointConfig);

    if (!endpointConfig) {
      res.status(404).json({ error: "Endpoint not found" });
      return;
    }

    const url = `${API_URL}${path}`;
    console.log("url: ", url);

    // Find the endpoint body
    const endpointBody = config.EndpointBodies.find(
      (e) => e.Name === endpointConfig.Name
    );
    console.log("endpoint body: ", endpointBody);

    const result = await callEndpoint(url, req, endpointBody);

    // Send the result back as a response
    res.status(result.status).json(result.body);
  } catch (error) {
    // Handle any errors
    res.status(500).json({ error: "Error forwarding the request" });
  }
}
