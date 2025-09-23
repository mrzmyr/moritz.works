import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  PostListItem,
  PostListItemSkeleton,
} from "@/components/post-list-item";
import { siteConfig } from "@/config/app";
import { getPosts } from "../../lib/notion";

dayjs.extend(relativeTime);

export const metadata: Metadata = {
  title: "Blog",
  description: `Read the latest thoughts and insights from ${siteConfig.author.name} on software engineering, user experience, and engineering management in the climate tech space.`,
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description: `Read the latest thoughts and insights from ${siteConfig.author.name} on software engineering, user experience, and engineering management in the climate tech space.`,
    url: `${siteConfig.url}/blog`,
    type: "website",
    images: [
      {
        url: `${siteConfig.url}/static/og/default.png`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.author.name} Blog`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Blog | ${siteConfig.name}`,
    description: `Read the latest thoughts and insights from ${siteConfig.author.name} on software engineering, user experience, and engineering management in the climate tech space.`,
    images: [`${siteConfig.url}/static/og/default.png`],
    creator: siteConfig.author.twitter,
  },
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
};

// Enable ISR with 60 seconds revalidation
export const revalidate = 60;

const PostsSkeleton = () => {
  const skeletonKeys = [
    "posts-skeleton-1",
    "posts-skeleton-2",
    "posts-skeleton-3",
    "posts-skeleton-4",
    "posts-skeleton-5",
  ];

  return (
    <>
      {skeletonKeys.map((key) => (
        <PostListItemSkeleton key={key} />
      ))}
    </>
  );
};

const Posts = async () => {
  const posts = await getPosts();

  return (
    <>
      {posts.map((post) => (
        <PostListItem
          id={post.id}
          slug={post.slug!}
          title={post.title}
          excerpt={post.excerpt}
          createdAt={post.createdAt}
          key={post.id}
        />
      ))}
    </>
  );
};

export default async function Page() {
  return (
    <>
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-neutral-600 dark:text-neutral-400 hover:underline flex items-center"
        >
          ← Back
        </Link>
      </div>

      <h1 className="text-2xl font-medium mb-4 dark:text-white">Blog</h1>

      <div className="flex flex-col gap-2 -ml-4">
        <Suspense fallback={<PostsSkeleton />}>
          <Posts />
        </Suspense>
      </div>
    </>
  );
}
