"use client";

import type { DbNode } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import {
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionMode,
  type Edge,
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
  Crop,
  Download,
  Link2,
  Loader2,
  MousePointerClick,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { toast } from "sonner";
import { SiLinkedin } from "react-icons/si";
import { AgentNode } from "./agent-node";
import {
  CanvasActionsContext,
  type CanvasActions,
} from "./canvas-actions-context";
import { CANVAS_COLORS } from "./canvas-config";
import { HistoryContext, type HistoryEntry } from "./history-context";
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

interface CanvasProps {
  initialNodes: DbNode[];
  title: string;
  canvasSlug: string;
  actions: CanvasActions;
}

export function Canvas({
  initialNodes,
  title,
  canvasSlug,
  actions,
}: CanvasProps) {
  const {
    createNode,
    deleteNode,
    updateNode,
    updateNodePositions,
    updateNodeSize,
  } = actions;

  const isDev = process.env.NODE_ENV === "development";
  const searchParams = useSearchParams();
  const focusNodeId = searchParams.get("node");
  const isDark = useIsDark();

  const [rfNodes, setNodes, onNodesChange] = useNodesState<AgentNodeType>(
    (initialNodes ?? []).map(dbNodeToRfNode),
  );
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(
    deriveEdges(initialNodes ?? [], isDark),
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

  type SelectionRect = {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(
    null,
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const selectionRectRef = useRef<SelectionRect | null>(null);
  const selectStartRef = useRef<{ x: number; y: number } | null>(null);

  const normalizedSelection = useMemo(() => {
    if (!selectionRect) return null;
    return {
      x: Math.min(selectionRect.startX, selectionRect.endX),
      y: Math.min(selectionRect.startY, selectionRect.endY),
      width: Math.abs(selectionRect.endX - selectionRect.startX),
      height: Math.abs(selectionRect.endY - selectionRect.startY),
    };
  }, [selectionRect]);

  const captureArea = useCallback(
    async (x: number, y: number, width: number, height: number) => {
      if (!flowWrapper.current || width < 10 || height < 10) return;
      setIsCapturing(true);
      try {
        const { toPng } = await import("html-to-image");
        const pixelRatio = 2;
        const fullDataUrl = await toPng(flowWrapper.current, {
          pixelRatio,
          filter: (node) => {
            if (!(node instanceof HTMLElement)) return true;
            return node.dataset.skipCapture !== "true";
          },
        });

        const img = new Image();
        img.src = fullDataUrl;
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
        });

        const offscreen = document.createElement("canvas");
        offscreen.width = width * pixelRatio;
        offscreen.height = height * pixelRatio;
        const ctx = offscreen.getContext("2d")!;
        ctx.drawImage(
          img,
          x * pixelRatio,
          y * pixelRatio,
          width * pixelRatio,
          height * pixelRatio,
          0,
          0,
          width * pixelRatio,
          height * pixelRatio,
        );

        setCapturedImage(offscreen.toDataURL("image/png"));
        setShowShareModal(true);
      } catch {
        toast.error("Failed to capture area");
      } finally {
        setIsCapturing(false);
      }
    },
    [],
  );

  const handleFlowMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelectMode || e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("a, button")) return;
      e.preventDefault();
      const rect = flowWrapper.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      selectStartRef.current = { x, y };
      const sr: SelectionRect = { startX: x, startY: y, endX: x, endY: y };
      selectionRectRef.current = sr;
      setSelectionRect(sr);
    },
    [isSelectMode],
  );

  useEffect(() => {
    if (!isSelectMode) return;

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!selectStartRef.current || !flowWrapper.current) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!selectStartRef.current || !flowWrapper.current) return;
        const rect = flowWrapper.current.getBoundingClientRect();
        const sr: SelectionRect = {
          startX: selectStartRef.current.x,
          startY: selectStartRef.current.y,
          endX: clientX - rect.left,
          endY: clientY - rect.top,
        };
        selectionRectRef.current = sr;
        setSelectionRect(sr);
      });
    };

    const handleMouseUp = async () => {
      if (!selectStartRef.current) return;
      const finalRect = selectionRectRef.current;
      selectStartRef.current = null;
      selectionRectRef.current = null;
      setSelectionRect(null);
      if (finalRect) {
        const x = Math.min(finalRect.startX, finalRect.endX);
        const y = Math.min(finalRect.startY, finalRect.endY);
        const w = Math.abs(finalRect.endX - finalRect.startX);
        const h = Math.abs(finalRect.endY - finalRect.startY);
        await captureArea(x, y, w, h);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        selectStartRef.current = null;
        selectionRectRef.current = null;
        setSelectionRect(null);
        setIsSelectMode(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSelectMode, captureArea]);

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

  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      const nodeToDelete = rfNodes.find((n) => n.id === nodeId);
      if (!nodeToDelete) return;

      const incomingEdge = rfEdges.find((e) => e.target === nodeId);
      const outgoingEdges = rfEdges.filter((e) => e.source === nodeId);

      const snapshot: DbNode = {
        id: nodeToDelete.id,
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
    if (!isDev) return;
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
    performUndo,
    performRedo,
    handleTabCreate,
    rfNodes,
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

      const incomingEdges = rfEdges.filter((edge) => edge.target === source.id);
      const outgoingEdges = rfEdges.filter((edge) => edge.source === source.id);
      const parentId = incomingEdges[0]?.source ?? null;

      const newId = crypto.randomUUID();
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

      const copiedEdges: Edge[] = [
        ...incomingEdges.map((edge) => ({
          ...edge,
          id: `e-${edge.source}-${newId}`,
          target: newId,
          style: getEdgeStyle(isDark),
        })),
        ...outgoingEdges.map((edge) => ({
          ...edge,
          id: `e-${newId}-${edge.target}`,
          source: newId,
          style: getEdgeStyle(isDark),
        })),
      ];

      setNodes((prev) => [...prev, optimisticNode]);
      if (copiedEdges.length > 0) {
        setEdges((prev) => [...prev, ...copiedEdges]);
      }

      setSyncCount((c) => c + 1);
      createNode({ id: newId, parentId, positionX: pos.x, positionY: pos.y })
        .then(async (dbNode) => {
          const updates: Promise<unknown>[] = [];

          if (data.title || data.icon || data.description || data.imageUrl) {
            updates.push(
              updateNode({
                id: dbNode.id,
                title: data.title,
                icon: data.icon,
                description: data.description,
                imageUrl: data.imageUrl,
              }),
            );
          }

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
          };
          pushHistory({ type: "create", nodeId: newId, nodeData: fullNode });
        })
        .catch(() => {
          const copiedEdgeIds = new Set(copiedEdges.map((ce) => ce.id));
          setNodes((prev) => prev.filter((n) => n.id !== newId));
          setEdges((prev) =>
            prev.filter((edge) => !copiedEdgeIds.has(edge.id)),
          );
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

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node, nodes: Node[]) => {
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
      setContextMenu({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        flowPos: { x: e.clientX - rect.left - 144, y: e.clientY - rect.top },
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
        return addEdge(
          {
            ...connection,
            sourceHandle: newSourceHandle,
            targetHandle: newTargetHandle,
            style: getEdgeStyle(isDark),
          },
          withoutOld,
        );
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
    const id = contextMenu.targetNodeId;
    closeMenu();
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://moritz.works";
    const url = `${base}/${canvasSlug}?node=${id}`;
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
    closeMenu();
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, cardType } } : n,
      ),
    );
    updateNode({ id, cardType }).catch(() =>
      toast.error("Failed to save card type"),
    );
  };

  const shareUrl = `https://moritz.works/${canvasSlug}`;

  const historyContextValue = useMemo(
    () => ({ pushHistory, focusPendingRef, toggleCollapse }),
    [pushHistory, toggleCollapse],
  );

  return (
    <CanvasActionsContext.Provider value={actions}>
      <HistoryContext.Provider value={historyContextValue}>
        <div
          ref={flowWrapper}
          onMouseDown={handleFlowMouseDown}
          className={cn(
            "w-screen h-screen relative bg-neutral-50 dark:bg-neutral-black transition-opacity duration-200",
            nodesReady ? "opacity-100" : "opacity-0",
            !isDev && !isSelectMode && "[&_*]:!cursor-default",
            isSelectMode && "!cursor-crosshair [&_*]:!cursor-crosshair",
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
                proOptions={{ hideAttribution: false }}
                snapToGrid={isDev}
                snapGrid={[20, 20]}
                nodesDraggable={isDev}
                nodesConnectable={isDev}
                panOnDrag={[1]}
                selectionOnDrag={isDev}
                multiSelectionKeyCode={isDev ? "Shift" : null}
                onNodeContextMenu={handleNodeContextMenu}
                {...(isDev && {
                  onConnect,
                  onNodeDragStart: handleNodeDragStart,
                  onNodeDragStop: handleNodeDragStop,
                  onPaneContextMenu: handlePaneContextMenu,
                  onEdgeContextMenu: handleEdgeContextMenu,
                  onPaneClick: handlePaneClick,
                })}
              >
                <ZoomResetHandler />
                <FlowUtils screenToFlowRef={screenToFlowRef} />
                <FocusNodeOnMount nodeId={focusNodeId} />
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
              <div className="absolute top-0 left-0 right-0 z-50 select-none flex justify-center">
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
                <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-sm border border-neutral-200/60 dark:border-neutral-700/60 pointer-events-none select-none">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Syncing</span>
                </div>
              )}

              {/* Empty state */}
              {isDev && rfNodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <MousePointerClick size={24} strokeWidth={1.5} />
                    <p className="text-sm">
                      Right-click to add your first node
                    </p>
                  </div>
                </div>
              )}

              {/* Share / capture button (read-only mode) */}
              {!isDev && (
                <div
                  data-skip-capture="true"
                  className="absolute top-4 right-4 z-50"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectMode((v) => !v);
                      setSelectionRect(null);
                      selectStartRef.current = null;
                      selectionRectRef.current = null;
                    }}
                    className={cn(
                      "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all duration-150 select-none",
                      isSelectMode
                        ? "bg-white text-neutral-900 shadow-md"
                        : isDark
                          ? "text-white/70 hover:text-white bg-black/25 hover:bg-black/40 backdrop-blur-sm"
                          : "text-neutral-600 hover:text-neutral-900 bg-white/70 hover:bg-white/90 backdrop-blur-sm shadow-sm border border-neutral-200/60",
                    )}
                  >
                    <Crop size={13} />
                    <span>
                      {isSelectMode ? "Drag to select area" : "Share"}
                    </span>
                    {isSelectMode && (
                      <span className="text-neutral-400 text-xs ml-0.5">
                        · Esc to cancel
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Selection rectangle overlay */}
              {isSelectMode &&
                normalizedSelection &&
                normalizedSelection.width > 4 && (
                  <div
                    data-skip-capture="true"
                    className="absolute pointer-events-none z-[60]"
                    style={{
                      left: normalizedSelection.x,
                      top: normalizedSelection.y,
                      width: normalizedSelection.width,
                      height: normalizedSelection.height,
                      outline: "2px solid rgba(255,255,255,0.9)",
                      boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
                    }}
                  />
                )}

              {/* Capturing overlay */}
              {isCapturing && (
                <div
                  data-skip-capture="true"
                  className="absolute inset-0 z-[70] flex items-center justify-center bg-black/30 backdrop-blur-sm"
                >
                  <Loader2 size={28} className="animate-spin text-white" />
                </div>
              )}

              {/* Share modal */}
              {showShareModal && capturedImage && (
                <div
                  data-skip-capture="true"
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setShowShareModal(false);
                      setCapturedImage(null);
                    }
                  }}
                >
                  <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Share snapshot
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowShareModal(false);
                          setCapturedImage(null);
                        }}
                        className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="p-4">
                      <img
                        src={capturedImage}
                        alt="Selected area snapshot"
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800"
                      />
                    </div>

                    <div className="flex items-center gap-2 px-4 pb-4 flex-wrap">
                      <a
                        href={capturedImage}
                        download={`${canvasSlug}-snapshot.png`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Download size={13} />
                        Download
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} by @mrzmyr\n\n${shareUrl}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white text-sm hover:bg-neutral-800 transition-colors"
                      >
                        <span
                          className="font-bold leading-none"
                          style={{ fontFamily: "serif" }}
                        >
                          𝕏
                        </span>
                        Share on X
                      </a>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2] text-white text-sm hover:bg-[#0958a8] transition-colors"
                      >
                        <SiLinkedin className="w-3.5 h-3.5" />
                        Share on LinkedIn
                      </a>
                    </div>
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
                      {isDev && (
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
                                {(["standard", "title"] as const).map(
                                  (type) => {
                                    const current = rfNodes.find(
                                      (n) => n.id === contextMenu?.targetNodeId,
                                    )?.data.cardType;
                                    const isActive =
                                      type === "title"
                                        ? current === "title"
                                        : current !== "title";
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
                                          : "Title Card"}
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
                      {isDev && (
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
