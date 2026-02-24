"use client";

import type { DbNode } from "@/lib/db/schema";
import { Canvas } from "./canvas";

interface AgentsClientProps {
  initialNodes: DbNode[];
}

export function AgentsClient({ initialNodes }: AgentsClientProps) {
  return <Canvas initialNodes={initialNodes} />;
}
