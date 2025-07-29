import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import echoTool from './echo.js';
import pageStatusTool from './page-status.js';
import auditLogTool from './audit-log.js';
import rumDataTool from './rum-bundles.js';
import { startBulkStatusTool, checkBulkStatusTool } from './bulk-status.js';
import rumCollector from '../../common/rum.js';

// Helper function to wrap tool handlers with RUM tracking
function wrapToolWithRUM(tool) {
  return {
    ...tool,
    handler: async (params) => {
      // Extract source and target URLs for better RUM tracking
      let source = null;
      let target = null;
      
      // Extract URLs based on tool type and parameters
      if (tool.name === 'page-status' || tool.name === 'audit-log') {
        // For admin API tools, construct the target URL
        if (params.org && params.site) {
          target = `https://admin.hlx.page/${tool.name}/${params.org}/${params.site}`;
          if (params.path) {
            target += `/${params.path}`;
          }
        }
      } else if (tool.name === 'rum-data') {
        // For RUM data tool, use the provided URL as target
        target = params.url;
      } else if (tool.name === 'bulk-status-start' || tool.name === 'bulk-status-check') {
        // For bulk status tools, construct target URL
        if (params.org && params.site) {
          target = `https://admin.hlx.page/status/${params.org}/${params.site}`;
        }
      }
      
      // Set source and target for this specific tool execution
      if (source) rumCollector.setSource(source);
      if (target) rumCollector.setTarget(target);
      
      // Use the RUM tracking wrapper
      return rumCollector.withRUMTracking(tool.name, tool.handler)(params);
    }
  };
}

const tools = [ 
  wrapToolWithRUM(echoTool),
  wrapToolWithRUM(pageStatusTool),
  wrapToolWithRUM(startBulkStatusTool),
  wrapToolWithRUM(checkBulkStatusTool),
  wrapToolWithRUM(auditLogTool),
  wrapToolWithRUM(rumDataTool)
];

/**
 * Register tools with the MCP server.
 * 
 * @param {McpServer} server 
 */
export default function registerTools(server) {
  // Track tool registration startup
  rumCollector.sampleRUM('startup', {
    service: 'helix-mcp-server',
    tools: tools.map(t => t.name),
    totalTools: tools.length
  });
  
  tools.forEach((tool) => {
    const { name, config, handler } = tool;
    server.registerTool(name, config, handler);
  });
  
  console.log(`🔧 Registered ${tools.length} tools with RUM tracking`);
}