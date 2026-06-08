import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { NextResponse } from "next/server";
import { POSTS_DIRECTORY } from "@/lib/posts/config";
import { canShowPost } from "@/lib/posts";
import type { PostData } from "@/lib/posts/types";

export const dynamic = "force-static";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (slug.includes("/") || slug.includes("..")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const fullPath = path.join(POSTS_DIRECTORY, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const content = await fs.promises.readFile(fullPath, "utf8");
  const { data: metadata } = matter(content);

  if (
    !canShowPost({
      id: slug,
      slug,
      ...metadata,
    } as PostData)
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

export async function generateStaticParams() {
  const fileNames = (await fs.promises.readdir(POSTS_DIRECTORY)).filter(
    (fileName) => fileName.endsWith(".mdx"),
  );
  const params: Array<{ slug: string }> = [];

  for (const fileName of fileNames) {
    const slug = fileName.replace(/\.mdx$/, "");
    const fullPath = path.join(POSTS_DIRECTORY, fileName);
    const content = await fs.promises.readFile(fullPath, "utf8");
    const { data: metadata } = matter(content);

    if (
      !canShowPost({
        id: slug,
        slug,
        ...metadata,
      } as PostData)
    ) {
      continue;
    }

    params.push({ slug });
  }

  return params;
}
