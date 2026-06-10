/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import { generateRssFeed } from "./rss";

describe("generateRssFeed", () => {
  test("renders valid RSS metadata and post items", () => {
    const feed = generateRssFeed([
      {
        title: "Post & <title>",
        excerpt: 'Summary with "quotes" & tags',
        slug: "post-title",
        url: "/blog/post-title",
        createdAt: "2024-06-01",
        updatedAt: "2024-06-02",
      },
    ]);

    expect(feed).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(feed).toContain('<rss version="2.0"');
    expect(feed).toContain("<title>Moritz Meyer</title>");
    expect(feed).toContain("<title>Post &amp; &lt;title&gt;</title>");
    expect(feed).toContain("<link>https://moritz.works/blog/post-title</link>");
    expect(feed).toContain(
      "<description>Summary with &quot;quotes&quot; &amp; tags</description>",
    );
    expect(feed).toContain("<pubDate>Sat, 01 Jun 2024 00:00:00 GMT</pubDate>");
    expect(feed).toContain(
      '<atom:link href="https://moritz.works/rss.xml" rel="self" type="application/rss+xml" />',
    );
    expect(feed).toContain(
      "<lastBuildDate>Sun, 02 Jun 2024 00:00:00 GMT</lastBuildDate>",
    );
  });
});
