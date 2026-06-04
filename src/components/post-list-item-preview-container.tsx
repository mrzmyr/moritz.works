import Link from "next/link";
import { ShortcutHint } from "@/components/shortcut-hint";
import type { PostData } from "@/lib/posts/types";

export const PostListItemPreviewContaienr = ({
  post,
  children,
  shortcut,
}: {
  post: PostData;
  children: React.ReactNode;
  shortcut?: string[];
}) => {
  return (
    <Link
      href={post.url}
      key={post.id}
      className="relative mb-4 mt-2 block"
      data-hotkey={shortcut?.join(" ")}
    >
      {children}
      {shortcut && (
        <ShortcutHint keys={shortcut} className="absolute top-2 right-2" />
      )}
    </Link>
  );
};
