# Helix MCP Demo Script

## Intro — What is Helix MCP and how to set it up
- Define Helix MCP: a local MCP server exposing development and admin tools for AEM Edge Delivery Services
- Explain where it runs: Usable from any MCP enabled agent; cursor, claude code, vs code copitot, etc.
- Quick start: use add to cursor button in readme

## Development — Building a new block using Helix MCP
- Discover available blocks and inspect implementations via the block collection (list and details)
- Use prompts/resource templates to scaffold a new block and required assets
- Iterate quickly: run prompts to update files, preview locally, and validate behavior
- Validate pages that include the new block: check page status, preview links, and recent changes

## Admin — Using MCP tools to manage site content
- Audit publishing workflow: bulk page status to find not-previewed/not-published/outdated pages
- Inspect a single page: status, preview/live links, source vs preview timestamps, redirect detection
- Investigate issues: check audit logs for who did what/when and error statuses
- Monitor real-user performance: fetch RUM metrics (LCP, CLS, INP, TTFB) by page or site and time window

## Wrap up — Key points, takeaways, and next steps
- One local server, many capabilities: developer scaffolding, content status, logs, and performance data
- Faster workflows: fewer context switches, consistent tooling across dev and admin tasks
- Next steps: add more tools, including prompt templates for common activities


