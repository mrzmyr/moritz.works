"use client";

import { createContext, useContext, type MutableRefObject } from "react";
import type { DbNode } from "@/lib/db/schema";
import type { AgentNodeData } from "./types";

export type HistoryEntry =
  | { type: "create"; nodeId: string; nodeData: DbNode }
  | {
      type: "delete";
      snapshot: DbNode;
      childEdges: Array<{
        childId: string;
        sourceHandle: string;
        targetHandle: string;
      }>;
    }
  | {
      type: "update";
      nodeId: string;
      before: Partial<AgentNodeData>;
      after: Partial<AgentNodeData>;
    }
  | {
      type: "move";
      moves: {
        id: string;
        before: { x: number; y: number };
        after: { x: number; y: number };
      }[];
    }
  | {
      type: "connect";
      targetId: string;
      prevParentId: string | null;
      prevSourceHandle: string | null;
      prevTargetHandle: string | null;
      newParentId: string;
      newSourceHandle: string;
      newTargetHandle: string;
    }
  | {
      type: "disconnect";
      targetId: string;
      prevParentId: string;
      prevSourceHandle: string;
      prevTargetHandle: string;
    };

export interface HistoryContextValue {
  pushHistory: (entry: HistoryEntry) => void;
  /** ID of the node whose title should be auto-focused on next mount. */
  focusPendingRef: MutableRefObject<string | null>;
  /** Toggle the collapsed state of a node's children. */
  toggleCollapse: (nodeId: string) => void;
}

export const HistoryContext = createContext<HistoryContextValue | null>(null);

export function useHistoryContext() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistoryContext must be inside Canvas");
  return ctx;
}
