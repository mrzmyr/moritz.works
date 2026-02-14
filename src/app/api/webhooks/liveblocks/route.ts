import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { WebhookHandler } from "@liveblocks/node";
import { getLiveblocksClient } from "@/lib/liveblocks-server";

/**
 * POST /api/webhooks/liveblocks
 *
 * Receives Liveblocks webhook events.
 * On `storageUpdated`, stamps the room metadata with `lastChangedAt`
 * so the cron job knows when to send a notification.
 */
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.LIVEBLOCKS_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "LIVEBLOCKS_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }

  const handler = new WebhookHandler(webhookSecret);

  const rawBody = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  let event: ReturnType<WebhookHandler["verifyRequest"]>;
  try {
    event = handler.verifyRequest({ rawBody, headers });
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  if (event.type !== "storageUpdated") {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const { roomId } = event.data;

  // Only process our canvas rooms
  if (!roomId.startsWith("canvas:")) {
    return NextResponse.json({ ok: true, ignored: "non-canvas room" });
  }

  const liveblocks = getLiveblocksClient();

  await liveblocks.updateRoom(roomId, {
    metadata: {
      lastChangedAt: new Date().toISOString(),
    },
  });

  return NextResponse.json({ ok: true, roomId });
}
