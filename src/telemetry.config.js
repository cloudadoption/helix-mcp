/**
 * Telemetry Configuration
 * Configuration for the Helix MCP telemetry system
 */

export const telemetryConfig = {
  // Telemetry Configuration
  enabled: process.env.TELEMETRY_ENABLED === 'true' || true,
  endpoint: process.env.TELEMETRY_ENDPOINT || 
    'https://316182-954bronzelobster.adobeioruntime.net/api/v1/web/helix-telemetry/telemetry-collector',
  toolId: process.env.TOOL_ID || 'helix-mcp',

  // Optional: User identification
  userIdHeader: process.env.USER_ID_HEADER || 'x-user-id',
  nodeEnv: process.env.NODE_ENV || 'production'
};

export default telemetryConfig;