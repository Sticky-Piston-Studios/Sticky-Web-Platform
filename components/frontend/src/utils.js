import fetch from "node-fetch";
import fs from "fs";

// Parse the configuration file
export const config = JSON.parse(
  fs.readFileSync("../configuration.json", "utf8")
);

function bsonToJson(data) {
  return data.map((item) => {
    // Replace ObjectId parts with just the id string
    const itemReplaced = item.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');
    // Parse the string into an object
    const itemParsed = JSON.parse(itemReplaced);
    return itemParsed;
  });
}

export function findEndpointConfig(path, method, subroute) {
  // Find the endpoint group
  console.log("path: ", path, "method: ", method, "subroute: ", subroute);
  const endpointGroup = config.EndpointGroups.find(
    (group) => group.Path === path
  );

  // Find the endpoint configuration
  const endpointConfig = endpointGroup.Endpoints.find(
    (e) => e.Method === method && e.Subroute === subroute
  );

  return endpointConfig;
}

export async function callEndpoint(url, req, endpointBody) {
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

  // Convert the data to BSON HACK! (extract the data)
  if (data.value && data.value.data)
    data.value.data = bsonToJson(data.value.data);

  return {
    status: response.status,
    body: data,
  };
}
