"use client";

import type { DbNode } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  type Edge,
  type EdgeChange,
  type Node,
  type OnConnect,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type XYPosition,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  MousePointerClick,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { toast } from "sonner";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { addCards as addCardsUtil, type CardSpec } from "./add-cards";
import { AgentNode } from "./agent-node";
import {
  CanvasActionsContext,
  type CanvasActions,
} from "./canvas-actions-context";
import { CANVAS_COLORS } from "./canvas-config";
import {
  getHelperLines,
  HelperLines,
  type HelperLinesHandle,
} from "./helper-lines";
import { HistoryContext, type HistoryEntry } from "./history-context";
import { generateId } from "@/lib/generate-id";
import type { AgentNodeData, AgentNodeType, CardType } from "./types";

const nodeTypes = { agent: AgentNode };

function FlowUtils({
  screenToFlowRef,
}: {
  screenToFlowRef: React.MutableRefObject<
    ((pos: XYPosition) => XYPosition) | null
  >;
}) {
  const { screenToFlowPosition } = useReactFlow();
  useEffect(() => {
    screenToFlowRef.current = screenToFlowPosition;
  }, [screenToFlowPosition, screenToFlowRef]);
  return null;
}

function ZoomResetHandler() {
  const { zoomTo } = useReactFlow();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (!modifier || e.key !== "0") return;
      e.preventDefault();
      zoomTo(1, { duration: 200 });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomTo]);
  return null;
}

function FocusNodeOnMount({ nodeId }: { nodeId: string | null }) {
  const { fitView } = useReactFlow();
  const didFocus = useRef(false);
  useEffect(() => {
    if (!nodeId || didFocus.current) return;
    const t = setTimeout(() => {
      fitView({
        nodes: [{ id: nodeId }],
        duration: 600,
        padding: 0.4,
        maxZoom: 1,
      });
      didFocus.current = true;
    }, 150);
    return () => clearTimeout(t);
  }, [nodeId, fitView]);
  return null;
}

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

const DEFAULT_NODE_WIDTH = 288;
const CANVAS_CLIPBOARD_KEY = "canvas_clipboard";

const getEdgeStyle = (isDark: boolean) => ({
  stroke: isDark ? CANVAS_COLORS.EDGE_DARK : CANVAS_COLORS.EDGE_LIGHT,
  strokeWidth: 1.5,
});

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
      shortId: node.shortId ?? null,
      cardType: (node.cardType as CardType | null) ?? null,
      linkUrl: node.linkUrl ?? null,
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
      style: getEdgeStyle(isDark),
    }));
}

type ContextMenuState = {
  x: number;
  y: number;
  flowPos: XYPosition;
  targetNodeId: string | null;
  targetEdgeId: string | null;
};

export interface CanvasHandle {
  addCards: (
    cards: CardSpec[],
    parentId?: string | null,
  ) => Promise<void>;
}

interface CanvasProps {
  initialNodes: DbNode[];
  title: string;
  canvasSlug: string;
  canEdit?: boolean;
  actions: CanvasActions;
  ref?: React.Ref<CanvasHandle>;
  onSelectionChange?: (ids: string[]) => void;
}

export function Canvas({
  initialNodes,
  title,
  canvasSlug,
  canEdit: canEditProp = false,
  actions,
  ref,
  onSelectionChange,
}: CanvasProps) {
  const {
    createNode,
    deleteNode,
    updateNode,
    updateNodePositions,
    updateNodeSize,
  } = actions;

  const canEdit = canEditProp;
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nodeParam = searchParams.get("node");
  const focusNodeId = useMemo(() => {
    if (!nodeParam) return null;
    const byId = initialNodes.find((n) => n.id === nodeParam);
    if (byId) return byId.id;
    const byShortId = initialNodes.find((n) => n.shortId === nodeParam);
    return byShortId?.id ?? null;
  }, [nodeParam, initialNodes]);
  const isDark = useIsDark();

  const [rfNodes, setNodes, onNodesChange] = useNodesState<AgentNodeType>(
    (initialNodes ?? []).map(dbNodeToRfNode),
  );
  const [rfEdges, setEdges, onEdgesChangeRaw] = useEdgesState(
    deriveEdges(initialNodes ?? [], isDark),
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeRaw(changes.filter((c) => c.type !== "remove"));
    },
    [onEdgesChangeRaw],
  );

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [cardTypeSubmenuOpen, setCardTypeSubmenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const undoStack = useRef<HistoryEntry[]>([]);
  const redoStack = useRef<HistoryEntry[]>([]);

  const focusPendingRef = useRef<string | null>(null);

  const flowWrapper = useRef<HTMLDivElement>(null);

  const screenToFlowRef = useRef<((pos: XYPosition) => XYPosition) | null>(
    null,
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [syncCount, setSyncCount] = useState(0);
  const isSyncing = syncCount > 0;

  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(
    new Set(),
  );

  const helperLinesRef = useRef<HelperLinesHandle>(null);
  const displayedNodesRef = useRef<typeof displayedNodes>([]);

  const toggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const childrenMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const edge of rfEdges) {
      if (!map.has(edge.source)) map.set(edge.source, new Set());
      map.get(edge.source)!.add(edge.target);
    }
    return map;
  }, [rfEdges]);

  const hiddenNodeIds = useMemo(() => {
    const hidden = new Set<string>();
    function collect(nodeId: string) {
      const children = childrenMap.get(nodeId);
      if (!children) return;
      Array.from(children).forEach((childId) => {
        if (!hidden.has(childId)) {
          hidden.add(childId);
          collect(childId);
        }
      });
    }
    Array.from(collapsedNodeIds).forEach((nodeId) => collect(nodeId));
    return hidden;
  }, [collapsedNodeIds, childrenMap]);

  const displayedNodes = useMemo(
    () =>
      rfNodes.map((n) => ({
        ...n,
        hidden: hiddenNodeIds.has(n.id),
        data: {
          ...n.data,
          hasChildren: (childrenMap.get(n.id)?.size ?? 0) > 0,
          collapsed: collapsedNodeIds.has(n.id),
          isLinked: n.id === focusNodeId,
        },
      })),
    [rfNodes, hiddenNodeIds, childrenMap, collapsedNodeIds, focusNodeId],
  );

  displayedNodesRef.current = displayedNodes;

  const displayedEdges = useMemo(
    () =>
      rfEdges.map((e) => ({
        ...e,
        hidden: hiddenNodeIds.has(e.source) || hiddenNodeIds.has(e.target),
      })),
    [rfEdges, hiddenNodeIds],
  );

  useEffect(() => {
    setEdges((prev) =>
      prev.map((e) => ({ ...e, style: getEdgeStyle(isDark) })),
    );
  }, [isDark, setEdges]);

  useEffect(() => {
    if (!isSyncing) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isSyncing]);

  const [nodesReady, setNodesReady] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setNodesReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const pushHistory = useCallback((entry: HistoryEntry) => {
    undoStack.current = [...undoStack.current.slice(-49), entry];
    redoStack.current = [];
  }, []);

  const addNodeToState = useCallback(
    (dbNode: DbNode) => {
      const rfNode = dbNodeToRfNode(dbNode);
      setNodes((prev) => [...prev, rfNode]);
      if (dbNode.parentId) {
        setEdges((prev) => [
          ...prev,
          {
            id: `e-${dbNode.parentId!}-${dbNode.id}`,
            source: dbNode.parentId!,
            sourceHandle: dbNode.parentSourceHandle ?? "right",
            target: dbNode.id,
            targetHandle: dbNode.parentTargetHandle ?? "left",
            type: "default",
            style: getEdgeStyle(isDark),
          },
        ]);
      }
    },
    [isDark, setNodes, setEdges],
  );

  const removeNodeFromState = useCallback(
    (nodeId: string) => {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setEdges((prev) =>
        prev.filter((e) => e.source !== nodeId && e.target !== nodeId),
      );
    },
    [setNodes, setEdges],
  );

  useImperativeHandle(
    ref,
    () => ({
      async addCards(cards, parentId = null) {
        const parentNode = parentId
          ? rfNodes.find((n) => n.id === parentId)
          : null;

        const basePosition: XYPosition = parentNode
          ? {
              x: parentNode.position.x,
              y:
                parentNode.position.y +
                ((parentNode.style?.height as number | undefined) ?? 160) +
                60,
            }
          : screenToFlowRef.current
            ? screenToFlowRef.current({
                x: window.innerWidth / 2 - (cards.length * 308) / 2,
                y: window.innerHeight / 2,
              })
            : { x: 0, y: 0 };

        const dbNodes = await addCardsUtil(
          cards,
          parentId,
          { createNode, updateNode },
          basePosition,
        );

        for (const dbNode of dbNodes) {
          addNodeToState(dbNode);
        }
      },
    }),
    [rfNodes, screenToFlowRef, createNode, updateNode, addNodeToState],
  );

  const handleCreateNode = useCallback(
    async (
      pos: XYPosition,
      parentId: string | null,
    ): Promise<DbNode | undefined> => {
      setSyncCount((c) => c + 1);
      try {
        const dbNode = await createNode({
          parentId,
          positionX: pos.x,
          positionY: pos.y,
        });
        addNodeToState(dbNode);
        pushHistory({ type: "create", nodeId: dbNode.id, nodeData: dbNode });
        return dbNode;
      } catch {
        toast.error("Failed to create node");
      } finally {
        setSyncCount((c) => c - 1);
      }
    },
    [createNode, addNodeToState, pushHistory],
  );

  const handleTabCreate = useCallback(async () => {
    const selectedNodes = rfNodes.filter((n) => n.selected);
    if (selectedNodes.length !== 1) return;
    const node = selectedNodes[0];
    const nodeWidth =
      (node.style?.width as number | undefined) ?? DEFAULT_NODE_WIDTH;
    const newPos = {
      x: node.position.x + nodeWidth + 64,
      y: node.position.y,
    };
    const newNode = await handleCreateNode(newPos, node.id);
    if (!newNode) return;
    focusPendingRef.current = newNode.id;
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        selected: n.id === newNode.id,
      })),
    );
  }, [rfNodes, handleCreateNode, setNodes]);

  const handlePaste = useCallback(async () => {
    const clipboard = (() => {
      if (clipboardRef.current) return clipboardRef.current;
      try {
        const stored = localStorage.getItem(CANVAS_CLIPBOARD_KEY);
        if (!stored) return null;
        return JSON.parse(stored) as { nodes: AgentNodeType[]; edges: Edge[] };
      } catch {
        return null;
      }
    })();
    if (!clipboard || clipboard.nodes.length === 0) return;

    const PASTE_OFFSET = 40;
    const idMap = new Map<string, string>();
    for (const node of clipboard.nodes) {
      idMap.set(node.id, generateId());
    }

    const newNodes: AgentNodeType[] = clipboard.nodes.map((node) => ({
      ...node,
      id: idMap.get(node.id)!,
      position: {
        x: node.position.x + PASTE_OFFSET,
        y: node.position.y + PASTE_OFFSET,
      },
      selected: true,
      data: { ...node.data },
    }));

    const newEdges: Edge[] = clipboard.edges
      .filter((e) => idMap.has(e.source) && idMap.has(e.target))
      .map((edge) => {
        const newSource = idMap.get(edge.source)!;
        const newTarget = idMap.get(edge.target)!;
        return {
          ...edge,
          id: `e-${newSource}-${newTarget}`,
          source: newSource,
          target: newTarget,
          style: getEdgeStyle(isDark),
        };
      });

    setNodes((prev) => [
      ...prev.map((n) => ({ ...n, selected: false })),
      ...newNodes,
    ]);
    if (newEdges.length > 0) {
      setEdges((prev) => [...prev, ...newEdges]);
    }

    // Sort nodes topologically so parents are created before children (avoids FK violations)
    const pastedIds = new Set(newNodes.map((n) => n.id));
    const parentOf = new Map<string, string>();
    for (const edge of newEdges) {
      parentOf.set(edge.target, edge.source);
    }
    const sorted: AgentNodeType[] = [];
    const visited = new Set<string>();
    function visit(node: AgentNodeType) {
      if (visited.has(node.id)) return;
      visited.add(node.id);
      const pid = parentOf.get(node.id);
      if (pid && pastedIds.has(pid)) {
        const parentNode = newNodes.find((n) => n.id === pid);
        if (parentNode) visit(parentNode);
      }
      sorted.push(node);
    }
    for (const node of newNodes) visit(node);

    setSyncCount((c) => c + 1);
    try {
      for (const node of sorted) {
        const incomingEdge = newEdges.find((e) => e.target === node.id);
        const parentId = incomingEdge?.source ?? null;

        const dbNode = await createNode({
          id: node.id,
          parentId,
          positionX: node.position.x,
          positionY: node.position.y,
        });

        const sourceWidth =
          (node.style?.width as number | undefined) ?? null;
        const sourceHeight =
          (node.style?.height as number | undefined) ?? null;

        const updates: Promise<unknown>[] = [
          updateNode({
            id: dbNode.id,
            title: node.data.title,
            icon: node.data.icon,
            description: node.data.description,
            imageUrl: node.data.imageUrl,
            cardType: node.data.cardType,
            linkUrl: node.data.linkUrl,
            ...(incomingEdge && {
              parentSourceHandle:
                incomingEdge.sourceHandle ?? "right",
              parentTargetHandle:
                incomingEdge.targetHandle ?? "left",
            }),
          }),
        ];

        if (sourceWidth != null || sourceHeight != null) {
          updates.push(
            updateNodeSize({
              id: dbNode.id,
              ...(sourceWidth != null && { width: sourceWidth }),
              ...(sourceHeight != null && { height: sourceHeight }),
            }),
          );
        }

        await Promise.all(updates);
        pushHistory({
          type: "create",
          nodeId: node.id,
          nodeData: {
            ...dbNode,
            title: node.data.title,
            icon: node.data.icon,
            description: node.data.description,
            imageUrl: node.data.imageUrl,
            cardType: node.data.cardType ?? null,
            linkUrl: node.data.linkUrl ?? null,
            width: sourceWidth,
            height: sourceHeight,
          },
        });
      }
    } catch {
      toast.error("Failed to paste");
      const newIds = new Set(newNodes.map((n) => n.id));
      const newEdgeIds = new Set(newEdges.map((e) => e.id));
      setNodes((prev) => prev.filter((n) => !newIds.has(n.id)));
      setEdges((prev) => prev.filter((e) => !newEdgeIds.has(e.id)));
    } finally {
      setSyncCount((c) => c - 1);
    }
  }, [
    isDark,
    createNode,
    updateNode,
    updateNodeSize,
    pushHistory,
    setNodes,
    setEdges,
  ]);

  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      const nodeToDelete = rfNodes.find((n) => n.id === nodeId);
      if (!nodeToDelete) return;

      const incomingEdge = rfEdges.find((e) => e.target === nodeId);
      const outgoingEdges = rfEdges.filter((e) => e.source === nodeId);

      const snapshot: DbNode = {
        id: nodeToDelete.id,
        shortId: nodeToDelete.data.shortId ?? null,
        title: nodeToDelete.data.title,
        icon: nodeToDelete.data.icon,
        description: nodeToDelete.data.description,
        imageUrl: nodeToDelete.data.imageUrl,
        parentId: incomingEdge?.source ?? null,
        positionX: nodeToDelete.position.x,
        positionY: nodeToDelete.position.y,
        width: (nodeToDelete.style?.width as number | undefined) ?? null,
        height: (nodeToDelete.style?.height as number | undefined) ?? null,
        cardType: nodeToDelete.data.cardType ?? null,
        linkUrl: nodeToDelete.data.linkUrl ?? null,
        parentSourceHandle: incomingEdge?.sourceHandle ?? null,
        parentTargetHandle: incomingEdge?.targetHandle ?? null,
        canvas: canvasSlug,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const childEdges = outgoingEdges.map((e) => ({
        childId: e.target,
        sourceHandle: e.sourceHandle ?? "right",
        targetHandle: e.targetHandle ?? "left",
      }));

      removeNodeFromState(nodeId);
      pushHistory({ type: "delete", snapshot, childEdges });

      setSyncCount((c) => c + 1);
      try {
        await deleteNode(nodeId);
      } catch {
        toast.error("Failed to delete node");
        addNodeToState(snapshot);
      } finally {
        setSyncCount((c) => c - 1);
      }
    },
    [
      canvasSlug,
      rfNodes,
      rfEdges,
      removeNodeFromState,
      addNodeToState,
      pushHistory,
      deleteNode,
    ],
  );

  const performUndo = useCallback(async () => {
    const entry = undoStack.current[undoStack.current.length - 1];
    if (!entry) return;
    undoStack.current = undoStack.current.slice(0, -1);
    redoStack.current = [...redoStack.current, entry];

    setSyncCount((c) => c + 1);
    try {
      if (entry.type === "create") {
        removeNodeFromState(entry.nodeId);
        await deleteNode(entry.nodeId);
      } else if (entry.type === "delete") {
        const dbNode = await createNode({
          id: entry.snapshot.id,
          parentId: entry.snapshot.parentId,
          positionX: entry.snapshot.positionX,
          positionY: entry.snapshot.positionY,
        });
        await updateNode({
          id: dbNode.id,
          title: entry.snapshot.title,
          icon: entry.snapshot.icon,
          description: entry.snapshot.description,
          imageUrl: entry.snapshot.imageUrl,
          cardType: entry.snapshot.cardType,
          linkUrl: entry.snapshot.linkUrl,
          parentSourceHandle: entry.snapshot.parentSourceHandle,
          parentTargetHandle: entry.snapshot.parentTargetHandle,
        });
        addNodeToState({ ...entry.snapshot });
        if (entry.childEdges.length > 0) {
          setEdges((prev) => [
            ...prev,
            ...entry.childEdges.map((ce) => ({
              id: `e-${entry.snapshot.id}-${ce.childId}`,
              source: entry.snapshot.id,
              sourceHandle: ce.sourceHandle,
              target: ce.childId,
              targetHandle: ce.targetHandle,
              type: "default" as const,
              style: getEdgeStyle(isDark),
            })),
          ]);
          await Promise.all(
            entry.childEdges.map((ce) =>
              updateNode({
                id: ce.childId,
                parentId: entry.snapshot.id,
                parentSourceHandle: ce.sourceHandle,
                parentTargetHandle: ce.targetHandle,
              }),
            ),
          );
        }
      } else if (entry.type === "update") {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === entry.nodeId
              ? { ...n, data: { ...n.data, ...entry.before } }
              : n,
          ),
        );
        await updateNode({
          id: entry.nodeId,
          ...(entry.before as Partial<AgentNodeData>),
        });
      } else if (entry.type === "move") {
        const positions = entry.moves.map((m) => ({
          id: m.id,
          x: m.before.x,
          y: m.before.y,
        }));
        setNodes((prev) =>
          prev.map((n) => {
            const move = entry.moves.find((m) => m.id === n.id);
            return move ? { ...n, position: move.before } : n;
          }),
        );
        await updateNodePositions(positions);
      } else if (entry.type === "connect") {
        setEdges((prev) => {
          const withoutNew = prev.filter(
            (e) =>
              !(e.source === entry.newParentId && e.target === entry.targetId),
          );
          if (entry.prevParentId === null) return withoutNew;
          return [
            ...withoutNew,
            {
              id: `e-${entry.prevParentId}-${entry.targetId}`,
              source: entry.prevParentId,
              sourceHandle: entry.prevSourceHandle ?? "right",
              target: entry.targetId,
              targetHandle: entry.prevTargetHandle ?? "left",
              type: "default",
              style: getEdgeStyle(isDark),
            },
          ];
        });
        await updateNode({
          id: entry.targetId,
          parentId: entry.prevParentId,
          parentSourceHandle: entry.prevSourceHandle,
          parentTargetHandle: entry.prevTargetHandle,
        });
      } else if (entry.type === "disconnect") {
        setEdges((prev) => [
          ...prev,
          {
            id: `e-${entry.prevParentId}-${entry.targetId}`,
            source: entry.prevParentId,
            sourceHandle: entry.prevSourceHandle,
            target: entry.targetId,
            targetHandle: entry.prevTargetHandle,
            type: "default",
            style: getEdgeStyle(isDark),
          },
        ]);
        await updateNode({
          id: entry.targetId,
          parentId: entry.prevParentId,
          parentSourceHandle: entry.prevSourceHandle,
          parentTargetHandle: entry.prevTargetHandle,
        });
      }
    } catch {
      toast.error("Undo failed");
    } finally {
      setSyncCount((c) => c - 1);
    }
  }, [
    isDark,
    createNode,
    deleteNode,
    updateNode,
    updateNodePositions,
    removeNodeFromState,
    addNodeToState,
    setNodes,
    setEdges,
  ]);

  const performRedo = useCallback(async () => {
    const entry = redoStack.current[redoStack.current.length - 1];
    if (!entry) return;
    redoStack.current = redoStack.current.slice(0, -1);
    undoStack.current = [...undoStack.current, entry];

    setSyncCount((c) => c + 1);
    try {
      if (entry.type === "create") {
        const dbNode = await createNode({
          id: entry.nodeId,
          parentId: entry.nodeData.parentId,
          positionX: entry.nodeData.positionX,
          positionY: entry.nodeData.positionY,
        });
        addNodeToState(dbNode);
      } else if (entry.type === "delete") {
        removeNodeFromState(entry.snapshot.id);
        await deleteNode(entry.snapshot.id);
      } else if (entry.type === "update") {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === entry.nodeId
              ? { ...n, data: { ...n.data, ...entry.after } }
              : n,
          ),
        );
        await updateNode({
          id: entry.nodeId,
          ...(entry.after as Partial<AgentNodeData>),
        });
      } else if (entry.type === "move") {
        const positions = entry.moves.map((m) => ({
          id: m.id,
          x: m.after.x,
          y: m.after.y,
        }));
        setNodes((prev) =>
          prev.map((n) => {
            const move = entry.moves.find((m) => m.id === n.id);
            return move ? { ...n, position: move.after } : n;
          }),
        );
        await updateNodePositions(positions);
      } else if (entry.type === "connect") {
        setEdges((prev) => {
          const withoutOld = entry.prevParentId
            ? prev.filter(
                (e) =>
                  !(
                    e.source === entry.prevParentId &&
                    e.target === entry.targetId
                  ),
              )
            : prev;
          return [
            ...withoutOld,
            {
              id: `e-${entry.newParentId}-${entry.targetId}`,
              source: entry.newParentId,
              sourceHandle: entry.newSourceHandle,
              target: entry.targetId,
              targetHandle: entry.newTargetHandle,
              type: "default",
              style: getEdgeStyle(isDark),
            },
          ];
        });
        await updateNode({
          id: entry.targetId,
          parentId: entry.newParentId,
          parentSourceHandle: entry.newSourceHandle,
          parentTargetHandle: entry.newTargetHandle,
        });
      } else if (entry.type === "disconnect") {
        setEdges((prev) =>
          prev.filter(
            (e) =>
              !(e.source === entry.prevParentId && e.target === entry.targetId),
          ),
        );
        await updateNode({
          id: entry.targetId,
          parentId: null,
          parentSourceHandle: null,
          parentTargetHandle: null,
        });
      }
    } catch {
      toast.error("Redo failed");
    } finally {
      setSyncCount((c) => c - 1);
    }
  }, [
    isDark,
    createNode,
    deleteNode,
    updateNode,
    updateNodePositions,
    removeNodeFromState,
    addNodeToState,
    setNodes,
    setEdges,
  ]);

  useEffect(() => {
    if (!canEdit) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isEditing =
        active instanceof HTMLElement &&
        (active.isContentEditable ||
          active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA");

      const isMac = navigator.platform.toLowerCase().includes("mac");
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        performUndo();
      } else if (modifier && ((e.key === "z" && e.shiftKey) || e.key === "y")) {
        e.preventDefault();
        performRedo();
      } else if (modifier && e.key === "c" && !isEditing) {
        const selectedNodes = rfNodes.filter((n) => n.selected);
        if (selectedNodes.length > 0) {
          e.preventDefault();
          const selectedIds = new Set(selectedNodes.map((n) => n.id));
          const internalEdges = rfEdges.filter(
            (ed) => selectedIds.has(ed.source) && selectedIds.has(ed.target),
          );
          clipboardRef.current = { nodes: selectedNodes, edges: internalEdges };
          try {
            localStorage.setItem(
              CANVAS_CLIPBOARD_KEY,
              JSON.stringify({
                nodes: selectedNodes.map(({ id, type, position, style, data }) => ({
                  id,
                  type,
                  position,
                  style,
                  data: {
                    title: data.title,
                    icon: data.icon,
                    description: data.description,
                    imageUrl: data.imageUrl,
                    cardType: data.cardType ?? null,
                    linkUrl: data.linkUrl ?? null,
                  },
                })),
                edges: internalEdges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
                  id,
                  source,
                  target,
                  sourceHandle,
                  targetHandle,
                })),
              }),
            );
          } catch {
            // localStorage unavailable or quota exceeded — cross-tab paste won't work
          }
          toast.success(
            selectedNodes.length === 1
              ? "Node copied"
              : `${selectedNodes.length} nodes copied`,
          );
        }
      } else if (modifier && e.key === "v" && !isEditing) {
        e.preventDefault();
        handlePaste();
      } else if (e.key === "Tab" && !isEditing) {
        e.preventDefault();
        handleTabCreate();
      } else if (e.key === "Enter" && !isEditing) {
        const selected = rfNodes.filter((n) => n.selected);
        if (selected.length === 1) {
          e.preventDefault();
          const nodeId = selected[0].id;
          setNodes((prev) =>
            prev.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, autoFocusTitle: true } }
                : n,
            ),
          );
        }
      } else if ((e.key === "Delete" || e.key === "Backspace") && !isEditing) {
        e.preventDefault();
        const selected = rfNodes.filter((n) => n.selected);
        for (const node of selected) {
          handleDeleteNode(node.id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    canEdit,
    performUndo,
    performRedo,
    handleTabCreate,
    handlePaste,
    rfNodes,
    rfEdges,
    setNodes,
    handleDeleteNode,
  ]);

  useEffect(() => {
    const wrapper = flowWrapper.current;
    if (!wrapper) return;
    const onDown = (e: MouseEvent) => {
      if (e.button === 1) wrapper.dataset.panning = "true";
    };
    const onUp = (e: MouseEvent) => {
      if (e.button === 1) delete wrapper.dataset.panning;
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const clipboardRef = useRef<{
    nodes: AgentNodeType[];
    edges: Edge[];
  } | null>(null);

  const dragStartPositions = useRef<Map<string, XYPosition>>(new Map());

  const handleNodeDragStart = useCallback(
    (e: React.MouseEvent, node: Node, nodes: Node[]) => {
      const movedNodes = nodes.length > 1 ? nodes : [node];
      dragStartPositions.current = new Map(
        movedNodes.map((n) => [n.id, { x: n.position.x, y: n.position.y }]),
      );

      if (!e.altKey) return;

      const source = node as AgentNodeType;
      const pos = { x: source.position.x, y: source.position.y };
      const sourceWidth = (source.style?.width as number | undefined) ?? null;
      const sourceHeight = (source.style?.height as number | undefined) ?? null;
      const data = source.data;

      const incomingEdge = rfEdges.find((edge) => edge.target === source.id);
      const parentId = incomingEdge?.source ?? null;
      const parentSourceHandle = incomingEdge?.sourceHandle ?? "right";
      const parentTargetHandle = incomingEdge?.targetHandle ?? "left";

      const newId = generateId();
      const optimisticNode: AgentNodeType = {
        id: newId,
        type: "agent",
        position: pos,
        style: {
          width: sourceWidth ?? DEFAULT_NODE_WIDTH,
          ...(sourceHeight != null && { height: sourceHeight }),
        },
        data: {
          title: data.title,
          icon: data.icon,
          description: data.description,
          imageUrl: data.imageUrl,
        },
        selected: false,
      };

      const cloneEdge: Edge | null = parentId
        ? {
            id: `e-${parentId}-${newId}`,
            source: parentId,
            sourceHandle: parentSourceHandle,
            target: newId,
            targetHandle: parentTargetHandle,
            type: "default",
            style: getEdgeStyle(isDark),
          }
        : null;

      setNodes((prev) => [...prev, optimisticNode]);
      if (cloneEdge) {
        setEdges((prev) => [...prev, cloneEdge]);
      }

      setSyncCount((c) => c + 1);
      createNode({ id: newId, parentId, positionX: pos.x, positionY: pos.y })
        .then(async (dbNode) => {
          const updates: Promise<unknown>[] = [];

          const nodeUpdates: Parameters<typeof updateNode>[0] = {
            id: dbNode.id,
            title: data.title,
            icon: data.icon,
            description: data.description,
            imageUrl: data.imageUrl,
          };
          if (parentId) {
            nodeUpdates.parentSourceHandle = parentSourceHandle;
            nodeUpdates.parentTargetHandle = parentTargetHandle;
          }
          updates.push(updateNode(nodeUpdates));

          if (sourceWidth || sourceHeight) {
            updates.push(
              updateNodeSize({
                id: dbNode.id,
                ...(sourceWidth != null && { width: sourceWidth }),
                ...(sourceHeight != null && { height: sourceHeight }),
              }),
            );
          }

          await Promise.all(updates);

          const fullNode: DbNode = {
            ...dbNode,
            title: data.title,
            icon: data.icon,
            description: data.description,
            imageUrl: data.imageUrl,
            positionX: pos.x,
            positionY: pos.y,
            width: sourceWidth,
            height: sourceHeight,
            parentSourceHandle,
            parentTargetHandle,
          };
          pushHistory({ type: "create", nodeId: newId, nodeData: fullNode });
        })
        .catch(() => {
          setNodes((prev) => prev.filter((n) => n.id !== newId));
          if (cloneEdge) {
            setEdges((prev) =>
              prev.filter((edge) => edge.id !== cloneEdge.id),
            );
          }
          toast.error("Failed to copy node");
        })
        .finally(() => setSyncCount((c) => c - 1));
    },
    [
      isDark,
      createNode,
      updateNode,
      updateNodeSize,
      pushHistory,
      rfEdges,
      setNodes,
      setEdges,
    ],
  );

  const handleNodeDrag = useCallback(
    (_: React.MouseEvent, node: Node) => {
      helperLinesRef.current?.update(
        getHelperLines(node, displayedNodesRef.current),
      );
    },
    [],
  );

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node, nodes: Node[]) => {
      helperLinesRef.current?.update({});
      const movedNodes = nodes.length > 1 ? nodes : [node];
      const moves = movedNodes.map((n) => ({
        id: n.id,
        before: dragStartPositions.current.get(n.id) ?? {
          x: n.position.x,
          y: n.position.y,
        },
        after: { x: n.position.x, y: n.position.y },
      }));
      dragStartPositions.current = new Map();
      pushHistory({ type: "move", moves });
      setSyncCount((c) => c + 1);
      updateNodePositions(
        movedNodes.map((n) => ({ id: n.id, x: n.position.x, y: n.position.y })),
      )
        .catch(() => toast.error("Failed to save positions"))
        .finally(() => setSyncCount((c) => c - 1));
    },
    [pushHistory, updateNodePositions],
  );

  const closeMenu = useCallback(() => {
    setContextMenu(null);
    setCardTypeSubmenuOpen(false);
  }, []);

  const handlePaneContextMenu = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      e.preventDefault();
      const rect = flowWrapper.current?.getBoundingClientRect();
      if (!rect) return;
      const flowPos = screenToFlowRef.current
        ? screenToFlowRef.current({ x: e.clientX, y: e.clientY })
        : { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setContextMenu({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        flowPos,
        targetNodeId: null,
        targetEdgeId: null,
      });
    },
    [],
  );

  const handleNodeContextMenu = useCallback(
    (e: React.MouseEvent, node: Node) => {
      e.preventDefault();
      const rect = flowWrapper.current?.getBoundingClientRect();
      if (!rect) return;
      setContextMenu({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        flowPos: { x: node.position.x, y: node.position.y + 260 },
        targetNodeId: node.id,
        targetEdgeId: null,
      });
    },
    [],
  );

  const handleEdgeContextMenu = useCallback(
    (e: React.MouseEvent, edge: Edge) => {
      e.preventDefault();
      const rect = flowWrapper.current?.getBoundingClientRect();
      if (!rect) return;
      setContextMenu({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        flowPos: { x: e.clientX - rect.left, y: e.clientY - rect.top },
        targetNodeId: null,
        targetEdgeId: edge.id,
      });
    },
    [],
  );

  const handlePaneClick = useCallback(() => closeMenu(), [closeMenu]);

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const prevEdge = rfEdges.find((e) => e.target === connection.target);
      const prevParentId = prevEdge?.source ?? null;
      const newSourceHandle = connection.sourceHandle ?? "right";
      const newTargetHandle = connection.targetHandle ?? "left";

      setEdges((eds) => {
        const withoutOld = prevEdge
          ? eds.filter((e) => e.id !== prevEdge.id)
          : eds;
        return [
          ...withoutOld,
          {
            id: `e-${connection.source}-${connection.target}`,
            source: connection.source,
            target: connection.target,
            sourceHandle: newSourceHandle,
            targetHandle: newTargetHandle,
            type: "default",
            style: getEdgeStyle(isDark),
          },
        ];
      });

      pushHistory({
        type: "connect",
        targetId: connection.target,
        prevParentId,
        prevSourceHandle: prevEdge?.sourceHandle ?? null,
        prevTargetHandle: prevEdge?.targetHandle ?? null,
        newParentId: connection.source,
        newSourceHandle,
        newTargetHandle,
      });

      setSyncCount((c) => c + 1);
      updateNode({
        id: connection.target,
        parentId: connection.source,
        parentSourceHandle: newSourceHandle,
        parentTargetHandle: newTargetHandle,
      })
        .catch(() => {
          setEdges((eds) => {
            const withoutNew = eds.filter(
              (e) =>
                !(
                  e.source === connection.source &&
                  e.target === connection.target
                ),
            );
            if (!prevEdge) return withoutNew;
            return [...withoutNew, prevEdge];
          });
          toast.error("Failed to save connection");
        })
        .finally(() => setSyncCount((c) => c - 1));
    },
    [isDark, rfEdges, pushHistory, updateNode, setEdges],
  );

  const handleDeleteEdge = useCallback(
    async (edgeId: string) => {
      const edge = rfEdges.find((e) => e.id === edgeId);
      if (!edge) return;
      setEdges((prev) => prev.filter((e) => e.id !== edgeId));
      pushHistory({
        type: "disconnect",
        targetId: edge.target,
        prevParentId: edge.source,
        prevSourceHandle: edge.sourceHandle ?? "right",
        prevTargetHandle: edge.targetHandle ?? "left",
      });
      setSyncCount((c) => c + 1);
      try {
        await updateNode({
          id: edge.target,
          parentId: null,
          parentSourceHandle: null,
          parentTargetHandle: null,
        });
      } catch {
        toast.error("Failed to delete connection");
        setEdges((prev) => [...prev, edge]);
      } finally {
        setSyncCount((c) => c - 1);
      }
    },
    [rfEdges, pushHistory, updateNode, setEdges],
  );

  const handleMenuCopyLink = () => {
    if (!contextMenu?.targetNodeId) return;
    const node = rfNodes.find((n) => n.id === contextMenu.targetNodeId);
    if (!node) return;
    closeMenu();
    const linkId = node.data.shortId ?? node.id;
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://moritz.works";
    const url = `${base}/${canvasSlug}?node=${linkId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const handleMenuAddNode = () => {
    if (!contextMenu) return;
    closeMenu();
    handleCreateNode(contextMenu.flowPos, null);
  };

  const handleMenuAddChild = () => {
    if (!contextMenu?.targetNodeId) return;
    closeMenu();
    handleCreateNode(contextMenu.flowPos, contextMenu.targetNodeId);
  };

  const handleMenuDelete = () => {
    if (!contextMenu?.targetNodeId) return;
    const id = contextMenu.targetNodeId;
    closeMenu();
    handleDeleteNode(id);
  };

  const handleMenuAddIcon = () => {
    if (!contextMenu?.targetNodeId) return;
    const id = contextMenu.targetNodeId;
    closeMenu();
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, openIconPicker: true } } : n,
      ),
    );
  };

  const handleMenuDeleteEdge = () => {
    if (!contextMenu?.targetEdgeId) return;
    const id = contextMenu.targetEdgeId;
    closeMenu();
    handleDeleteEdge(id);
  };

  const handleMenuAddDescription = () => {
    if (!contextMenu?.targetNodeId) return;
    const id = contextMenu.targetNodeId;
    closeMenu();
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, autoFocusDescription: true } }
          : n,
      ),
    );
  };

  const handleMenuSetCardType = (cardType: CardType) => {
    if (!contextMenu?.targetNodeId) return;
    const id = contextMenu.targetNodeId;
    const prevCardType =
      rfNodes.find((n) => n.id === id)?.data.cardType ?? null;
    closeMenu();
    pushHistory({
      type: "update",
      nodeId: id,
      before: { cardType: prevCardType },
      after: { cardType },
    });
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, cardType } } : n,
      ),
    );
    updateNode({ id, cardType }).catch(() =>
      toast.error("Failed to save card type"),
    );
  };

  const handleSelectionChangeRf = useCallback(
    ({ nodes }: { nodes: Node[] }) => {
      onSelectionChange?.(nodes.map((n) => n.id));
    },
    [onSelectionChange],
  );

  const historyContextValue = useMemo(
    () => ({ pushHistory, focusPendingRef, toggleCollapse }),
    [pushHistory, toggleCollapse],
  );

  return (
    <CanvasActionsContext.Provider value={actions}>
      <HistoryContext.Provider value={historyContextValue}>
        <div
          ref={flowWrapper}
          className={cn(
            "w-screen h-screen relative bg-neutral-50 dark:bg-[#090909] transition-opacity duration-200",
            nodesReady ? "opacity-100" : "opacity-0",
          )}
        >
          {mounted && (
            <>
              <ReactFlow
                colorMode={isDark ? "dark" : "light"}
                nodes={displayedNodes}
                edges={displayedEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                fitView
                fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
                minZoom={0.2}
                maxZoom={2}
                deleteKeyCode={null}
                edgesReconnectable={false}
                proOptions={{ hideAttribution: false }}
                snapToGrid={canEdit}
                snapGrid={[20, 20]}
                nodesDraggable={canEdit}
                nodesConnectable={canEdit}
                panOnDrag={canEdit ? [1] : [0, 1]}
                selectionOnDrag={canEdit}
                multiSelectionKeyCode={canEdit ? "Shift" : null}
                onNodeContextMenu={handleNodeContextMenu}
                onSelectionChange={handleSelectionChangeRf}
                {...(canEdit && {
                  onConnect,
                  onNodeDragStart: handleNodeDragStart,
                  onNodeDrag: handleNodeDrag,
                  onNodeDragStop: handleNodeDragStop,
                  onPaneContextMenu: handlePaneContextMenu,
                  onEdgeContextMenu: handleEdgeContextMenu,
                  onPaneClick: handlePaneClick,
                })}
              >
                <ZoomResetHandler />
                <FlowUtils screenToFlowRef={screenToFlowRef} />
                <FocusNodeOnMount nodeId={focusNodeId} />
                {canEdit && (
                  <HelperLines ref={helperLinesRef} isDark={isDark} />
                )}
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                  color={
                    isDark ? CANVAS_COLORS.DOT_DARK : CANVAS_COLORS.DOT_LIGHT
                  }
                  bgColor={
                    isDark ? CANVAS_COLORS.BG_DARK : CANVAS_COLORS.BG_LIGHT
                  }
                />
              </ReactFlow>

              {/* Title */}
              <div className="absolute top-0 left-0 right-0 z-50 select-none flex justify-center pointer-events-none">
                <div
                  className="w-full flex flex-col items-center relative"
                  style={{
                    background: isDark
                      ? "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)"
                      : "linear-gradient(to bottom, rgba(245,245,244,0.95) 0%, rgba(245,245,244,0.6) 50%, transparent 100%)",
                    paddingTop: "1.5rem",
                    paddingBottom: "5rem",
                  }}
                >
                  <div className="absolute top-4 left-4 pointer-events-auto">
                    <Link
                      href="/"
                      className={cn(
                        "flex items-center gap-1.5 text-sm font-medium transition-colors",
                        isDark
                          ? "text-white/70 hover:text-white"
                          : "text-neutral-500 hover:text-neutral-900",
                      )}
                    >
                      <ArrowLeft size={14} />
                      Back
                    </Link>
                  </div>
                  <div className="absolute top-4 right-4 pointer-events-auto">
                    {session ? (
                      <div className="flex items-center gap-2">
                        {session.user.image && (
                          <Image
                            src={session.user.image}
                            alt={session.user.name ?? ""}
                            width={22}
                            height={22}
                            className="rounded-full"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => signOut()}
                          className={cn(
                            "text-xs transition-colors",
                            isDark
                              ? "text-white/50 hover:text-white"
                              : "text-neutral-500 hover:text-neutral-700",
                          )}
                        >
                          Sign out
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          signIn.social({
                            provider: "github",
                            callbackURL: pathname,
                          })
                        }
                        className={cn(
                          "text-xs transition-colors",
                          isDark
                            ? "text-white/50 hover:text-white"
                            : "text-neutral-500 hover:text-neutral-700",
                        )}
                      >
                        Sign in
                      </button>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-lg font-medium",
                      isDark ? "text-white/80" : "text-neutral-800",
                    )}
                  >
                    {title}
                  </span>
                  <span
                    className={cn(
                      "text-xs mt-0.5",
                      isDark ? "text-white/40" : "text-neutral-400",
                    )}
                  >
                    by mrzmyr
                  </span>
                </div>
              </div>

              {/* Sync indicator */}
              {isSyncing && (
                <div className="absolute top-14 right-4 z-50 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-sm border border-neutral-200/60 dark:border-neutral-700/60 pointer-events-none select-none">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Syncing</span>
                </div>
              )}

              {/* Empty state */}
              {canEdit && rfNodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <MousePointerClick size={24} strokeWidth={1.5} />
                    <p className="text-sm">
                      Right-click to add your first node
                    </p>
                  </div>
                </div>
              )}

              {/* Context menu */}
              {contextMenu && (
                <div
                  ref={menuRef}
                  className="absolute z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 min-w-40 text-sm"
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {contextMenu.targetEdgeId ? (
                    <button
                      type="button"
                      onClick={handleMenuDeleteEdge}
                      className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      Delete connection
                    </button>
                  ) : contextMenu.targetNodeId ? (
                    <>
                      {canEdit && (
                        <>
                          {!rfNodes.find(
                            (n) => n.id === contextMenu.targetNodeId,
                          )?.data.icon && (
                            <>
                              <button
                                type="button"
                                onClick={handleMenuAddIcon}
                                className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                              >
                                Add icon
                              </button>
                              <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                            </>
                          )}
                          {!rfNodes.find(
                            (n) => n.id === contextMenu.targetNodeId,
                          )?.data.description && (
                            <>
                              <button
                                type="button"
                                onClick={handleMenuAddDescription}
                                className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                              >
                                Add description
                              </button>
                              <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                            </>
                          )}
                          <div
                            className="relative"
                            onMouseEnter={() => setCardTypeSubmenuOpen(true)}
                            onMouseLeave={() => setCardTypeSubmenuOpen(false)}
                          >
                            <button
                              type="button"
                              className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between"
                            >
                              <span>Card type</span>
                              <ChevronRight
                                size={12}
                                className="text-neutral-400"
                              />
                            </button>
                            {cardTypeSubmenuOpen && (
                              <div className="absolute left-full top-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 min-w-40 ml-1 z-50">
                                {(["standard", "title", "link"] as const).map(
                                  (type) => {
                                    const current = rfNodes.find(
                                      (n) => n.id === contextMenu?.targetNodeId,
                                    )?.data.cardType;
                                    const isActive = current === type || (type === "standard" && current !== "title" && current !== "link");
                                    return (
                                      <button
                                        key={type}
                                        type="button"
                                        onClick={() =>
                                          handleMenuSetCardType(type)
                                        }
                                        className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                                      >
                                        <Check
                                          size={12}
                                          className={cn(
                                            isActive
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                        {type === "standard"
                                          ? "Standard Card"
                                          : type === "title"
                                          ? "Title Card"
                                          : "Link Card"}
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                            )}
                          </div>
                          <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                        </>
                      )}
                      <button
                        type="button"
                        onClick={handleMenuCopyLink}
                        className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                      >
                        Copy link to node
                      </button>
                      {canEdit && (
                        <>
                          <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                          <button
                            type="button"
                            onClick={handleMenuAddChild}
                            className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            Add child node
                          </button>
                          <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                          <button
                            type="button"
                            onClick={handleMenuDelete}
                            className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            Delete node
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleMenuAddNode}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Add node here
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </HistoryContext.Provider>
    </CanvasActionsContext.Provider>
  );
}
