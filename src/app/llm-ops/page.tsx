import { getPosts } from "@/lib/posts";
import { getNodes } from "./actions";
import { AgentsClient } from "./agents-client";

export default async function AgentsPage() {
  const [initialNodes, { data: posts }] = await Promise.all([
    getNodes(),
    getPosts(),
  ]);

  return <AgentsClient initialNodes={initialNodes} initialPosts={posts ?? []} />;
}
