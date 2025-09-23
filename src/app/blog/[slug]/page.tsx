import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Metadata } from "next";
import { Suspense } from "react";
import { NotionPage } from "@/components/notion-page";
import { PageBack } from "@/components/page-back";
import { PostComments } from "@/components/post-comments";
import { PostHeadline } from "@/components/post-headline";
import { PostMetadata } from "@/components/post-metadata";
import { PostStructuredData } from "@/components/post-structured-data";
import { siteConfig } from "@/config/app";
import { getPost, getPosts } from "@/lib/notion";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Enable ISR with 60 seconds revalidation
export const revalidate = 60;

// Allow dynamic params for on-demand generation
export const dynamicParams = true;

export async function generateStaticParams() {
  // For ISR, we only pre-generate the most recent posts
  // Other posts will be generated on-demand when requested
  const posts = await getPosts();

  // Pre-generate only the 5 most recent posts
  const recentPosts = posts.slice(0, 5);

  return recentPosts.map((post) => ({
    slug: post.slug,
  }));
}

export const runtime = "nodejs";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const post = await getPost(params.slug);

  const postUrl = `${siteConfig.url}/blog/${post.slug}`;

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
      url: postUrl,
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
      canonical: postUrl,
    },
  };
}

const Content = async ({ slug }: { slug: string }) => {
  const post = await getPost(slug);
  const postUrl = `${siteConfig.url}/blog/${post.slug}`;

  return (
    <>
      <PostStructuredData
        type="article"
        title={post.title}
        description={post.excerpt}
        url={postUrl}
        datePublished={post.createdAt}
        dateModified={post.updatedAt}
        image={`${siteConfig.url}/static/og/default.png`}
      />
      <div className="mb-8">
        <PostHeadline>{post.title}</PostHeadline>
        <PostMetadata
          createdAt={new Date(post.createdAt)}
          updatedAt={new Date(post.updatedAt)}
        />
      </div>
      <div className="prose text-md prose-p:mb-3 prose-p:mt-3 dark:prose-invert dark:text-neutral-300 text-black">
        {post.recordMap && <NotionPage recordMap={post.recordMap} />}
      </div>
    </>
  );
};

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-neutral-200 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/2 mt-2"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-neutral-200 rounded w-full"></div>
        <div className="h-4 bg-neutral-200 rounded w-full"></div>
        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
        <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
        <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
      </div>
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
    <>
      <PageBack />
      <Suspense fallback={<Skeleton />}>
        <Content slug={slug} />
      </Suspense>
      <div className="mt-12">
        <PostComments slug={slug} />
      </div>
    </>
  );
}
