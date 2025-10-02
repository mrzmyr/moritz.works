import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getPostPreviewFromTsx } from "@/lib/posts";
import type { PostData } from "@/lib/posts/types";
import { PostListItemPreviewContaienr } from "./post-list-item-preview-container";
import {
  PostListItemSimple,
  PostListItemSimpleSkeleton,
} from "./post-list-item-simple";

dayjs.extend(relativeTime);

export const PostListItem = async ({ post }: { post: PostData }) => {
  const { data: Preview, error } = await getPostPreviewFromTsx(post.slug);

  if (Preview) {
    return (
      <PostListItemPreviewContaienr post={post}>
        {/* @ts-expect-error used as dynamic import */}
        <Preview post={post} />
      </PostListItemPreviewContaienr>
    );
  }

  return <PostListItemSimple post={post} />;
};

export const PostListItemSkeleton = () => {
  return <PostListItemSimpleSkeleton />;
};
