/**
 * WebSocket URL for Yjs collaboration.
 * In dev, routes through the Vite proxy on the same host.
 * In prod, derives from the API origin.
 */
export function getYjsWsUrl() {
  if (import.meta.env.DEV) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/yjs`;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const origin = new URL(apiUrl, window.location.origin).origin;
  return origin.replace(/^http/, "ws") + "/yjs";
}

export const COLLAB_TEXT_KEY = "code";
export const COLLAB_META_KEY = "meta";
export const COLLAB_EXECUTION_KEY = "execution";
