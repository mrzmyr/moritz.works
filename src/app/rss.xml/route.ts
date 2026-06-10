import { getPosts } from "@/lib/posts";
import { generateRssFeed, RSS_CONTENT_TYPE } from "@/lib/rss";

export const dynamic = "force-static";

export async function GET() {
  const { data: posts, error } = await getPosts();

  if (error || !posts) {
    return new Response("Failed to generate RSS feed", { status: 500 });
  }

  return new Response(generateRssFeed(posts), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600",
      "Content-Type": RSS_CONTENT_TYPE,
    },
  });
}
