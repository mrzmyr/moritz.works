import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/app";
import { getPosts } from "@/lib/notion";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Get all posts
	const posts = await getPosts();

	// Create post entries
	const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
		url: `${siteConfig.url}/blog/${post.slug}`,
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
