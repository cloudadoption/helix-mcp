import { router } from './router.js';
import checkAuth from './auth.js';

/**
 * Main worker request handler
 */
export default {
  async fetch(request, env, ctx) {
    try {
      const isAuthenticated = checkAuth(request, env);
      if (!isAuthenticated) {
        return new Response('Unauthorized', {
          status: 401,
        });
      }

      return await router(request, env, ctx);
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
