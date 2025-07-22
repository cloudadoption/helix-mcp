import { getUserAgent } from "universal-user-agent";

export const VERSION = process.env.VERSION || "0.0.1";
export const USER_AGENT = `modelcontextprotocol/servers/helix/v${VERSION} ${getUserAgent()}`;
export const DA_ADMIN_API_URL = "https://admin.da.live";
export const HELIX_ADMIN_API_URL = "https://admin.hlx.page";