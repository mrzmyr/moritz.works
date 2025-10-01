import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPosts } from "@/lib/posts";
import { PostListItem, PostListItemSkeleton } from "./post-list-item";

dayjs.extend(relativeTime);

const Posts = async () => {
  const { data: posts, error } = await getPosts();
  if (error || !posts) {
    notFound();
  }
  return posts.slice(0, 3).map((post) => (
    <Suspense key={post.id} fallback={<PostListItemSkeleton />}>
      <PostListItem key={post.id} post={post} />
    </Suspense>
  ));
};

const LastPostsSkeleton = () => {
  const keys = Array.from({ length: 3 }, (_, index) => `post-${index}`);
  return (
    <div className="flex flex-col gap-2">
      {keys.map((key) => (
        <PostListItemSkeleton key={key} />
      ))}
    </div>
  );
};

export const LastPosts = async () => {
  return (
    <Suspense fallback={<LastPostsSkeleton />}>
      <Posts />
    </Suspense>
  );
};
