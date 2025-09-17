import handleChat from './chat.js';
import checkAuth from './auth.js';

/**
 * Main worker request handler
 */
export default {
  async fetch(request, env, _ctx) {
    try {
      const isAuthenticated = checkAuth(request, env);
      if (!isAuthenticated) {
        return new Response('Unauthorized', {
          status: 401,
        });
      }

      const url = new URL(request.url);
      if (url.pathname === '/chat') {
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
          return new Response('Expected Upgrade: websocket', { status: 426 });
        }

        return handleChat(env);
      }


      return new Response('Not Found', {
        status: 404,
      });
    } catch (e) {
      console.error({
        message: 'Error routing/processing request',
        error: e.message,
        stack: e.stack,
      });
      return new Response('Internal Server Error', {
        status: 500,
      });
    }
  },
};
