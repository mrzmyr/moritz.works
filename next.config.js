import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		unoptimized: true,
	},
	async rewrites() {
		return [
			{
				source: "/relay-4Hyx/static/:path*",
				destination: "https://eu-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/relay-4Hyx/:path*",
				destination: "https://eu.i.posthog.com/:path*",
			},
		];
	},
	pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

	skipTrailingSlashRedirect: true,
};

const withMDX = createMDX({
	options: {
		remarkPlugins: ["remark-gfm", "remark-images", "remark-frontmatter"],
		rehypePlugins: ["rehype-slug"],
	},
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
