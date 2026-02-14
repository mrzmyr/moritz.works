import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import type { LiveList, LiveObject } from "@liveblocks/client";

/**
 * A single brush/eraser stroke on the collaborative canvas.
 *
 * Coordinates are stored relative to the content edges:
 *   - x: pixel offset from the nearest content edge (positive = outward toward viewport edge)
 *   - y: pixel offset from the top of the post content
 *
 * This keeps strokes anchored to the margins regardless of viewport width.
 */
export type Stroke = {
  id: string;
  /** Flat array of content-relative coords: [x1, y1, x2, y2, ...] */
  points: number[];
  /** Hex color string */
  color: string;
  /** Brush diameter in px */
  size: number;
  /** Whether this stroke erases underlying content */
  isEraser: boolean;
  /** Which side of the content: "left" | "right" */
  side: "left" | "right";
};

type Presence = Record<string, never>;

type Storage = {
  strokes: LiveList<LiveObject<Stroke>>;
};

const apiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

if (!apiKey) {
  console.warn("NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY is not set");
}

const client = createClient({
  publicApiKey: apiKey ?? "",
});

export const {
  RoomProvider,
  useStorage,
  useMutation,
  useSelf,
  useOthers,
} = createRoomContext<Presence, Storage>(client);
