import type { Node } from "@xyflow/react";

export type CardType = "standard" | "title";

export type AgentNodeData = {
  title: string;
  icon: string | null;
  description: string | null;
  imageUrl: string | null;
  cardType?: CardType | null;
  /** Transient UI flag — not persisted. When true, the icon picker opens immediately. */
  openIconPicker?: boolean;
  /** Transient UI flag — not persisted. When true, the title enters edit mode and is focused. */
  autoFocusTitle?: boolean;
  /** Transient UI flag — not persisted. When true, the description enters edit mode and is focused. */
  autoFocusDescription?: boolean;
  /** Transient — derived from edge structure; true when this node has direct children. */
  hasChildren?: boolean;
  /** Transient — true when this node's children are hidden. */
  collapsed?: boolean;
  /** Transient — true when this node was navigated to via a shared link (?node=<id>). */
  isLinked?: boolean;
};

export type AgentNodeType = Node<AgentNodeData, "agent">;
