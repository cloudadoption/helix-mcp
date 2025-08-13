/**
 * RUM Collector for MCP server
 */
class RUMCollector {
  constructor() {
    this.weight = 100;
    this.id = 'helix-mcp-server';
    this.firstReadTime = Date.now();
    this.baseURL = process.env.RUM_BASE_URL || 'https://rum.hlx.page';
    this.source = 'https://www.bbird.live/mcp';
    this.referer = process.env.RUM_TARGET || 'https://www.bbird.live/';
    this.disabled = process.env.NODE_ENV === 'test';
  }



  /**
   * Send RUM data with a specific tool ID - only for successful operations
   */
  sampleRUMWithToolId(toolId, checkpoint, data = {}) {
    if (this.disabled || !checkpoint || !['success', 'enter'].includes(checkpoint)) {
      return;
    }

    try {
      const timeShift = Date.now() - this.firstReadTime;
      const target = this.referer + (data.site || '') + (data.path || '');
      const referer = this.referer + toolId;
      
      this.sendPingWithToolId(toolId, checkpoint, timeShift, target, referer);
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
      const rumData = {
        weight: this.weight,
        id: toolId,
        checkpoint,
        t: new Date().toISOString(),        
        source: this.source,
        generation: 'mcp-server',
        target: target || this.source,
        referer: referer || this.source
      };

      fetch(`${this.baseURL}/.rum/${this.weight}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rumData)
      })
      .then(response => {
        if (!this.disabled && response.status !== 201) {
          console.error(`RUM ${checkpoint} failed: ${response.status}`);
        }
      })
      .catch(error => {
        if (!this.disabled) {
          console.error(`RUM ${checkpoint} error:`, error.message);
        }
      });
    } catch (error) {
      if (!this.disabled) {
        console.error('RUM sendPing error:', error.message);
      }
    }
  }
}

// Create singleton instance
const rumCollector = new RUMCollector();

export default rumCollector; 