ALTER TABLE "agent_nodes" ADD COLUMN "short_id" text;--> statement-breakpoint

UPDATE "agent_nodes" SET "short_id" = substr(md5(random()::text), 1, 10) WHERE "short_id" IS NULL;--> statement-breakpoint

ALTER TABLE "agent_nodes" ADD CONSTRAINT "agent_nodes_short_id_unique" UNIQUE("short_id");