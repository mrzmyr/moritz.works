"use client";

import "@xyflow/react/dist/style.css";
import {
  Background,
  BackgroundVariant,
  type Edge,
  ReactFlow,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { DbNode } from "@/lib/db/schema";
import { CANVAS_COLORS } from "./canvas-config";
import { AgentNode } from "./agent-node";
import { CanvasActionsContext, type CanvasActions } from "./canvas-actions-context";
import { HistoryContext } from "./history-context";
import type { AgentNodeType, CardType } from "./types";

const noopActions: CanvasActions = {
  createNode: async () => { throw new Error("read-only canvas"); },
  deleteNode: async () => {},
  updateNode: async () => { throw new Error("read-only canvas"); },
  updateNodePositions: async () => {},
  updateNodeSize: async () => {},
};

const nodeTypes = { agent: AgentNode };

const DEFAULT_NODE_WIDTH = 288;

function useIsDark() {
  return useSyncExternalStore(
    (cb) => {
      const observer = new MutationObserver(cb);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

function dbNodeToRfNode(node: DbNode): AgentNodeType {
  return {
    id: node.id,
    type: "agent" as const,
    position: { x: node.positionX, y: node.positionY },
    style: {
      width: node.width ?? DEFAULT_NODE_WIDTH,
      ...(node.height != null && { height: node.height }),
    },
    data: {
      title: node.title,
      icon: node.icon,
      description: node.description,
      imageUrl: node.imageUrl,
      cardType: (node.cardType as CardType | null) ?? null,
    },
  };
}

function deriveEdges(dbNodes: DbNode[], isDark: boolean): Edge[] {
  return dbNodes
    .filter((n) => n.parentId !== null)
    .map((n) => ({
      id: `e-${n.parentId!}-${n.id}`,
      source: n.parentId!,
      sourceHandle: n.parentSourceHandle ?? "right",
      target: n.id,
      targetHandle: n.parentTargetHandle ?? "left",
      type: "default",
      animated: false,
      style: {
        stroke: isDark ? CANVAS_COLORS.EDGE_DARK : CANVAS_COLORS.EDGE_LIGHT,
        strokeWidth: 1.5,
      },
    }));
}

export function CanvasPreviewClient({
  initialNodes,
}: {
  initialNodes: DbNode[];
}) {
  const isDark = useIsDark();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [rfNodes] = useNodesState<AgentNodeType>(
    initialNodes.map(dbNodeToRfNode),
  );
  const [rfEdges] = useEdgesState(deriveEdges(initialNodes, isDark));

  const focusPendingRef = useRef<string | null>(null);

  if (!mounted) return null;

  return (
    <CanvasActionsContext.Provider value={noopActions}>
    <HistoryContext.Provider
      value={{
        pushHistory: () => {},
        focusPendingRef,
        toggleCollapse: () => {},
      }}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: "transparent" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={isDark ? CANVAS_COLORS.DOT_DARK : CANVAS_COLORS.DOT_LIGHT}
        />
      </ReactFlow>
    </HistoryContext.Provider>
    </CanvasActionsContext.Provider>
  );
}
