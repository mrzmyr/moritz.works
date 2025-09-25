import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type FC, Suspense } from "react";
import { siteConfig } from "@/config/app";
import { getPostMetadata, getPosts } from "@/lib/posts";
import { tryCatch } from "@/lib/utils";

type PostModule = { default: FC };

// Initialize dayjs plugins
dayjs.extend(relativeTime);

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { data: post, error } = await getPostMetadata(params.slug);

  if (error || !post) {
    notFound();
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [...siteConfig.keywords, ...post.title.toLowerCase().split(" ")],
    authors: [
      {
        name: siteConfig.author.name,
        url: siteConfig.url,
      },
    ],
    creator: siteConfig.author.name,
    publisher: siteConfig.author.name,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: post.url,
      siteName: siteConfig.name,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [siteConfig.author.name],
      images: [
        {
          url: `${siteConfig.url}/static/og/default.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`${siteConfig.url}/static/og/default.png`],
      creator: siteConfig.author.twitter,
    },
    alternates: {
      canonical: post.url,
    },
  };
}

const PostContent = async ({ slug }: { slug: string }) => {
  const { data: post, error } = await getPostMetadata(slug);

  if (error || !post) {
    notFound();
  }

  // Then try a TSX component (NOT a route's page.tsx)
  const {
    success: tsxSuccess,
    data: tsxData,
    error: tsxError,
  } = await tryCatch(import(`@/app/blog/[slug]/(${slug})/page.tsx`));

  if (tsxSuccess && tsxData && !tsxError) {
    const tsx: PostModule = tsxData;
    const TsxContent = tsx.default;
    return <TsxContent />;
  }

  // Try MDX first
  const {
    success,
    data,
    error: mdxError,
  } = await tryCatch(import(`@/content/${slug}.mdx`));

  if (success && data && !mdxError) {
    const mdx: PostModule = data;
    const MdxContent = mdx.default;
    return <MdxContent />;
  }

  notFound();
};

const PostContentSkeleton = () => {
  return (
    <div className="mb-8">
      <div className="h-[24px] w-2/5 bg-neutral-200 dark:bg-neutral-700 rounded" />
      <div className="h-[20px] w-3/5 bg-neutral-200 dark:bg-neutral-700 rounded" />
    </div>
  );
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense fallback={<PostContentSkeleton />}>
      <PostContent slug={slug} />
    </Suspense>
  );
}

export async function generateStaticParams() {
  const { data: posts, error } = await getPosts();

  if (error || !posts) {
    notFound();
  }

  return posts.map((post) => ({
    slug: post.id,
  }));
}

export const dynamicParams = false;
