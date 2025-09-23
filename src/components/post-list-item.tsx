import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";

dayjs.extend(relativeTime);

export const PostListItem = ({
  id,
  slug,
  title,
  excerpt,
  createdAt,
}: {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  createdAt: string;
}) => {
  return (
    <Link
      href={`/blog/${slug}`}
      key={id}
      className="flex justify-between group items-start hover:bg-neutral-100 dark:hover:bg-neutral-800 px-4 py-2.5 rounded-md"
    >
      <div className="flex flex-col gap-1">
        <div className="dark:text-white">{title}</div>
        {excerpt && (
          <div className="text-neutral-400 dark:text-neutral-400 text-sm">
            {excerpt}
          </div>
        )}
      </div>
      <div className="text-sm text-neutral-400 dark:text-neutral-400">
        {dayjs(createdAt).fromNow()}
      </div>
    </Link>
  );
};

export const PostListItemSkeleton = () => {
  return (
    <div className="h-[68px] flex justify-between items-start px-4 py-2.5 rounded-md animate-pulse gap-4">
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-[24px] w-2/5 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-[20px] w-3/5 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>
      <div className="h-[20px] w-20 bg-neutral-200 dark:bg-neutral-700 rounded self-start" />
    </div>
  );
};
