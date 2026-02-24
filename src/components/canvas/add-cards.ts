import type { XYPosition } from "@xyflow/react";
import type { CanvasActions } from "./canvas-actions-context";
import type { DbNode } from "@/lib/db/schema";

export interface CardSpec {
  title: string;
  description?: string;
  icon?: string;
  cardType?: "standard" | "title" | "link";
  linkUrl?: string;
}

const CARD_WIDTH = 288;
const CARD_GAP = 20;

/**
 * Creates one or more canvas cards via the provided server actions.
 * Pure-ish: no React state — caller handles setNodes/setEdges.
 * Returns the updated DbNodes (with title/description/etc applied).
 */
export async function addCards(
  cards: CardSpec[],
  parentId: string | null,
  actions: Pick<CanvasActions, "createNode" | "updateNode">,
  basePosition: XYPosition,
): Promise<DbNode[]> {
  const results = await Promise.all(
    cards.map(async (card, index) => {
      const position: XYPosition = {
        x: basePosition.x + index * (CARD_WIDTH + CARD_GAP),
        y: basePosition.y,
      };

      const dbNode = await actions.createNode({
        parentId,
        positionX: position.x,
        positionY: position.y,
      });

      const updated = await actions.updateNode({
        id: dbNode.id,
        title: card.title,
        description: card.description ?? null,
        icon: card.icon ?? null,
        cardType: card.cardType ?? "standard",
        linkUrl: card.linkUrl ?? null,
      });

      return updated;
    }),
  );

  return results;
}
