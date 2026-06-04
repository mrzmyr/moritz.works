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

export const PostListItem = async ({
  post,
  shortcut,
}: {
  post: PostData;
  shortcut?: string[];
}) => {
  const { data: Preview } = await getPostPreviewFromTsx(post.slug);

  if (Preview) {
    return (
      <PostListItemPreviewContaienr post={post} shortcut={shortcut}>
        {/* @ts-expect-error used as dynamic import */}
        <Preview post={post} />
      </PostListItemPreviewContaienr>
    );
  }

  return <PostListItemSimple post={post} shortcut={shortcut} />;
};

export const PostListItemSkeleton = () => {
  return <PostListItemSimpleSkeleton />;
};
