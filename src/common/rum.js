/**
 * RUM Collector for MCP server
 */
class RUMCollector {
  constructor() {
    this.weight = 100; // Default to 1% sampling
    this.id = 'helix-mcp-server'; // Permanent ID for tools
    this.firstReadTime = Date.now();
    this.baseURL = process.env.RUM_BASE_URL || 'https://rum.hlx.page';
    this.source = 'https://www.bbird.live/mcp';
    this.target = process.env.RUM_TARGET || 'https://www.bbird.live/';
    
    this.disabled = process.env.NODE_ENV === 'test';
    
    this.initialize();
  }

  initialize() {
    this.isSelected = Math.random() < this.weight && !this.disabled;
    if (!this.disabled) {
      console.error('🔍 RUM Collector initialized:', {
        weight: this.weight,
        id: this.id,
        isSelected: this.isSelected,
        baseURL: this.baseURL,
        source: this.source,
        target: this.target
      });
    }
  }

  /**
   * Set a permanent ID for the RUM collector
   */
  setPermanentId(id) {
    this.id = id;
    if (!this.disabled) {
      console.error(`🆔 RUM ID set to: ${id}`);
    }
  }

  /**
   * Send RUM data with a specific tool ID - only for successful operations
   */
  sampleRUMWithToolId(toolId, checkpoint, data = {}) {
    if (this.disabled || !this.isSelected || !checkpoint) {
      return;
    }

    try {
      const timeShift = Date.now() - this.firstReadTime;
      const site = data.site || '';
      const path = data.path || '';
      const target = this.target;
      const referer = target + site + path;
      
      // Only send ping for successful operations
      if (['success', 'enter'].includes(checkpoint)) {
        this.sendPingWithToolId(toolId, checkpoint, timeShift, target, referer);
      }
    } catch (error) {
      if (!this.disabled) {
        console.error('RUM Error:', error.message);
      }
    }
  }

  /**
   * Send ping to RUM endpoint with tool-specific ID
   */
  sendPingWithToolId(toolId, checkpoint, time, target = null, referer = null) {
    if (this.disabled) {
      return;
    }

    try {
      const finalTarget = target || this.source;
      const finalReferer = referer || this.source;
      
      const rumData = {
        weight: this.weight,
        id: toolId,
        checkpoint,
        t: new Date().toISOString(),        
        source: this.source,
        generation: 'mcp-server',
        target: finalTarget,
        referer: finalReferer
      };

      const url = `${this.baseURL}/.rum/${this.weight}`;
      
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rumData)
      })
      .then(response => {
        if (!this.disabled) {
          console.error(`✅ RUM ${checkpoint} ping successful (${toolId}):`, {
            status: response.status,
            statusText: response.statusText,
            url,
            source: this.source,
            success: response.status === 201 ? 'Data collected' : 'Unexpected status',
            finalTarget,
            finalReferer
          });
        }
        return response.text();
      })
      .then(responseText => {
        if (responseText && !this.disabled) {
          console.error(`📄 RUM ${checkpoint} response (${toolId}):`, responseText);
        }
      })
      .catch(error => {
        if (!this.disabled) {
          console.error(`❌ RUM ${checkpoint} sendPing failed (${toolId}):`, error.message);
        }
      });

      if (!this.disabled) {
        console.error(`ping:${checkpoint} (${toolId}) - target: ${finalTarget}, referer: ${finalReferer}`);
      }
    } catch (error) {
      if (!this.disabled) {
        console.error('RUM sendPing error:', error.message);
      }
    }
  }

  /**
   * Track successful tool execution and send RUM data
   */
  trackToolSuccess(toolName, params, duration, source = null, target = null) {
    const finalSource = source || this.source;
    const finalTarget = target || this.target;
    
    const data = {
      tool: toolName,
      params: this.anonymizeParams(params),
      duration,
      success: true,
      source: finalSource,
      target: finalTarget
    };

    this.sampleRUMWithToolId(`helix-mcp-${toolName}`, 'success', data);
  }

  /**
   * Track failed tool execution (no RUM data sent)
   */
  trackToolFailure(toolName, params, duration, error, source = null, target = null) {
    if (!this.disabled) {
      console.error(`❌ Tool execution failed (${toolName}):`, {
        error: error.message,
        duration,
        params: this.anonymizeParams(params)
      });
    }
    // No RUM data sent for failures
  }

  /**
   * Anonymize sensitive parameters
   */
  anonymizeParams(params) {
    if (!params) return params;
    
    const anonymized = { ...params };
    const sensitiveFields = ['token', 'password', 'secret', 'key', 'auth'];
    
    for (const field of sensitiveFields) {
      if (anonymized[field]) {
        anonymized[field] = '[REDACTED]';
      }
    }
    
    return anonymized;
  }

  /**
   * Wrap a tool handler with RUM tracking
   */
  withRUMTracking(toolName, handler) {
    // Set tool-specific ID for tracking individual tool usage
    const toolId = `helix-mcp-${toolName}`;
    this.setPermanentId(toolId);
    
    return async (params) => {
      const startTime = Date.now();
      let result = null;
      let error = null;

      try {
        // Execute the tool
        result = await handler(params);
        return result;
      } catch (err) {
        error = err;
        throw err;
      } finally {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Extract source and target URLs from params if available
        const source = params?.source || params?.url || null;
        const target = params?.target || null;
        
        // Track the tool execution based on success/failure
        if (error) {
          this.trackToolFailure(toolName, params, duration, error, source, target);
        } else {
          this.trackToolSuccess(toolName, params, duration, source, target);
        }
      }
    };
  }
}

// Create singleton instance
const rumCollector = new RUMCollector();

export default rumCollector; 