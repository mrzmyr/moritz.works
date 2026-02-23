CREATE TABLE "agent_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"icon" text,
	"description" text,
	"parent_id" uuid,
	"position_x" real DEFAULT 0 NOT NULL,
	"position_y" real DEFAULT 0 NOT NULL,
	"width" real,
	"height" real,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_nodes" ADD CONSTRAINT "agent_nodes_parent_id_agent_nodes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."agent_nodes"("id") ON DELETE set null ON UPDATE no action;