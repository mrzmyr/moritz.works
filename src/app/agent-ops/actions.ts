"use server";

import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import type { DbNode } from "@/lib/db/schema";
import { nodes } from "@/lib/db/schema";
import { generateId } from "@/lib/generate-id";
import { auth } from "@/lib/auth";
import { CANVAS_OWNER_USERNAME } from "@/lib/canvas-owner";

const CANVAS = "agent-ops";

async function requireOwner() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.username !== CANVAS_OWNER_USERNAME) {
    throw new Error("Unauthorized");
  }
}

export async function getNodes(): Promise<DbNode[]> {
  return await db
    .select()
    .from(nodes)
    .where(eq(nodes.canvas, CANVAS))
    .orderBy(nodes.createdAt);
}

export async function getNodeById(id: string): Promise<DbNode | null> {
  const [node] = await db
    .select()
    .from(nodes)
    .where(and(eq(nodes.id, id), eq(nodes.canvas, CANVAS)));
  return node ?? null;
}

export async function createNode(input: {
  id?: string;
  parentId?: string | null;
  positionX: number;
  positionY: number;
}): Promise<DbNode> {
  await requireOwner();
  const [node] = await db
    .insert(nodes)
    .values({
      id: input.id ?? generateId(),
      shortId: generateId(),
      canvas: CANVAS,
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
  linkUrl?: string | null;
  parentId?: string | null;
  parentSourceHandle?: string | null;
  parentTargetHandle?: string | null;
}): Promise<DbNode> {
  await requireOwner();
  const { id, ...rest } = input;
  const [node] = await db
    .update(nodes)
    .set({ ...rest, updatedAt: new Date() })
    .where(and(eq(nodes.id, id), eq(nodes.canvas, CANVAS)))
    .returning();
  return node;
}

export async function deleteNode(id: string): Promise<void> {
  await requireOwner();
  await db
    .delete(nodes)
    .where(and(eq(nodes.id, id), eq(nodes.canvas, CANVAS)));
}

export async function updateNodeSize(input: {
  id: string;
  width?: number;
  height?: number;
}): Promise<void> {
  await requireOwner();
  await db
    .update(nodes)
    .set({
      ...(input.width !== undefined && { width: input.width }),
      ...(input.height !== undefined && { height: input.height }),
      updatedAt: new Date(),
    })
    .where(and(eq(nodes.id, input.id), eq(nodes.canvas, CANVAS)));
}

export async function updateNodePositions(
  positions: { id: string; x: number; y: number }[],
): Promise<void> {
  await requireOwner();
  await Promise.all(
    positions.map(({ id, x, y }) =>
      db
        .update(nodes)
        .set({ positionX: x, positionY: y, updatedAt: new Date() })
        .where(and(eq(nodes.id, id), eq(nodes.canvas, CANVAS))),
    ),
  );
}
