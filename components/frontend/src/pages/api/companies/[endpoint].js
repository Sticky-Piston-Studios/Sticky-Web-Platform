
import { API_URL } from "src/constants";
import { callEndpoint, findEndpointConfig, config } from "src/utils.js";

export default async function handler(req, res) {
  try {
    const endpointPath = `/api/companies`;

    const endpointConfig = findEndpointConfig(endpointPath, req.method, "id");

    if (!endpointConfig) {
      res.status(404).json({ error: "Endpoint not found" });
      return;
    }

    const url = `${API_URL}${endpointPath}/${req.query.endpoint}`;

    const endpointBody = config.EndpointBodies.find(
      (e) => e.Name === endpointConfig.Name
    );

    const result = await callEndpoint(url, req, endpointBody);

    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(500).json({ error: "Error forwarding the request" });
  }
}
