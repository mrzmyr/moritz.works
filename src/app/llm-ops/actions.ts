"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import type { DbNode } from "@/lib/db/schema";
import { nodes } from "@/lib/db/schema";

export async function getNodes(): Promise<DbNode[]> {
  return await db.select().from(nodes).orderBy(nodes.createdAt);
}

export async function createNode(input: {
  id?: string;
  parentId?: string | null;
  positionX: number;
  positionY: number;
}): Promise<DbNode> {
  const [node] = await db
    .insert(nodes)
    .values({
      ...(input.id ? { id: input.id } : {}),
      parentId: input.parentId ?? null,
      positionX: input.positionX,
      positionY: input.positionY,
    })
    .returning();
  return node;
}

export async function updateNode(input: {
  id: string;
  title?: string;
  icon?: string | null;
  description?: string | null;
  positionX?: number;
  positionY?: number;
  imageUrl?: string | null;
  cardType?: string | null;
  parentId?: string | null;
  parentSourceHandle?: string | null;
  parentTargetHandle?: string | null;
}): Promise<DbNode> {
  const { id, ...rest } = input;
  const [node] = await db
    .update(nodes)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(nodes.id, id))
    .returning();
  return node;
}

export async function deleteNode(id: string): Promise<void> {
  await db.delete(nodes).where(eq(nodes.id, id));
}

export async function updateNodeSize(input: {
  id: string;
  width?: number;
  height?: number;
}): Promise<void> {
  await db
    .update(nodes)
    .set({
      ...(input.width !== undefined && { width: input.width }),
      ...(input.height !== undefined && { height: input.height }),
      updatedAt: new Date(),
    })
    .where(eq(nodes.id, input.id));
}

export async function updateNodePositions(
  positions: { id: string; x: number; y: number }[],
): Promise<void> {
  await Promise.all(
    positions.map(({ id, x, y }) =>
      db
        .update(nodes)
        .set({ positionX: x, positionY: y, updatedAt: new Date() })
        .where(eq(nodes.id, id)),
    ),
  );
}
