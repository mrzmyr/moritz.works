import dayjs from "dayjs";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { siteConfig } from "@/config/app";
import { getPosts } from "../../lib/notion";

export const metadata: Metadata = {
	title: "Blog",
	description: `Read the latest thoughts and insights from ${siteConfig.author.name} on software engineering, user experience, and engineering management in the climate tech space.`,
	openGraph: {
		title: `Blog | ${siteConfig.name}`,
		description: `Read the latest thoughts and insights from ${siteConfig.author.name} on software engineering, user experience, and engineering management in the climate tech space.`,
		url: `${siteConfig.url}/blog`,
		type: "website",
		images: [
			{
				url: `${siteConfig.url}/static/og/default.png`,
				width: 1200,
				height: 630,
				alt: `${siteConfig.author.name} Blog`,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: `Blog | ${siteConfig.name}`,
		description: `Read the latest thoughts and insights from ${siteConfig.author.name} on software engineering, user experience, and engineering management in the climate tech space.`,
		images: [`${siteConfig.url}/static/og/default.png`],
		creator: siteConfig.author.twitter,
	},
	alternates: {
		canonical: `${siteConfig.url}/blog`,
	},
};

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
		<div className="-ml-4">
			{posts.map((post) => (
				<Link
					href={`/blog/${post.slug}`}
					className="group flex flex-col gap-4 p-4 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
					key={post.id}
				>
					<div className="flex flex-col">
						<div className="flex items-center gap-2 justify-between">
							<h2 className="text-lg font-medium dark:text-white">
								{post.title}
							</h2>
							<div className="text-xl text-neutral-500 dark:text-neutral-400 mt-2">
								{post.icon.emoji}
							</div>
						</div>
						<div className="text-sm text-neutral-600 dark:text-neutral-400">
							{post.excerpt}
						</div>
					</div>
					<div className="text-xs text-neutral-400 dark:text-neutral-400">
						{dayjs(post.createdAt).format("MMMM D, YYYY")}
					</div>
				</Link>
			))}
		</div>
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
