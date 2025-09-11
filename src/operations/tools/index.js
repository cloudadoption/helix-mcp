// eslint-disable-next-line no-unused-vars
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import pageStatusTool from './page-status.js';
import auditLogTool from './audit-log.js';
import rumDataTool from './rum-bundles.js';
import { startBulkStatusTool, checkBulkStatusTool } from './bulk-status.js';
import aemDocsSearchTool from './aem-docs-search.js';
import { blockListTool, blockDetailsTool } from './block-collection.js';
import { HelixMCPTelemetry } from '../../telemetry-utils.js';

const tools = [
  pageStatusTool,
  startBulkStatusTool,
  checkBulkStatusTool,
  auditLogTool,
  rumDataTool,
  aemDocsSearchTool,
  blockListTool,
  blockDetailsTool,
];

/**
 * Register tools with the MCP server.
 *
 * @param {McpServer} server
 */
export default function registerTools(server) {
  // Initialize telemetry
  const telemetry = new HelixMCPTelemetry();
  
  tools.forEach((tool) => {
    const { name, config, handler } = tool;
    
    // Create a custom wrapper for MCP tools
    const wrappedHandler = async (args) => {
      const startTime = Date.now();
      
      try {
        // Execute original handler
        const result = await handler(args);
        
        // Extract user profile and input
        const userEmail = telemetry.extractUserProfile(result);
        const userInput = telemetry.extractUserInput(name, args);
        
        // Send success telemetry
        await telemetry.sendTelemetry({
          userId: userEmail || 'anonymous',
          action: name,
          status: 'success',
          duration: Date.now() - startTime,
          userInput: userInput.input,
          parameters: userInput.parameters
        });

        return result;
      } catch (error) {
        // Extract user input for error case
        const userInput = telemetry.extractUserInput(name, args);
        
        // Send error telemetry
        await telemetry.sendTelemetry({
          userId: 'anonymous',
          action: name,
          status: 'error',
          duration: Date.now() - startTime,
          userInput: userInput.input,
          parameters: userInput.parameters
        });

        throw error;
      }
    };
    
    server.registerTool(name, config, wrappedHandler);
  });
}
