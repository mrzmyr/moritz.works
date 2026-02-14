import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getLiveblocksClient } from "@/lib/liveblocks-server";
import { renderStrokesToPng } from "@/lib/canvas-render";
import { sendTelegramPhoto } from "@/lib/telegram";

/** Minimum delay (ms) between a change and its notification. */
const NOTIFY_DELAY_MS = 60 * 60 * 1000; // 1 hour

/**
 * GET /api/cron/canvas-notify
 *
 * Called by Vercel Cron every 15 minutes.
 * Checks canvas rooms for changes older than 1 hour that haven't
 * been notified yet, renders a PNG snapshot, and sends it via Telegram.
 */
export async function GET(req: NextRequest) {
  // Vercel Cron sends an Authorization header with the CRON_SECRET
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const liveblocks = getLiveblocksClient();

  // Fetch all canvas rooms using the query language (roomId prefix match)
  const { data: rooms } = await liveblocks.getRooms({
    query: 'roomId^"canvas:"',
  });

  const now = Date.now();
  const notified: string[] = [];

  for (const room of rooms) {
    const lastChangedAt = room.metadata.lastChangedAt;
    const lastNotifiedAt = room.metadata.lastNotifiedAt;

    // Skip rooms with no recorded change
    if (!lastChangedAt || typeof lastChangedAt !== "string") continue;

    const changedMs = new Date(lastChangedAt).getTime();

    // Skip if the change is too recent (< 1h ago)
    if (now - changedMs < NOTIFY_DELAY_MS) continue;

    // Skip if we already notified for this change
    if (
      lastNotifiedAt &&
      typeof lastNotifiedAt === "string" &&
      new Date(lastNotifiedAt).getTime() >= changedMs
    ) {
      continue;
    }

    // Fetch storage and render
    let storage: { strokes?: { liveblocksType: string; data: unknown[] } };
    try {
      storage = (await liveblocks.getStorageDocument(
        room.id,
        "plain-lson",
      )) as typeof storage;
    } catch {
      console.error(`Failed to fetch storage for ${room.id}`);
      continue;
    }

    // Parse strokes from the plain-lson format.
    // In plain-lson, a LiveList is { liveblocksType: "LiveList", data: [...] }
    // and each LiveObject is { liveblocksType: "LiveObject", data: {...} }.
    const rawStrokes = storage?.strokes?.data;
    if (!rawStrokes || !Array.isArray(rawStrokes) || rawStrokes.length === 0) {
      continue;
    }

    const strokes = rawStrokes.map((entry: unknown) => {
      const obj = entry as {
        liveblocksType: string;
        data: Record<string, unknown>;
      };
      return obj.data as {
        id: string;
        points: number[];
        color: string;
        size: number;
        isEraser: boolean;
        side: "left" | "right";
      };
    });

    const png = renderStrokesToPng(strokes);

    const slug = room.id.replace(/^canvas:/, "");
    const caption = `Canvas update: ${slug}\n${strokes.length} strokes\n${new Date(lastChangedAt).toLocaleString("en-GB", { timeZone: "Europe/Berlin" })}`;

    try {
      await sendTelegramPhoto({ png, caption });
    } catch (err) {
      console.error(`Failed to send Telegram notification for ${room.id}`, err);
      continue;
    }

    // Mark as notified
    await liveblocks.updateRoom(room.id, {
      metadata: {
        lastNotifiedAt: new Date().toISOString(),
      },
    });

    notified.push(room.id);
  }

  return NextResponse.json({
    ok: true,
    checked: rooms.length,
    notified,
  });
}
