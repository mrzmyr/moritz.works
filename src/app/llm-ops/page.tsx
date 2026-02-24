import { getNodes } from "./actions";
import { AgentsClient } from "./agents-client";

export default async function AgentsPage() {
  const initialNodes = await getNodes();
  return <AgentsClient initialNodes={initialNodes} />;
}
