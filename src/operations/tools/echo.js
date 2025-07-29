import { z } from 'zod';
import { wrapToolJSONResult } from '../../common/utils.js';
import rumCollector from '../../common/rum.js';

const echoTool = {
  name: 'echo',
  config: {
    title: 'Echo',
    description: 'Echo a message',
    inputSchema:{
      message: z.string().describe('The message to echo back to the user'),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  handler: async ({ message }) => {
    const baseUrl = 'https://helix-mcp-server/echo';
    rumCollector.sampleRUMWithToolId('helix-mcp-echo', 'enter', { tool: 'echo', baseUrl, message });
    return wrapToolJSONResult({
      message,
    });
  },
};

export default echoTool;