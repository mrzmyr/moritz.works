import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageBack } from "@/components/page-back";
import {
  PostListItem,
  PostListItemSkeleton,
} from "@/components/post-list-item";
import { siteConfig } from "@/config/app";
import { getPosts } from "@/lib/posts";

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

const Posts = async () => {
  const { data: posts, error } = await getPosts();

  if (error || !posts) {
    notFound();
  }

  return posts.map((post) => <PostListItem key={post.id} post={post} />);
};

const PostsSkeleton = () => {
  const keys = Array.from({ length: 3 }, (_, index) => `post-${index}`);

  return (
    <div className="flex flex-col gap-2">
      {keys.map((key) => (
        <PostListItemSkeleton key={key} />
      ))}
    </div>
  );
};

export default function Page() {
  return (
    <>
      <PageBack href="/" />

      <h1 className="text-2xl font-medium mb-4 dark:text-white">Blog</h1>

      <div className="flex flex-col gap-2 -ml-4 -mr-4">
        <Suspense fallback={<PostsSkeleton />}>
          <Posts />
        </Suspense>
      </div>
    </>
  );
}
