import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getPostUrl } from "@/lib/urls";
import type { Response } from "../responses";
import { tryCatch } from "../utils";
import { POSTS_DIRECTORY } from "./config";
import type { PostContent, PostData, PostModule } from "./types";

export const getPostMetadata = async (
  slug: string,
): Promise<Response<PostData>> => {
  const fullPath = path.join(POSTS_DIRECTORY, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return { success: false, error: `Post not found: ${slug}` };
  }

  const fileContents = await fs.promises.readFile(fullPath, "utf8");
  const { data: metadata } = matter(fileContents);
  const url = getPostUrl({ slug: metadata.slug });

  return { success: true, data: { ...metadata, url } as PostData };
};

export async function getPosts(): Promise<Response<PostData[]>> {
  const fileNames = (await fs.promises.readdir(POSTS_DIRECTORY)).filter(
    (fileName) => fileName.endsWith(".mdx"),
  );
  const posts: PostData[] = [];

  for (const fileName of fileNames) {
    const slug = fileName.replace(".mdx", "");
    const fullPath = path.join(POSTS_DIRECTORY, fileName);
    const fileContents = await fs.promises.readFile(fullPath, "utf8");

    const { data: metadata } = matter(fileContents);

    posts.push({
      id: slug,
      slug,
      url: getPostUrl({ slug }),
      ...metadata,
    } as PostData);
  }

  return {
    success: true,
    data: posts.sort((a, b) => {
      if (new Date(a.createdAt) < new Date(b.createdAt)) {
        return 1;
      }
      return -1;
    }),
  };
}

export const getPostContentFromTsx = async (
  slug: string,
): Promise<Response<PostContent>> => {
  const {
    success: tsxSuccess,
    data: tsxData,
    error: tsxError,
  } = await tryCatch(import(`@/app/blog/[slug]/(${slug})/page.tsx`));

  if (!tsxSuccess || !tsxData || tsxError) {
    console.warn("Failed to import TSX content", tsxError);

    return {
      success: false,
      error: "Failed to import TSX content",
    };
  }
  const tsx: PostModule = tsxData;
  const tsxContent = tsx.default;

  const data: PostContent = {
    content: tsxContent,
  };

  return {
    success: true,
    data,
  };
};

export const getPostPreviewFromTsx = async (
  slug: string,
): Promise<Response<React.ReactNode>> => {
  const response = await tryCatch<{ default: React.ReactNode }>(
    import(`@/app/blog/[slug]/(${slug})/preview.tsx`),
  );

  if (!response.success || !response.data) {
    return { success: false, error: `Failed to get post preview` };
  }

  const content = response.data.default;

  return { success: true, data: content };
};

export const getPostContentFromMdx = async (
  slug: string,
): Promise<Response<PostContent>> => {
  const {
    success: mdxSuccess,
    data: mdxData,
    error: mdxError,
  } = await tryCatch(import(`@/content/${slug}.mdx`));

  if (!mdxSuccess || !mdxData || mdxError) {
    console.warn("Failed to import MDX content", mdxError);
    return {
      success: false,
      error: "Failed to import MDX content",
    };
  }

  const mdx: PostModule = mdxData;
  const mdxContent = mdx.default;

  return {
    success: true,
    data: { content: mdxContent },
  };
};

export const getPostContent = async (
  slug: string,
): Promise<Response<PostContent>> => {
  const { data: metadata, error } = await getPostMetadata(slug);

  if (error || !metadata) {
    console.warn("Failed to get post metadata", error);

    return { success: false, error: `Failed to get post metadata` };
  }

  const tsxResponse = await getPostContentFromTsx(slug);

  if (tsxResponse.success) {
    return {
      success: true,
      data: { ...metadata, ...tsxResponse.data },
    };
  }

  const mdxResponse = await getPostContentFromMdx(slug);

  if (mdxResponse.success) {
    return {
      success: true,
      data: { ...metadata, ...mdxResponse.data },
    };
  }

  console.warn("Failed to get post content", mdxResponse.error);

  return {
    success: false,
    error: `Failed to get post content`,
  };
};
