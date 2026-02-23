import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const nodes = pgTable("agent_nodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull().default(""),
  icon: text("icon"),
  description: text("description"),
  parentId: uuid("parent_id").references((): AnyPgColumn => nodes.id, {
    onDelete: "set null",
  }),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  width: real("width"),
  height: real("height"),
  imageUrl: text("image_url"),
  cardType: text("card_type"),
  parentSourceHandle: text("parent_source_handle"),
  parentTargetHandle: text("parent_target_handle"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DbNode = typeof nodes.$inferSelect;
export type NewDbNode = typeof nodes.$inferInsert;
