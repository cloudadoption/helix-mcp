import handleChat from './chat.js';

const routes = [
  {
    route: '/chat',
    method: 'POST',
    handler: handleChat,
  },
];

const ORIGN_PATTERNS = ['da.live', 'tools.aem.live', 'labs.aem.live', 'localhost:3000'];

let originPatterns = ORIGN_PATTERNS;

function setOriginPatterns(patterns) {
  originPatterns = patterns;
}

function restoreOriginPatterns() {
  originPatterns = ORIGN_PATTERNS;
}

const corsOptions = {
  origin: (origin) => {
    if (origin && originPatterns.some((p) => origin.endsWith(p))) {
      return origin;
    }

    return undefined;
  },
  allowMethods: ['GET', 'POST'],
  maxAge: 600,
  allowCredentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: [],
};

function routeMatch(route, path) {
  if (route === path) return {};
  const routeParts = route.split('/');
  const pathParts = path.split('/');
  if (routeParts.length !== pathParts.length) return undefined;

  const routeParams = {};
  for (let i = 0; i < routeParts.length; i++) {
    if (routeParts[i].startsWith(':')) {
      routeParams[routeParts[i].substring(1)] = pathParts[i];
    } else if (routeParts[i] !== pathParts[i]) {
      return undefined;
    }
  }

  return routeParams;
}

export async function router(request, env, ctx, configuredRoutes = routes) {
  const allowOrigin = corsOptions.origin(request.headers.get('Origin'));
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': corsOptions.allowMethods.join(','),
        'Access-Control-Max-Age': corsOptions.maxAge,
        'Access-Control-Allow-Credentials': corsOptions.allowCredentials,
        'Access-Control-Allow-Headers': corsOptions.allowedHeaders.join(','),
        'Access-Control-Expose-Headers': corsOptions.exposeHeaders.join(','),
      },
    });
  }

  const url = new URL(request.url);
  const route = configuredRoutes.find((r) => {
    const routeMatches = routeMatch(r.route, url.pathname) !== undefined;
    if (!routeMatches) return false;

    return true;
  });

  if (!route) {
    return new Response('API Route Not Found', {
      status: 404,
    });
  }

  if (route.method && route.method !== request.method) {
    return new Response('Invalid Request Method for route', {
      status: 405,
    });
  }

  const start = Date.now();
  const responseLike = await route.handler(request, env, ctx, routeMatch(route.route, url.pathname));
  const end = Date.now();

  const headers = new Headers(responseLike.headers);
  headers.set('Access-Control-Allow-Origin', allowOrigin);
  headers.set('Access-Control-Allow-Credentials', corsOptions.allowCredentials);
  headers.set('Access-Control-Expose-Headers', corsOptions.exposeHeaders.join(','));
  headers.set('X-Backend-Time', `${end - start}`);

  return new Response(responseLike.body, {
    status: responseLike.status,
    headers,
  });
}

export const exportForTesting = {
  routeMatch,
  setOriginPatterns,
  restoreOriginPatterns,
};
