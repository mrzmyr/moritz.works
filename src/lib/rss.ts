import { siteConfig } from "@/config/app";
import type { PostData } from "@/lib/posts/types";

export const RSS_FEED_PATH = "/rss.xml";
export const RSS_CONTENT_TYPE = "application/rss+xml; charset=utf-8";

type FeedPost = Pick<
  PostData,
  "createdAt" | "excerpt" | "slug" | "title" | "updatedAt" | "url"
>;

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (character) => {
    switch (character) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return character;
    }
  });

const toRssDate = (value: string | Date) => new Date(value).toUTCString();

const absoluteUrl = (pathOrUrl: string) =>
  new URL(pathOrUrl, siteConfig.url).toString();

export const generateRssFeed = (posts: readonly FeedPost[]) => {
  const feedUrl = absoluteUrl(RSS_FEED_PATH);
  const blogUrl = absoluteUrl("/blog");
  const lastBuildDate =
    posts.length > 0
      ? toRssDate(
          posts.reduce((latestPost, post) =>
            new Date(post.updatedAt) > new Date(latestPost.updatedAt)
              ? post
              : latestPost,
          ).updatedAt,
        )
      : toRssDate(new Date());

  const items = posts
    .map((post) => {
      const postUrl = absoluteUrl(post.url || `/blog/${post.slug}`);
      const description = post.excerpt
        ? `\n      <description>${escapeXml(post.excerpt)}</description>`
        : "";

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>${description}
      <pubDate>${toRssDate(post.createdAt)}</pubDate>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${escapeXml(blogUrl)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>${escapeXml(siteConfig.name)}</generator>
${items}
  </channel>
</rss>
`;
};
