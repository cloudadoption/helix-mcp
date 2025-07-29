/**
 * RUM Collector for MCP server
 */
class RUMCollector {
  constructor() {
    this.weight = 1; // Default to 100% sampling
    this.id = 'helix-mcp-server'; // Permanent ID for tools
    this.queue = [];
    this.firstReadTime = Date.now();
    this.baseURL = process.env.RUM_BASE_URL || 'https://rum.hlx.page';
    this.collectBaseURL = this.baseURL;
    this.source = 'https://www.bbird.live/';
    this.target = process.env.RUM_TARGET || 'https://rum.hlx.page';
    
    this.initialize();
  }

  initialize() {
    this.isSelected = Math.random() < this.weight;
    console.log('🔍 RUM Collector initialized:', {
      weight: this.weight,
      id: this.id,
      isSelected: this.isSelected,
      baseURL: this.baseURL,
      source: this.source,
      target: this.target
    });
  }

  generateId() {
    return Math.random().toString(36).substring(2, 6);
  }

  setSource(source) {
    this.source = source;
  }

  setTarget(target) {
    this.target = target;
  }

  /**
   * Set a permanent ID for the RUM collector
   */
  setPermanentId(id) {
    this.id = id;
    console.log(`🆔 RUM ID set to: ${id}`);
  }

  /**
   * Send RUM data with a specific tool ID
   */
  sampleRUMWithToolId(toolId, checkpoint, data = {}) {
    try {
      if (!this.isSelected || !checkpoint) {
        return;
      }

      const timeShift = () => Date.now() - this.firstReadTime;
      
      // Add to queue with tool-specific data
      this.queue.push([checkpoint, { ...data, toolId }, timeShift()]);
      
      // Send ping for important checkpoints (without data)
      if (['error', 'startup', 'shutdown', 'enter'].includes(checkpoint)) {
        // Extract baseUrl as referer from data if available
        const baseUrl = data.baseUrl || null;
        const target = data.target || null;
        this.sendPingWithToolId(toolId, checkpoint, timeShift(), baseUrl, target);
      }
      
    } catch (error) {
      console.error('RUM Error:', error.message);
    }
  }

  sampleRUM(checkpoint, data = {}) {
    try {
      if (!this.isSelected || !checkpoint) {
        return;
      }

      const timeShift = () => Date.now() - this.firstReadTime;
      
      // Add to queue
      this.queue.push([checkpoint, data, timeShift()]);
      
      // Send ping for important checkpoints (without data)
      if (['error', 'startup', 'shutdown', 'enter'].includes(checkpoint)) {
        // Extract source and target from data if available
        const source = data.source || null;
        const target = data.target || null;
        this.sendPing(checkpoint, timeShift(), source, target);
      }
      
    } catch (error) {
      console.error('RUM Error:', error.message);
    }
  }

  /**
   * Send ping to RUM endpoint with tool-specific ID
   */
  sendPingWithToolId(toolId, checkpoint, time, source = null, target = null) {
    try {
      // Use provided source/target or fall back to instance values      
      const finalTarget = source;
      
      const rumData = JSON.stringify({
        weight: this.weight,
        id: toolId, // Use the specific tool ID
        checkpoint,
        t: new Date().toISOString(),
        referer: finalTarget,
        source: this.source,
        target: finalTarget,
        generation: 'mcp-server'
      });

      const url = `${this.collectBaseURL}/.rum/${this.weight}`;
      
      // Use fetch instead of sendBeacon for Node.js
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: rumData
      })
      .then(response => {
        console.log(`✅ RUM ${checkpoint} ping successful (${toolId}):`, {
          status: response.status,
          statusText: response.statusText,
          url: url,
          success: response.status === 201 ? 'Data collected' : 'Unexpected status'
        });
        return response.text();
      })
      .then(responseText => {
        if (responseText) {
          console.log(`📄 RUM ${checkpoint} response (${toolId}):`, responseText);
        }
      })
      .catch(error => {
        console.error(`❌ RUM ${checkpoint} sendPing failed (${toolId}):`, error.message);
      });

      console.debug(`ping:${checkpoint} (${toolId})`);
    } catch (error) {
      console.error('RUM sendPing error:', error.message);
    }
  }

  /**
   * Send ping to RUM endpoint (adapted from web version)
   */
  sendPing(checkpoint, time, source = null, target = null) {
    try {
      // Use provided source/target or fall back to instance values
      const finalSource = source || this.source;
      const finalTarget = target || this.target;
      
      const rumData = JSON.stringify({
        weight: this.weight,
        id: this.id,
        checkpoint,
        t: new Date().toISOString(),
        referer: finalSource,
        source: this.source,
        target: finalTarget,
        generation: 'mcp-server'
      });

      const url = `${this.collectBaseURL}/.rum/${this.weight}`;
      
      // Use fetch instead of sendBeacon for Node.js
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: rumData
      })
      .then(response => {
        console.log(`✅ RUM ${checkpoint} ping successful:`, {
          status: response.status,
          statusText: response.statusText,
          url: url,
          success: response.status === 201 ? 'Data collected' : 'Unexpected status'
        });
        return response.text();
      })
      .then(responseText => {
        if (responseText) {
          console.log(`📄 RUM ${checkpoint} response:`, responseText);
        }
      })
      .catch(error => {
        console.error(`❌ RUM ${checkpoint} sendPing failed:`, error.message);
      });

      console.debug(`ping:${checkpoint}`);
    } catch (error) {
      console.error('RUM sendPing error:', error.message);
    }
  }

  /**
   * Track tool execution
   */
  trackToolExecution(toolName, params, duration, success = true, error = null, source = null, target = null) {
    // Use provided source/target or fall back to instance values
    const finalSource = source || this.source;
    const finalTarget = target || this.target;
    
    const data = {
      tool: toolName,
      params: this.anonymizeParams(params),
      duration,
      success,
      error: error ? error.message : null,
      source: finalSource,
      target: finalTarget
    };

    this.sampleRUM('cwv', data);
  }

  /**
   * Track error
   */
  trackError(error, context = {}, source = null, target = null) {
    // Use provided source/target or fall back to instance values
    const finalSource = source || this.source;
    const finalTarget = target || this.target;
    
    const data = {
      error: error.message,
      stack: error.stack,
      context,
      source: finalSource,
      target: finalTarget
    };

    this.sampleRUM('error', data);
  }

  /**
   * Track MCP test event
   */
  trackMCPTest(testName, testData = {}, source = null, target = null) {
    // Use provided source/target or fall back to instance values
    const finalSource = source || this.source;
    const finalTarget = target || this.target;
    
    const data = {
      testName,
      testData,
      source: finalSource,
      target: finalTarget
    };

    this.sampleRUM('cwv', data);
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
   * Shutdown and send remaining data
   */
  async shutdown() {
    this.sampleRUM('shutdown', { 
      service: 'helix-mcp-server', 
      source: this.source, 
      target: this.target 
    });
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
        
        // Track the tool execution
        this.trackToolExecution(
          toolName,
          params,
          duration,
          !error,
          error,
          source,
          target
        );
      }
    };
  }

  /**
   * Get RUM status
   */
  getRUMStatus() {
    return {
      isSelected: this.isSelected,
      weight: this.weight,
      id: this.id,
      queueSize: this.queue.length,
      baseURL: this.baseURL,
      source: this.source,
      target: this.target
    };
  }
}

// Create singleton instance
const rumCollector = new RUMCollector();

export default rumCollector; 