"use client";

import { DrawingContextProvider } from "./drawing-context";
import { DrawingCanvas } from "./drawing-canvas";
import { DrawingToolbar } from "./drawing-toolbar";

/**
 * Client component that renders the shared drawing context, canvas, and toolbar.
 * Must be a child of <DrawingProvider> (Liveblocks RoomProvider).
 */
export function DrawingLayer() {
  return (
    <DrawingContextProvider>
      <DrawingCanvas />
      <DrawingToolbar />
    </DrawingContextProvider>
  );
}
