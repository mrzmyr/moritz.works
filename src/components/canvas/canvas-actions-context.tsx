"use client";

import { createContext, useContext } from "react";
import type { DbNode } from "@/lib/db/schema";

export interface CanvasActions {
  createNode: (input: {
    id?: string;
    parentId?: string | null;
    positionX: number;
    positionY: number;
  }) => Promise<DbNode>;
  deleteNode: (id: string) => Promise<void>;
  updateNode: (input: {
    id: string;
    title?: string;
    icon?: string | null;
    description?: string | null;
    positionX?: number;
    positionY?: number;
    imageUrl?: string | null;
    cardType?: string | null;
    parentId?: string | null;
    parentSourceHandle?: string | null;
    parentTargetHandle?: string | null;
  }) => Promise<DbNode>;
  updateNodePositions: (
    positions: { id: string; x: number; y: number }[],
  ) => Promise<void>;
  updateNodeSize: (input: {
    id: string;
    width?: number;
    height?: number;
  }) => Promise<void>;
}

export const CanvasActionsContext = createContext<CanvasActions | null>(null);

export function useCanvasActions(): CanvasActions {
  const ctx = useContext(CanvasActionsContext);
  if (!ctx)
    throw new Error("useCanvasActions must be used inside Canvas");
  return ctx;
}
