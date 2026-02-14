"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useDrawingContext, LIGHT_COLORS, DARK_COLORS } from "./drawing-context";
import type { Stroke } from "@/lib/liveblocks";

/**
 * Virtual canvas configuration.
 * We cap the canvas height to stay within safe browser limits (Safari ~4096).
 * A buffer above/below the viewport is rendered to avoid visible pop-in.
 */
const CANVAS_MAX_HEIGHT = 3000;
const BUFFER_PX = 1000;

/** Minimum distance from the content edge before drawing activates (px). */
const GUTTER_PX = 16;

function isDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getColorPalette(): readonly string[] {
  return isDarkMode() ? DARK_COLORS : LIGHT_COLORS;
}

/**
 * Get the bounding rect of the content container relative to the page
 * (not the viewport). We use the data attribute to find it.
 */
function getContentRect(): {
  left: number;
  right: number;
  top: number;
} | null {
  const el = document.querySelector("[data-drawing-content]");
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    right: rect.right + window.scrollX,
    top: rect.top + window.scrollY,
  };
}

/**
 * Convert a page-space pointer position to content-relative coordinates.
 * Returns null if the pointer is within the content area (+ gutter).
 */
function pageToContentRelative(
  pageX: number,
  pageY: number,
): { x: number; y: number; side: "left" | "right" } | null {
  const content = getContentRect();
  if (!content) return null;

  const y = pageY - content.top;

  if (pageX < content.left - GUTTER_PX) {
    return { x: content.left - pageX, y, side: "left" };
  }

  if (pageX > content.right + GUTTER_PX) {
    return { x: pageX - content.right, y, side: "right" };
  }

  return null;
}

/**
 * Convert content-relative coords back to page-space for rendering.
 */
function contentRelativeToPage(
  x: number,
  y: number,
  side: "left" | "right",
): { pageX: number; pageY: number } | null {
  const content = getContentRect();
  if (!content) return null;

  const pageY = y + content.top;

  if (side === "left") {
    return { pageX: content.left - x, pageY };
  }

  return { pageX: content.right + x, pageY };
}

/**
 * Render a single stroke onto the canvas context.
 */
function renderStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  canvasTop: number,
  dpr: number,
) {
  const { points, color, size, isEraser, side } = stroke;
  if (points.length < 2) return;

  ctx.save();

  ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
  ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : color;
  ctx.lineWidth = size * dpr;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();

  for (let i = 0; i < points.length; i += 2) {
    const relX = points[i];
    const relY = points[i + 1];

    const page = contentRelativeToPage(relX, relY, side);
    if (!page) continue;

    const canvasX = page.pageX * dpr;
    const canvasY = (page.pageY - canvasTop) * dpr;

    if (i === 0) {
      ctx.moveTo(canvasX, canvasY);
    } else {
      ctx.lineTo(canvasX, canvasY);
    }
  }

  ctx.stroke();
  ctx.restore();
}

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(0);
  const rafRef = useRef<number>(0);

  const {
    strokes,
    colorIndex,
    drawModeEnabled,
    startStroke,
    continueStroke,
    endStroke,
    currentStrokeIdRef,
  } = useDrawingContext();

  const updateCanvasPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollY = window.scrollY;
    const canvasTop = Math.max(0, scrollY - BUFFER_PX);

    container.style.transform = `translateY(${canvasTop}px)`;

    // The container is position:absolute inside a relative parent.
    // We need the actual page-space Y of the canvas to map coords correctly.
    // parentPageTop = the parent's distance from the page origin.
    const parent = container.offsetParent as HTMLElement | null;
    const parentPageTop = parent
      ? parent.getBoundingClientRect().top + scrollY
      : 0;

    scrollTopRef.current = parentPageTop + canvasTop;
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasTop = scrollTopRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!strokes) return;

    const visibleTop = canvasTop;
    const visibleBottom = canvasTop + CANVAS_MAX_HEIGHT;

    for (const stroke of strokes) {
      const { points, side } = stroke;
      let inRange = false;

      for (let i = 1; i < points.length; i += 2) {
        const page = contentRelativeToPage(points[i - 1], points[i], side);
        if (!page) continue;
        if (
          page.pageY >= visibleTop - 100 &&
          page.pageY <= visibleBottom + 100
        ) {
          inRange = true;
          break;
        }
      }

      if (!inRange) continue;

      renderStroke(ctx, stroke, canvasTop, dpr);
    }
  }, [strokes]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;

    canvas.width = width * dpr;
    canvas.height = CANVAS_MAX_HEIGHT * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${CANVAS_MAX_HEIGHT}px`;
  }, []);

  // Setup: resize, position, redraw on scroll/resize
  useEffect(() => {
    resizeCanvas();
    updateCanvasPosition();
    redraw();

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateCanvasPosition();
        redraw();
      });
    };

    const onResize = () => {
      resizeCanvas();
      updateCanvasPosition();
      redraw();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [resizeCanvas, updateCanvasPosition, redraw]);

  // Redraw when strokes change
  useEffect(() => {
    redraw();
  }, [redraw]);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (e.pointerType === "touch" && !drawModeEnabled) return;

      const rel = pageToContentRelative(e.pageX, e.pageY);
      if (!rel) return;

      const palette = getColorPalette();
      const color = palette[colorIndex] ?? palette[10];

      startStroke({ x: rel.x, y: rel.y, side: rel.side, color });
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [colorIndex, startStroke, drawModeEnabled],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!currentStrokeIdRef.current) return;

      const content = getContentRect();
      if (!content) return;

      const y = e.pageY - content.top;
      let x: number;

      if (e.pageX <= (content.left + content.right) / 2) {
        x = content.left - e.pageX;
      } else {
        x = e.pageX - content.right;
      }

      continueStroke({ x, y });
    },
    [continueStroke, currentStrokeIdRef],
  );

  const handlePointerUp = useCallback(() => {
    endStroke();
  }, [endStroke]);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-[calc(-50vw+50%)] w-screen pointer-events-none"
      style={{ height: `${CANVAS_MAX_HEIGHT}px`, zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-auto cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          touchAction: drawModeEnabled ? "none" : "auto",
        }}
      />
    </div>
  );
}
