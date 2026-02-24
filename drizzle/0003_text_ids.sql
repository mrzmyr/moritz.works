ALTER TABLE "agent_nodes" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "agent_nodes" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "agent_nodes" ALTER COLUMN "parent_id" SET DATA TYPE text;