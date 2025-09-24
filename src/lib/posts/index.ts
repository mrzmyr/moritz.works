import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getPostUrl } from "@/lib/urls";
import type { Response } from "../responses";
import { POSTS_DIRECTORY } from "./config";
import type { Post } from "./types";

export const getPostMetadata = async (slug: string): Promise<Response<Post>> => {
  const fullPath = path.join(POSTS_DIRECTORY, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return { success: false, data: null, error: `Post not found: ${slug}` };
  }

  const fileContents = await fs.promises.readFile(fullPath, "utf8");
  const { data: metadata } = matter(fileContents);
  const url = getPostUrl({ slug: metadata.slug });

  return { success: true, data: { ...metadata, url } as Post, error: null };
};

export async function getPosts(): Promise<Response<Post[]>> {
  // Get file names under /posts
  const fileNames = (await fs.promises.readdir(POSTS_DIRECTORY))
    .filter((fileName) => fileName.endsWith(".mdx"));
  const posts: Post[] = [];

  for (const fileName of fileNames) {
    const slug = fileName.replace(".mdx", "");
    const fullPath = path.join(POSTS_DIRECTORY, fileName);
    const fileContents = await fs.promises.readFile(fullPath, "utf8");

    const { data: metadata } = matter(fileContents);

    posts.push({
      id: slug,
      url: getPostUrl({ slug }),
      ...metadata,
    } as Post);
  }

  return {
    success: true, data: posts.sort((a, b) => {
      if (new Date(a.createdAt) < new Date(b.createdAt)) {
        return 1;
      }
      return -1;
    }), error: null
  };
}
