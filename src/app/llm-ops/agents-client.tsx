"use client";

import type { PostData } from "@/lib/posts/types";
import type { DbNode } from "@/lib/db/schema";
import { Canvas } from "./canvas";

interface AgentsClientProps {
  initialNodes: DbNode[];
  initialPosts: PostData[];
}

export function AgentsClient({ initialNodes, initialPosts }: AgentsClientProps) {
  return <Canvas initialNodes={initialNodes} initialPosts={initialPosts} />;
}
