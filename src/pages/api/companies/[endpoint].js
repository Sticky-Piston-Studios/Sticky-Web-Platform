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
      // check if all required fields are present
      // read them from the dynamicCofiguration from the EndpointBodies with given endpoint name
      const endpointBody = config.DynamicConfiguration.EndpointBodies.find(
        (e) => e.Name === req.query.endpoint
      );
      // check if all fields in the config are present in the request body, also check that no additional fields are present
      const requiredFields = endpointBody.Fields;
      // check if all required fields are present in the request body
      const missingFields = requiredFields.filter(
        (field) => !(field.Name in req.body)
      );
      if (missingFields.length > 0) {
        // if there are missing fields, return error
        const missingFieldNames = missingFields.map((field) => field.Name);
        res.status(400).json({
          error: "Missing required fields: " + missingFieldNames.join(", "),
        });
        return;
      }
      // check if there are any additional fields in the request body
      const additionalFields = Object.keys(req.body).filter(
        (field) =>
          !requiredFields.some((requiredField) => requiredField.Name === field)
      );
      if (additionalFields.length > 0) {
        // if there are additional fields, return error
        res.status(400).json({
          error: "Additional fields: " + additionalFields.join(", "),
        });
        return;
      }

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
