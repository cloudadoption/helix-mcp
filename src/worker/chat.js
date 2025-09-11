import { runWithTools } from '@cloudflare/ai-utils';
import initTools from './tools.js';

const DEFAULT_MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct';
const SYSTEM_PROMPS = `
You are a helpful assistant that can answer questions about About AEM Edge Delivery Services. 
You have tools available to you to help you answer questions including searching documentation, retrieving audit logs, checking page status, and more.

When you are asked a question, you should use the tools available to you to answer the question.
If you are not sure about the answer, you should say so.
If you do not have the information to answer the question, you should say so.
If you need more information, you should ask the user for the information.

If the user asks you to do something that is not possible, you should say so.
If the user asks you to do something that is not related to AEM Edge Delivery Services, you should say politely decline.
`;

export default async function handleChat(request, env) {
  const body = await request.json();
  const { messages } = body;
  messages.unshift({
    role: 'system',
    content: SYSTEM_PROMPS,
  });

  const tools = initTools(env);

  const response = await runWithTools(env.AI, env.WORKER_AI_MODEL || DEFAULT_MODEL, {
    messages,
    tools,
  }, {
    streamFinalResponse: false,
    maxRecursiveToolRuns: 10,
    strictValidation: true,
    verbose: true,
  });

  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
