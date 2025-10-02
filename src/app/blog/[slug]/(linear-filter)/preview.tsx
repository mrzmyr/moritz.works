import dayjs from "dayjs";
import type { PostData } from "@/lib/posts/types";
import { FilterDemo } from "./components/filter-demo";

export default function Preview({ post }: { post: PostData }) {
  return (
    <div className="flex flex-col gap-2 hover:bg-border/50 border border-border rounded-lg mx-4 max-h-[300px] overflow-hidden group transition-all duration-300 ease-out">
      <div className="flex flex-row justify-between gap-2 pt-4 px-4">
        <div className="flex flex-col gap-1">
          <div className="dark:text-white">{post.title}</div>

          {post.excerpt && (
            <div className="text-neutral-400 dark:text-neutral-400 text-sm">
              {post.excerpt}
            </div>
          )}
        </div>
        <div className="text-sm text-neutral-400 dark:text-neutral-400 mt-2 sm:mt-0">
          {dayjs(post.createdAt).fromNow()}
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 w-full overflow-hidden block translate-x-6 translate-y-6 pointer-events-none group-hover:translate-y-4 group-hover:translate-x-5 transition-all duration-300 ease-out will-change-transform">
        <FilterDemo />
      </div>
    </div>
  );
}
