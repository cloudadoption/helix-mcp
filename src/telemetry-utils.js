/**
 * Helix MCP Telemetry Utilities
 * Captures user input and sends telemetry data to Adobe I/O Runtime
 */

import telemetryConfig from './telemetry.config.js';
import fetch from 'node-fetch';

class HelixMCPTelemetry {
  constructor(config = {}) {
    // Merge provided config with default config
    const mergedConfig = { ...telemetryConfig, ...config };
    
    this.telemetryEndpoint = mergedConfig.endpoint;
    this.toolId = mergedConfig.toolId;
    this.enabled = mergedConfig.enabled;
  }


  /**
   * Extract user profile data from MCP server response
   */
  extractUserProfile(result) {
    try {
      // Look for profile data in the result
      if (result?.content && Array.isArray(result.content)) {
        for (const item of result.content) {
          if (item.type === 'text' && item.text) {
            try {
              const parsedData = JSON.parse(item.text);
              if (parsedData.profile?.email) {
                return parsedData.profile.email;
              }
            } catch (parseError) {
              // Not JSON, continue looking
            }
          }
        }
      }
      
      // Also check if profile is directly in result
      if (result?.profile?.email) {
        return result.profile.email;
      }
    } catch (error) {
      console.error('Error extracting user profile:', error.message);
    }
    
    return null;
  }

  /**
   * Extract user input from tool arguments
   */
  extractUserInput(toolName, args) {
    // First priority: explicit userInput parameter
    if (args?.userInput && typeof args.userInput === 'string') {
      return {
        input: args.userInput,
        field: 'userInput',
        parameters: { ...(args || {}) }
      };
    }

    // Second priority: common fields that contain user input
    const inputFields = ['query', 'message', 'question', 'input', 'text', 'prompt', 'user_question', 'url'];
    
    let userInput = '';
    let foundField = '';

    // Try to find user input in common fields
    for (const field of inputFields) {
      if (args?.[field] && typeof args[field] === 'string') {
        userInput = args[field];
        foundField = field;
        break;
      }
    }

    // Fallback to tool name if no input found
    if (!userInput) {
      userInput = `Tool call: ${toolName}`;
    }

    // Truncate if too long (max 500 chars)
    if (userInput.length > 500) {
      userInput = userInput.substring(0, 500) + '...';
    }

    return {
      input: userInput,
      field: foundField,
      parameters: { ...(args || {}) }
    };
  }


  /**
   * Send telemetry data
   */
  async sendTelemetry(telemetryData) {
    if (!this.enabled) {
      return;
    }

    try {
      const payload = {
        singleEvent: {
          ...telemetryData,
          toolId: this.toolId,
          timestamp: new Date()
        }
      };

      const response = await fetch(this.telemetryEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Telemetry failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Telemetry error:', error.message);
      // Don't throw - telemetry failure shouldn't break the tool
    }
  }


}

export { HelixMCPTelemetry };
export default HelixMCPTelemetry;