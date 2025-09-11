import { tool } from '@cloudflare/ai-utils';
import registerTools from '../operations/tools/index.js';
import { z } from 'zod';

export default function initTools() {
  const tools = [];

  const mockMCPServer = {
    registerTool: (name, config, handler) => {

      const parameters = z.toJSONSchema(z.object(config.inputSchema));

      tools.push(tool({
        name,
        description: config.description,
        parameters,
        function: async (params) => {
          console.log(`calling tool ${name} with params`, params);
          const result = await handler(params);
          console.log(`tool ${name} result`, result);
          return result;
        },
      }));
    },
  };

  registerTools(mockMCPServer);

  return tools;
}
