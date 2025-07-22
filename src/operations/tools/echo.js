import { z } from 'zod';
import { wrapToolJSONResult } from '../../common/utils.js';

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
    return wrapToolJSONResult({
      message,
    });
  },
};

export default echoTool;