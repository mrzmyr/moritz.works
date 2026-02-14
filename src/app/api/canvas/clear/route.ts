import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getLiveblocksClient } from "@/lib/liveblocks-server";

/**
 * POST /api/canvas/clear
 *
 * Admin-only endpoint to wipe a room's storage.
 * Requires: Authorization: Bearer <CANVAS_ADMIN_SECRET>
 * Body:     { "roomId": "canvas:some-slug" }
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CANVAS_ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CANVAS_ADMIN_SECRET not configured" },
      { status: 500 },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { roomId?: string };
  if (!body.roomId || typeof body.roomId !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid roomId" },
      { status: 400 },
    );
  }

  const liveblocks = getLiveblocksClient();
  await liveblocks.deleteStorageDocument(body.roomId);

  return NextResponse.json({ ok: true, roomId: body.roomId });
}
