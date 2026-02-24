import { describe, test, expect, mock } from "bun:test";
import { addCards } from "./add-cards";
import type { DbNode } from "@/lib/db/schema";

const makeDbNode = (id: string, overrides: Partial<DbNode> = {}): DbNode => ({
  id,
  title: "",
  icon: null,
  description: null,
  parentId: null,
  positionX: 0,
  positionY: 0,
  width: null,
  height: null,
  imageUrl: null,
  cardType: null,
  linkUrl: null,
  parentSourceHandle: null,
  parentTargetHandle: null,
  canvas: "agent-ops",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("addCards", () => {
  test("single card without parent: calls createNode once and returns 1 node", async () => {
    const created = makeDbNode("node-1");
    const updated = makeDbNode("node-1", { title: "Test" });
    const createNode = mock(async () => created);
    const updateNode = mock(async () => updated);

    const result = await addCards(
      [{ title: "Test" }],
      null,
      { createNode, updateNode },
      { x: 100, y: 200 },
    );

    expect(createNode).toHaveBeenCalledTimes(1);
    expect(updateNode).toHaveBeenCalledWith(
      expect.objectContaining({ id: "node-1", title: "Test" }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("node-1");
  });

  test("card with parentId: forwards parentId to createNode", async () => {
    const created = makeDbNode("node-2", { parentId: "parent-1" });
    const updated = makeDbNode("node-2", { parentId: "parent-1", title: "Child" });
    const createNode = mock(async () => created);
    const updateNode = mock(async () => updated);

    await addCards(
      [{ title: "Child" }],
      "parent-1",
      { createNode, updateNode },
      { x: 0, y: 0 },
    );

    expect(createNode).toHaveBeenCalledWith(
      expect.objectContaining({ parentId: "parent-1" }),
    );
  });

  test("multiple cards: creates all of them and returns all nodes", async () => {
    let callCount = 0;
    const createNode = mock(async () => makeDbNode(`node-${++callCount}`));
    const updateNode = mock(async (input: { id: string; title?: string }) =>
      makeDbNode(input.id, { title: input.title ?? "" }),
    );

    const result = await addCards(
      [{ title: "Alpha" }, { title: "Beta" }],
      null,
      { createNode, updateNode },
      { x: 0, y: 0 },
    );

    expect(createNode).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
  });
});
