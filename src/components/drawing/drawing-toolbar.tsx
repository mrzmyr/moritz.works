"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useDrawingContext,
  BRUSH_SIZES,
  LIGHT_COLORS,
  DARK_COLORS,
  COLOR_LABELS,
} from "./drawing-context";
import { cn } from "@/lib/utils";

function isDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function DrawingToolbar() {
  const {
    colorIndex,
    brushSize,
    isEraser,
    drawModeEnabled,
    strokes,
    setColorIndex,
    setBrushSize,
    setIsEraser,
    setDrawModeEnabled,
    deleteStroke,
  } = useDrawingContext();

  const handleUndo = useCallback(() => {
    if (!strokes || strokes.length === 0) return;
    deleteStroke(strokes[strokes.length - 1].id);
  }, [strokes, deleteStroke]);

  const [expanded, setExpanded] = useState(false);
  const [dark, setDark] = useState(false);

  // Drag state
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );

  // Detect dark mode
  useEffect(() => {
    setDark(isDarkMode());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const palette = dark ? DARK_COLORS : LIGHT_COLORS;
  const currentColor = palette[colorIndex] ?? palette[10];

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-no-drag]")) return;

      const toolbar = toolbarRef.current;
      if (!toolbar) return;

      const rect = toolbar.getBoundingClientRect();
      dragState.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: rect.left,
        offsetY: rect.top,
      };

      toolbar.setPointerCapture(e.pointerId);
    },
    [],
  );

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.isDragging) return;

    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;

    setPosition({
      x: dragState.current.offsetX + dx,
      y: dragState.current.offsetY + dy,
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    dragState.current.isDragging = false;
  }, []);

  const toolbarStyle: React.CSSProperties = position
    ? {
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: "auto",
        transform: "none",
      }
    : {
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
      };

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "z-50 select-none",
        "rounded-2xl border shadow-lg backdrop-blur-sm",
        "bg-white/90 border-neutral-200",
        "dark:bg-neutral-900/90 dark:border-neutral-700",
        "transition-[width,height] duration-200 ease-out",
      )}
      style={toolbarStyle}
      onPointerDown={handleDragStart}
      onPointerMove={handleDragMove}
      onPointerUp={handleDragEnd}
      onPointerLeave={handleDragEnd}
    >
      {!expanded ? (
        <button
          type="button"
          data-no-drag
          onClick={() => setExpanded(true)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl",
            "text-sm font-medium",
            "text-neutral-600 dark:text-neutral-300",
            "hover:bg-neutral-100 dark:hover:bg-neutral-800",
            "transition-colors",
          )}
        >
          <span className="text-base">{isEraser ? "◎" : "●"}</span>
          <span
            className="w-3 h-3 rounded-full border border-neutral-300 dark:border-neutral-600"
            style={{
              backgroundColor: isEraser ? "transparent" : currentColor,
            }}
          />
          <span className="hidden sm:inline">Draw</span>
          <span className="text-xs text-neutral-400">▲</span>
        </button>
      ) : (
        <div className="p-3 space-y-3 min-w-[280px]">
          {/* Header with collapse + mobile draw toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 cursor-grab active:cursor-grabbing">
              ⠿ Draw
            </span>
            <div className="flex items-center gap-1">
              {/* Mobile draw mode toggle */}
              <button
                type="button"
                data-no-drag
                onClick={() => setDrawModeEnabled(!drawModeEnabled)}
                className={cn(
                  "sm:hidden px-2 py-1 rounded-lg text-xs font-medium transition-colors",
                  drawModeEnabled
                    ? "bg-blue-500 text-white"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
                )}
              >
                {drawModeEnabled ? "Drawing" : "Touch: Scroll"}
              </button>
              <button
                type="button"
                data-no-drag
                onClick={() => setExpanded(false)}
                className="px-2 py-1 rounded-lg text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                ▼
              </button>
            </div>
          </div>

          {/* Color palette */}
          <div className="flex flex-wrap gap-1.5" data-no-drag>
            {palette.map((color, i) => (
              <button
                key={COLOR_LABELS[i]}
                type="button"
                title={COLOR_LABELS[i]}
                onClick={() => {
                  setColorIndex(i);
                  setIsEraser(false);
                }}
                className={cn(
                  "w-6 h-6 rounded-full transition-all duration-150",
                  "border-2",
                  "hover:scale-110",
                  colorIndex === i && !isEraser
                    ? "border-neutral-900 dark:border-white scale-110 ring-2 ring-neutral-400/50"
                    : "border-neutral-200 dark:border-neutral-700",
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Brush size + eraser */}
          <div
            className="flex items-center justify-between gap-2"
            data-no-drag
          >
            <div className="flex items-center gap-1.5">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  title={`Brush size: ${size}px`}
                  onClick={() => setBrushSize(size)}
                  className={cn(
                    "flex items-center justify-center",
                    "w-8 h-8 rounded-lg transition-all duration-150",
                    "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    brushSize === size
                      ? "bg-neutral-100 dark:bg-neutral-800 ring-2 ring-neutral-300 dark:ring-neutral-600"
                      : "",
                  )}
                >
                  <span
                    className="rounded-full bg-neutral-800 dark:bg-neutral-200"
                    style={{
                      width: `${Math.max(4, size * 0.6)}px`,
                      height: `${Math.max(4, size * 0.6)}px`,
                    }}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              title="Eraser"
              onClick={() => setIsEraser(!isEraser)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                isEraser
                  ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700",
              )}
            >
              Eraser
            </button>

            <button
              type="button"
              title="Undo last stroke"
              onClick={handleUndo}
              disabled={!strokes || strokes.length === 0}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
                "hover:bg-neutral-200 dark:hover:bg-neutral-700",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              )}
            >
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
