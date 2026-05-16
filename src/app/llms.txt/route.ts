import { NextResponse } from "next/server";
import { siteConfig } from "@/config/app";
import { getPosts } from "@/lib/posts";

export const dynamic = "force-static";

export async function GET() {
  const { data: posts, error } = await getPosts();

  if (error || !posts) {
    return new NextResponse("Failed to list posts", { status: 500 });
  }

  const lines: string[] = [];
  lines.push(`# ${siteConfig.name}`);
  lines.push("");
  lines.push(`> ${siteConfig.description}`);
  lines.push("");
  lines.push("## Blog");
  lines.push("");

  for (const post of posts) {
    const url = `${siteConfig.url}/blog/${post.slug}.md`;
    const suffix = post.excerpt ? `: ${post.excerpt}` : "";
    lines.push(`- [${post.title}](${url})${suffix}`);
  }

  lines.push("");

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
