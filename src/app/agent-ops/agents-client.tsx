"use client";

import type { DbNode } from "@/lib/db/schema";
import { Canvas } from "@/components/canvas/canvas";
import type { CanvasHandle } from "@/components/canvas/canvas";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  createNode,
  deleteNode,
  updateNode,
  updateNodePositions,
  updateNodeSize,
} from "./actions";

interface AgentsClientProps {
  initialNodes: DbNode[];
}

export function AgentsClient({ initialNodes }: AgentsClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const canvasRef = useRef<CanvasHandle>(null);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedNodeIds(ids);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac =
        typeof navigator !== "undefined" &&
        navigator.platform.toLowerCase().includes("mac");
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setIsChatOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Suspense>
        <Canvas
          ref={canvasRef}
          initialNodes={initialNodes}
          title="Agent Operations"
          canvasSlug="agent-ops"
          actions={{
            createNode,
            deleteNode,
            updateNode,
            updateNodePositions,
            updateNodeSize,
          }}
          onSelectionChange={handleSelectionChange}
        />
      </Suspense>

      {isChatOpen && (
        <ChatSidebar
          selectedNodeId={selectedNodeIds[0] ?? null}
          canvasRef={canvasRef}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
