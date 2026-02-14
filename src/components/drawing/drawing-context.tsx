"use client";

import { LiveObject } from "@liveblocks/client";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { type Stroke, useMutation, useStorage } from "@/lib/liveblocks";

const BRUSH_SIZES = [10, 20, 36] as const;
type BrushSize = (typeof BRUSH_SIZES)[number];

/**
 * Theme-adaptive Tailwind color palette.
 * Light mode uses -600/-700 shades, dark mode uses -300/-400 shades.
 */
const LIGHT_COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#eab308", // yellow-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#06b6d4", // cyan-500
  "#0ea5e9", // sky-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#a855f7", // purple-500
  "#d946ef", // fuchsia-500
  "#ec4899", // pink-500
  "#f43f5e", // rose-500
  "#171717", // neutral-900 (black)
  "#fafafa", // neutral-50 (white)
] as const;

const DARK_COLORS = [
  "#fca5a5", // red-300
  "#fdba74", // orange-300
  "#fcd34d", // amber-300
  "#fde047", // yellow-300
  "#bef264", // lime-300
  "#86efac", // green-300
  "#6ee7b7", // emerald-300
  "#5eead4", // teal-300
  "#67e8f9", // cyan-300
  "#7dd3fc", // sky-300
  "#93c5fd", // blue-300
  "#a5b4fc", // indigo-300
  "#c4b5fd", // violet-300
  "#d8b4fe", // purple-300
  "#f0abfc", // fuchsia-300
  "#f9a8d4", // pink-300
  "#fda4af", // rose-300
  "#fafafa", // neutral-50 (white)
  "#171717", // neutral-900 (black)
] as const;

const COLOR_LABELS = [
  "Red",
  "Orange",
  "Amber",
  "Yellow",
  "Lime",
  "Green",
  "Emerald",
  "Teal",
  "Cyan",
  "Sky",
  "Blue",
  "Indigo",
  "Violet",
  "Purple",
  "Fuchsia",
  "Pink",
  "Rose",
  "Black",
  "White",
] as const;

/** Maximum strokes per room. Oldest are evicted FIFO when exceeded. */
const MAX_STROKES = 500;

/** Minimum interval between new strokes (ms). */
const STROKE_RATE_LIMIT_MS = 200;

export { BRUSH_SIZES, LIGHT_COLORS, DARK_COLORS, COLOR_LABELS };
export type { BrushSize };

type DrawingContextValue = {
  colorIndex: number;
  brushSize: BrushSize;
  isEraser: boolean;
  isDrawing: boolean;
  drawModeEnabled: boolean;
  strokes: readonly Stroke[] | null;

  setColorIndex: (i: number) => void;
  setBrushSize: (s: BrushSize) => void;
  setIsEraser: (v: boolean) => void;
  setDrawModeEnabled: (v: boolean) => void;

  startStroke: (params: {
    x: number;
    y: number;
    side: "left" | "right" | "top";
    color: string;
  }) => void;
  continueStroke: (params: { x: number; y: number }) => void;
  endStroke: () => void;
  deleteStroke: (strokeId: string) => void;
  currentStrokeIdRef: React.RefObject<string | null>;
};

const DrawingContext = createContext<DrawingContextValue | null>(null);

export function useDrawingContext(): DrawingContextValue {
  const ctx = useContext(DrawingContext);
  if (!ctx) {
    throw new Error(
      "useDrawingContext must be used within a DrawingContextProvider",
    );
  }
  return ctx;
}

/**
 * Provides shared drawing state to all children (canvas + toolbar).
 * Must be rendered inside <RoomProvider> (i.e., inside DrawingProvider).
 */
export function DrawingContextProvider({ children }: { children: ReactNode }) {
  const [colorIndex, setColorIndex] = useState(10); // default blue
  const [brushSize, setBrushSize] = useState<BrushSize>(10);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawModeEnabled, setDrawModeEnabled] = useState(false);

  const currentStrokeIdRef = useRef<string | null>(null);
  const lastStrokeTimeRef = useRef(0);

  const strokes = useStorage((root) => root.strokes);

  const addStroke = useMutation(({ storage }, stroke: Stroke) => {
    const list = storage.get("strokes");
    list.push(new LiveObject(stroke));
    while (list.length > MAX_STROKES) {
      list.delete(0);
    }
  }, []);

  const appendPoints = useMutation(
    (
      { storage },
      { strokeId, newPoints }: { strokeId: string; newPoints: number[] },
    ) => {
      const strokesList = storage.get("strokes");
      const length = strokesList.length;

      for (let i = length - 1; i >= 0; i--) {
        const s = strokesList.get(i);
        if (!s) continue;
        if (s.get("id") === strokeId) {
          const existing = s.get("points");
          s.set("points", [...existing, ...newPoints]);
          break;
        }
      }
    },
    [],
  );

  const deleteStrokeMutation = useMutation(({ storage }, strokeId: string) => {
    const strokesList = storage.get("strokes");
    const length = strokesList.length;

    for (let i = length - 1; i >= 0; i--) {
      const s = strokesList.get(i);
      if (!s) continue;
      if (s.get("id") === strokeId) {
        strokesList.delete(i);
        break;
      }
    }
  }, []);

  const startStroke = useCallback(
    ({
      x,
      y,
      side,
      color,
    }: {
      x: number;
      y: number;
      side: "left" | "right" | "top";
      color: string;
    }) => {
      const now = Date.now();
      if (now - lastStrokeTimeRef.current < STROKE_RATE_LIMIT_MS) return;
      lastStrokeTimeRef.current = now;

      const id = `${now}-${Math.random().toString(36).slice(2, 9)}`;
      currentStrokeIdRef.current = id;
      setIsDrawing(true);

      addStroke({
        id,
        points: [x, y],
        color: isEraser ? "#000000" : color,
        size: brushSize,
        isEraser,
        side,
      });
    },
    [addStroke, brushSize, isEraser],
  );

  const continueStroke = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      const strokeId = currentStrokeIdRef.current;
      if (!strokeId) return;

      appendPoints({ strokeId, newPoints: [x, y] });
    },
    [appendPoints],
  );

  const endStroke = useCallback(() => {
    currentStrokeIdRef.current = null;
    setIsDrawing(false);
  }, []);

  const value: DrawingContextValue = {
    colorIndex,
    brushSize,
    isEraser,
    isDrawing,
    drawModeEnabled,
    strokes,

    setColorIndex,
    setBrushSize,
    setIsEraser,
    setDrawModeEnabled,

    startStroke,
    continueStroke,
    endStroke,
    deleteStroke: deleteStrokeMutation,
    currentStrokeIdRef,
  };

  return (
    <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>
  );
}
