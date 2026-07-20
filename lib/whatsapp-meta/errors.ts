export const META_ERROR_CODES: Record<number, string> = {
  100: "Invalid parameter",
  101: "Missing parameter",
  102: "Session expired",
  103: "API temporarily unavailable",
  1309: "Message sending limit reached",
  1316: "Message too long",
  1317: "Cannot send message to this user",
  1327: "Media download failed",
  1330: "Invalid media ID or URL",
  470: "Access token has expired",
  190: "Invalid access token",
  368: "Temporarily blocked",
  130429: "Rate limit hit",
};

export function getErrorMessage(code: number, fallback?: string): string {
  return META_ERROR_CODES[code] || fallback || `Unknown error (code ${code})`;
}
