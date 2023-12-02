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

export default async function handler(req, res) {
  try {
    console.log("req.query: ", req.query);
    // Parse the configuration file
    const config = JSON.parse(fs.readFileSync("../configuration.json", "utf8"));

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

    console.log(API_URL);
    // Forward the request to the external API
    //const queryString = new URLSearchParams(req.query).toString();
    //const url = queryString
    //  ? `${API_URL}${endpointGroup.Path}/?${queryString}`
    //  : `${API_URL}${endpointGroup.Path}`;
    const url = `${API_URL}${path}`;
    console.log("url: ", url);

    // Determine the body to send based on the request method
    let body = null;
    if (req.method === "POST" || req.method === "PATCH") {
      // check if all required fields are present
      // read them from the dynamicCofiguration from the EndpointBodies with given endpoint name
      const endpointBody = config.EndpointBodies.find(
        (e) => e.Name === endpointConfig.Name
      );
      console.log("endpoint body: ", endpointBody);
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

    console.log("All fine, can post the body: ", body);
    console.log("url: ", url);

    // workaround for json to bson conversion
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

    console.log("converted the data to bson: ", data);

    // Send the data back as a response
    res.status(response.status).json(data);
  } catch (error) {
    // Handle any errors
    res.status(500).json({ error: "Error forwarding the request" });
  }
}
