import { USER_AGENT } from "./global.js";

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export async function daAdminRequest(
  url,
  options = {}
) {
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": USER_AGENT,
    ...options.headers,
  };

  if (process.env.DA_ADMIN_API_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.DA_ADMIN_API_TOKEN}`;
  }

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(response.status, responseBody);
  }

  return responseBody;
}
