import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { CANVAS_OWNER_USERNAME } from "@/lib/canvas-owner";
import { getNodes } from "./actions";
import { AgentsClient } from "./agents-client";

export default async function AgentOpsPage() {
  const initialNodes = await getNodes();
  const session = await auth.api.getSession({ headers: await headers() });
  const canEdit = session?.user.username === CANVAS_OWNER_USERNAME;
  return <AgentsClient initialNodes={initialNodes} canEdit={canEdit} />;
}
