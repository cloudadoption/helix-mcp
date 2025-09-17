import initTools from './tools.js';
import { runWithTools } from '@cloudflare/ai-utils';

const DEFAULT_MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct';
const SYSTEM_PROMPS = `
You are a helpful AEM Edge Delivery Services assistant! Your job is to help the user get things done with their site deployed to AEM Edge Delivery Services. 
Your primary focus is on administrative and authoring tasks.
You have tools available to help you answer questions including searching documentation, retrieving audit logs, checking page status, and more.

Based on the user's query, you should evaluate whihc of the tools available to you are most likely to help them get what they want.
Once you decide which tool or tools to use, you should check if you have all the information you need to use the tool(s).
If you do not have all the information you need, you should ask the user for the information.
If you have all the information you need, you should use the tool(s) to get the information you need.
If the tool(s) return a result, you should use the result to answer the user's question.
If the tool(s) return an error, you should say so.
If the tool(s) return a result that is not what the user asked for, you should say so.
If the tool(s) return a result that is not possible, you should say so.
If the user asks you to do something that is not possible, you should say so.
If the user asks you to do something that is not related to AEM Edge Delivery Services, you should say politely decline.
`;

export default async function handleChat(env) {
  // eslint-disable-next-line no-undef
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();

  const messages = [{
    role: 'system',
    content: SYSTEM_PROMPS,
  }];

  const tools = initTools(env);

  server.addEventListener('message', (event) => {
    const { data } = event;

    messages.push({
      role: 'user',
      content: data,
    });

    server.send(JSON.stringify({
      type: 'status',
      content: 'Thinking...',
    }));

    // Handle async operations without making the event handler async
    (async () => {
      try {
        const result = await runWithTools(env.AI, env.WORKER_AI_MODEL || DEFAULT_MODEL, {
          messages,
          tools,
          temperature: env.WORKER_AI_TEMPERATURE || 0.7,
          max_tokens: 2048,
        }, {
          strictValidation: true,
          streamFinalResponse: false,
          maxRecursiveToolRuns: 5,
          verbose: true,
        });

        messages.push({
          role: 'assistant',
          content: result.response,
        });

        console.log('result', result);
        console.log('messages', messages);

        server.send(JSON.stringify({
          type: 'response',
          content: result.response,
        }));

        server.send(JSON.stringify({
          type: 'status',
          content: 'Done',
        }));
      } catch (e) {
        console.error({
          message: 'Error processing message',
          error: e.message,
          stack: e.stack,
        });
        server.send(JSON.stringify({
          type: 'error',
          content: 'An error occurred while processing your message.',
        }));
      }
    })();
  });

  server.addEventListener('close', () => {
    server.close();
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

