import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getPosts } from "../lib/notion";
import { PostListItem, PostListItemSkeleton } from "./post-list-item";

dayjs.extend(relativeTime);

export const LastPosts = async () => {
  const posts = await getPosts();

  return (
    <>
      {posts.slice(0, 3).map((post) => (
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

export const LastPostsSkeleton = () => {
  // Use a static array of keys to avoid using index as key
  const skeletonKeys = [
    "last-posts-skeleton-1",
    "last-posts-skeleton-2",
    "last-posts-skeleton-3",
  ];

  return (
    <>
      {skeletonKeys.map((key) => (
        <PostListItemSkeleton key={key} />
      ))}
    </>
  );
};
