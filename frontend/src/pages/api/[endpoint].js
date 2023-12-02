// pages/api/companies/[endpoint].js
import fetch from "node-fetch";
import { API_URL } from "src/constants";
import fs from "fs";

function bsonToJson(data) {
  return data.map((item) => {
    // Replace ObjectId parts with just the id string
    const itemReplaced = item.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
    // Parse the string into an object
    const itemParsed = JSON.parse(itemReplaced);
    return itemParsed;
  });
}

// Parse the configuration file
const config = JSON.parse(fs.readFileSync("../configuration.json", "utf8"));

async function callEndpoint(url, req, endpointBody) {
  // Determine the body to send based on the request method
  let body = null;
  if (req.method === "POST" || req.method === "PATCH") {
    // Check if all required fields are present in the request body
    const missingFields = endpointBody.Fields.filter(
      (field) => !(field.Name in req.body)
    );
    if (missingFields.length > 0) {
      // If there are missing fields, return error
      const missingFieldNames = missingFields.map((field) => field.Name);
      return {
        status: 400,
        body: {
          error: "Missing required fields: " + missingFieldNames.join(", "),
        },
      };
    }

    // Check if there are any additional fields in the request body
    const additionalFields = Object.keys(req.body).filter(
      (field) =>
        !endpointBody.Fields.some(
          (requiredField) => requiredField.Name === field
        )
    );
    if (additionalFields.length > 0) {
      // If there are additional fields, return error
      return {
        status: 400,
        body: {
          error: "Additional fields: " + additionalFields.join(", "),
        },
      };
    }

    body = JSON.stringify(req.body);
  }

  // Call the external API
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

  // Convert the data to BSON HACK!
  data.value.data = bsonToJson(data.value.data);

  return {
    status: response.status,
    body: data,
  };
}

// TODO: this currently supports one level of nesting, we can create more levels adjusting the /api/<multiple_levels/>/concreteendpoint.js
export default async function handler(req, res) {
  try {
    // Construct the path from the subroute
    const path = `/api/${req.query.endpoint}`;

    // Find the endpoint group
    const endpointGroup = config.EndpointGroups.find(
      (group) => group.Path === path
    );
    console.log(endpointGroup);

    // Find the endpoint configuration
    const endpointConfig = endpointGroup.Endpoints.find(
      (e) => e.Method === req.method && e.Subroute === req.query.subroute
    );
    console.log(endpointConfig);

    if (!endpointConfig) {
      res.status(404).json({ error: "Endpoint not found" });
      return;
    }

    const url = `${API_URL}${path}`;

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
