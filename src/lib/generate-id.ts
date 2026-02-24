const CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";

/** Generates a short, URL-safe, lowercase alphanumeric ID. */
export function generateId(length = 10): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CHARS[b % CHARS.length]).join("");
}
