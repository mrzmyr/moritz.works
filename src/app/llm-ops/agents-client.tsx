"use client";

import type { DbNode } from "@/lib/db/schema";
import { Canvas } from "@/components/canvas/canvas";
import { Suspense } from "react";
import {
  createNode,
  deleteNode,
  updateNode,
  updateNodePositions,
  updateNodeSize,
} from "./actions";

interface AgentsClientProps {
  initialNodes: DbNode[];
  canEdit: boolean;
}

export function AgentsClient({ initialNodes, canEdit }: AgentsClientProps) {
  return (
    <Suspense>
      <Canvas
        initialNodes={initialNodes}
        title="LLM Operations"
        canvasSlug="llm-ops"
        canEdit={canEdit}
        actions={{
          createNode,
          deleteNode,
          updateNode,
          updateNodePositions,
          updateNodeSize,
        }}
      />
    </Suspense>
  );
}
