import Link from "next/link";
import type { PostData } from "@/lib/posts/types";

export const PostListItemPreviewContaienr = ({
  post,
  children,
}: {
  post: PostData;
  children: React.ReactNode;
}) => {
  return (
    <Link href={post.url} key={post.id} className="mb-4 mt-2">
      {children}
    </Link>
  );
};
