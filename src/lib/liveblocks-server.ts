import { Liveblocks } from "@liveblocks/node";

let _client: Liveblocks | null = null;

/**
 * Shared Liveblocks server client (singleton).
 * Requires LIVEBLOCKS_SECRET_KEY env var.
 */
export function getLiveblocksClient(): Liveblocks {
  if (_client) return _client;

  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
  }

  _client = new Liveblocks({ secret });
  return _client;
}
