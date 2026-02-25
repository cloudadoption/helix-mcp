import { USER_AGENT, HELIX_ADMIN_API_URL } from './global.js';

function detectTokenType(token) {
  if (token.startsWith('hlxtst_')) return 'site-token';
  if ((token.match(/\./g) || []).length === 2) return 'ims-token';
  return 'admin-key';
}

async function exchangeImsToken(imsToken, org, site, ref) {
  const response = await fetch(`${HELIX_ADMIN_API_URL}/auth/adobe/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessToken: imsToken, org, site, ref,
    }),
  });

  if (!response.ok) {
    throw new Error(`IMS token exchange failed: ${response.status}`);
  }

  const data = await response.json();
  return data.siteToken || null;
}

export async function resolveHelixToken(token, org, site, ref = 'main') {
  if (!token) return token;

  const type = detectTokenType(token);
  if (type !== 'ims-token') return token;

  return exchangeImsToken(token, org, site, ref);
}

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      // empty body or invalid JSON
      return {};
    }
  }
  return response.text();
}

export async function helixAdminRequest(url, options = {}, token) {
  const headers = {
    'User-Agent': USER_AGENT,
    ...options.headers,
  };

  const authToken = token || process.env.HELIX_ADMIN_API_TOKEN;
  if (authToken) {
    headers['Authorization'] = `token ${authToken}`;
  }

  const init = {
    method: options.method || 'GET',
    headers,
    body: options.body || undefined,
  };

  const response = await fetch(url, init);

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const xError = response.headers.get('x-error');
    throw new Error(`Admin API error: ${response.status} - ${xError}. ${responseBody}`);
  }

  return responseBody;
}

export function formatHelixAdminURL(api, org, repo, branch, path, ext) {
  return `${HELIX_ADMIN_API_URL}/${api}/${org}/${repo}/${branch}/${path.startsWith('/') ? path.slice(1) : path}${ext ? `.${ext}` : ''}`;
}

export function wrapToolJSONResult(result) {
  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}
