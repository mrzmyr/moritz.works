import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { getPosts } from "../lib/notion";

dayjs.extend(relativeTime);

export const LastPosts = async () => {
	const posts = await getPosts();

	return (
		<div className="flex flex-col gap-1.5 -ml-4">
			{posts.slice(0, 3).map((post) => (
				<Link
					href={`/blog/${post.slug}`}
					key={post.id}
					className="flex items-center justify-between group item-start hover:bg-neutral-100 dark:hover:bg-neutral-800 px-4 py-2.5 rounded-md"
				>
					<div className="flex flex-col gap-1">
						<div className="dark:text-white">{post.title}</div>
						<div className="text-neutral-400 dark:text-neutral-400 text-sm">
							{post.excerpt}
						</div>
					</div>
					<div className="text-sm text-neutral-400 dark:text-neutral-400">
						{dayjs(post.createdAt).fromNow()}
					</div>
				</Link>
			))}
		</div>
	);
};
