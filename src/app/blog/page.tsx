import dayjs from "dayjs";
import Link from "next/link";
import { Suspense } from "react";
import { getPosts } from "../../lib/notion";

// Enable ISR with 60 seconds revalidation
export const revalidate = 60;

const PostsSkeleton = () => {
  return (
    <ul className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <li
          key={index}
          className="border-b border-neutral-200 dark:border-neutral-800 pb-4"
        >
          <div className="animate-pulse">
            <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded mb-2"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 mt-2"></div>
          </div>
        </li>
      ))}
    </ul>
  );
};

const Posts = async () => {
  const posts = await getPosts();

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li
          key={post.id}
          className="border-b border-neutral-200 dark:border-neutral-800 pb-4"
        >
          <Link href={`/blog/${post.slug}`} className="group flex flex-col">
            <div className="flex items-center gap-2 justify-between">
              <h2 className="text-lg font-medium group-hover:underline dark:text-white">
                {post.title}
              </h2>
              <div className="text-xl text-neutral-500 dark:text-neutral-400 mt-2">
                {post.icon.emoji}
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {post.excerpt}
            </p>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              {dayjs(post.createdAt).format("MMMM D, YYYY")}
            </div>
          </Link>
        </li>
      ))}
    </ul>
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
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Blog</h1>
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
    </>
  );
}
