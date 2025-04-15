import { getUserAgent } from "universal-user-agent";

export const VERSION = process.env.VERSION || "0.0.1";
export const USER_AGENT = `modelcontextprotocol/servers/da-live/v${VERSION} ${getUserAgent()}`;
export const ADMIN_API_URL = "https://admin.da.live";