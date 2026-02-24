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
}

export function AgentsClient({ initialNodes }: AgentsClientProps) {
  return (
    <Suspense>
      <Canvas
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
      />
    </Suspense>
  );
}
