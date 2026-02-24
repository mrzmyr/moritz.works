import { db } from "@/lib/db";
import { nodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CanvasPreviewClient } from "@/components/canvas/canvas-preview-client";

export async function AgentOpsPreview() {
  const initialNodes = await db
    .select()
    .from(nodes)
    .where(eq(nodes.canvas, "agent-ops"))
    .orderBy(nodes.createdAt);

  return (
    <div className="w-full h-[220px] overflow-hidden rounded-lg">
      <CanvasPreviewClient initialNodes={initialNodes} />
    </div>
  );
}
