import { USER_AGENT, HELIX_ADMIN_API_URL } from "./global.js";

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      return await response.json();
    } catch (error) {
      // empty body or invalid JSON
      return {};
    }
  }
  return response.text();
}

export async function daAdminRequest(
  url,
  options = {},
  apiToken = null
) {
  const headers = {
    "User-Agent": USER_AGENT,
    ...options.headers,
  };

  // Use provided token or fall back to environment variable
  const token = apiToken || process.env.DA_ADMIN_API_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const init = {
    method: options.method || "GET",
    headers,
    body: options.body || undefined,
  };

  const response = await fetch(url, init);

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(response.status, responseBody);
  }

  return responseBody;
}

export async function helixAdminRequest(url, options = {}, apiToken = null) {
  const headers = {
    "User-Agent": USER_AGENT,
    ...options.headers,
  };

  // Use provided token or fall back to environment variable
  const token = apiToken || process.env.HELIX_ADMIN_API_TOKEN;
  if (token) {
    headers['X-Auth-Token'] = token;
  }

  const init = {
    method: options.method || "GET",
    headers,
    body: options.body || undefined,
  };

  const response = await fetch(url, init);

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const xError = response.headers.get("x-error");
    throw new Error(`Admin API error: ${response.status} - ${xError}. ${responseBody}`);
  }

  return responseBody;
}

export function formatHelixAdminURL(api, org, repo, branch, path, ext) {
  return `${HELIX_ADMIN_API_URL}/${api}/${org}/${repo}/${branch}/${path.startsWith("/") ? path.slice(1) : path}${ext ? `.${ext}` : ""  }`;
}

export function formatDaAdminURL(api, org, repo, path, ext) {
  return `${DA_ADMIN_API_URL}/${api}/${org}/${repo}/${path.startsWith("/") ? path.slice(1) : path}${ext ? `.${ext}` : ""  }`;
}

export function wrapToolJSONResult(result) {
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}