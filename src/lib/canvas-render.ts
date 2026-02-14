import { createCanvas } from "canvas";

/**
 * Stroke shape matching the Liveblocks storage schema.
 * Duplicated here to avoid importing from client code.
 */
type Stroke = {
  id: string;
  points: number[];
  color: string;
  size: number;
  isEraser: boolean;
  side: "left" | "right" | "top";
};

/**
 * Virtual layout for server-side rendering.
 * We assume a fixed content width centered in the output image.
 */
const CANVAS_WIDTH = 1200;
const CONTENT_WIDTH = 672;
const CONTENT_LEFT = (CANVAS_WIDTH - CONTENT_WIDTH) / 2;
const CONTENT_RIGHT = CONTENT_LEFT + CONTENT_WIDTH;

/** Minimum padding above/below the topmost/bottommost stroke. */
const PADDING_Y = 40;

/**
 * Convert content-relative coords to absolute canvas coords.
 */
function toAbsolute({
  x,
  y,
  side,
  yOffset,
}: {
  x: number;
  y: number;
  side: "left" | "right" | "top";
  yOffset: number;
}): { ax: number; ay: number } {
  const ay = y - yOffset + PADDING_Y;

  if (side === "top") {
    return { ax: CONTENT_LEFT + x, ay };
  }

  if (side === "left") {
    return { ax: CONTENT_LEFT - x, ay };
  }

  return { ax: CONTENT_RIGHT + x, ay };
}

/**
 * Compute the vertical extent (min Y, max Y) across all strokes
 * so we can size the canvas height dynamically.
 */
function computeYBounds(strokes: Stroke[]): { minY: number; maxY: number } {
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const stroke of strokes) {
    for (let i = 1; i < stroke.points.length; i += 2) {
      const y = stroke.points[i];
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (!Number.isFinite(minY)) {
    return { minY: 0, maxY: 100 };
  }

  return { minY, maxY };
}

/**
 * Render an array of strokes to a PNG buffer.
 *
 * The output image has a fixed width of 1200px. Height adapts
 * to the vertical extent of the strokes. A faint center column
 * marks the content area so the margin drawings make visual sense.
 */
export function renderStrokesToPng(strokes: Stroke[]): Buffer {
  if (strokes.length === 0) {
    // Return a tiny 1x1 transparent PNG as a no-op fallback
    const c = createCanvas(1, 1);
    return c.toBuffer("image/png");
  }

  const { minY, maxY } = computeYBounds(strokes);
  const canvasHeight = Math.max(200, maxY - minY + PADDING_Y * 2);

  const canvas = createCanvas(CANVAS_WIDTH, canvasHeight);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#fafafa";
  ctx.fillRect(0, 0, CANVAS_WIDTH, canvasHeight);

  // Faint content area indicator
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(CONTENT_LEFT, 0, CONTENT_WIDTH, canvasHeight);

  // Draw each stroke
  for (const stroke of strokes) {
    const { points, color, size, isEraser, side } = stroke;
    if (points.length < 4) continue; // need at least 2 points (4 numbers)

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }

    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();

    for (let i = 0; i < points.length; i += 2) {
      const relX = points[i];
      const relY = points[i + 1];
      const { ax, ay } = toAbsolute({ x: relX, y: relY, side, yOffset: minY });

      if (i === 0) {
        ctx.moveTo(ax, ay);
      } else {
        ctx.lineTo(ax, ay);
      }
    }

    ctx.stroke();
  }

  // Reset composite operation
  ctx.globalCompositeOperation = "source-over";

  return canvas.toBuffer("image/png");
}
