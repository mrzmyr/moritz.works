import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/app";
import { getPosts } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Get all posts
	const { data: posts, error } = await getPosts();

	if (error || !posts) {
		return [];
	}

	// Create post entries
	const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
		url: post.url,
		lastModified: new Date(post.updatedAt),
		changeFrequency: "weekly",
		priority: 0.7,
	}));

	// Static pages
	const staticEntries: MetadataRoute.Sitemap = [
		{
			url: siteConfig.url,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: `${siteConfig.url}/blog`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.8,
		},
	];

	return [...staticEntries, ...postEntries];
}
