// pages/api/companies/[endpoint].js
import fetch from "node-fetch";
import { API_URL } from "src/constants";
import fs from "fs";

export default async function handler(req, res) {
  try {
    // Parse the configuration file
    const config = JSON.parse(fs.readFileSync("endpoints.config.json", "utf8"));

    // Find the endpoint configuration
    const endpointConfig =
      config.DynamicConfiguration.EndpointGroups[0].Endpoints.find(
        (e) => e.Name === req.query.endpoint
      );

    if (!endpointConfig) {
      res.status(404).json({ error: "Endpoint not found" });
      return;
    }

    // Forward the request to the external API
    const queryString = new URLSearchParams(req.query).toString();
    const url = queryString
      ? `${API_URL}${endpointConfig.Path}/?${queryString}`
      : `${API_URL}${endpointConfig.Path}`;

    // Determine the body to send based on the request method
    let body = null;
    if (req.method === "POST" || req.method === "PATCH") {
      body = JSON.stringify(req.body);
    }

    const response = await fetch(url, {
      method: req.method,
      headers: {
        ...req.headers, // Forward all headers from the original request
        "Content-Type": "application/json",
      },
      body: body, // Send the body for POST and PATCH requests
    });

    // Get the data from the external API response
    const data = await response.json();

    // Send the data back as a response
    res.status(response.status).json(data);
  } catch (error) {
    // Handle any errors
    res.status(500).json({ error: "Error forwarding the request" });
  }
}
