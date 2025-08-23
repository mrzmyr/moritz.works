import { Client } from "@notionhq/client";
import { NotionAPI } from "notion-client";

const notion = new Client({ auth: process.env.NOTION_KEY });

const notionX = new NotionAPI({
  authToken: process.env.NOTION_TOKEN_V2,
  activeUser: process.env.NOTION_ACTIVE_USER,
});

import { Post } from "@/app/types/post";

const NOTION_DATABASE_BLOG_ID = "0499b90b-5ed1-466d-af88-5b15dc8f80d9";

const _transformPage = (page: any): Omit<Post, "recordMap"> => {
  return {
    id: page.id,
    title: page.properties.title.title[0].plain_text,
    icon: page.icon,
    slug: page.properties.slug.rich_text[0].plain_text,
    excerpt:
      page.properties.excerpt.rich_text.length > 0
        ? page.properties.excerpt.rich_text[0].plain_text
        : null,
    createdAt: new Date(page.properties.created_at.date.start).toISOString(),
    updatedAt: page.last_edited_time,
  };
};

export const getPosts = async (): Promise<Omit<Post, "recordMap">[]> => {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_BLOG_ID,
      sorts: [
        {
          property: "created_at",
          direction: "descending",
        },
      ],
    });

    const valid_pages = response.results
      .filter((result: any) => {
        return (
          result.properties.title.title.length > 0 &&
          result.properties.slug.rich_text.length > 0 &&
          result.properties.excerpt.rich_text.length > 0 &&
          result.properties.created_at.date !== null
        );
      })
      .filter((result: any) => {
        return result.properties.status.select.name === "Done";
      });

    return valid_pages.map((result: any) => ({
      id: result.id,
      icon: result.icon,
      title: result.properties.title.title[0].plain_text,
      slug: result.properties.slug.rich_text[0].plain_text,
      excerpt:
        result.properties.excerpt.rich_text.length > 0
          ? result.properties.excerpt.rich_text[0].plain_text
          : null,
      createdAt: new Date(
        result.properties.created_at.date.start
      ).toISOString(),
      updatedAt: result.last_edited_time,
    }));
  } catch (error) {
    console.error("Error fetching posts from Notion:", error);
    return [];
  }
};

export const getPost = async (slug: string): Promise<Post> => {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_BLOG_ID,
      filter: {
        or: [
          {
            property: "slug",
            text: {
              equals: slug,
            },
          },
        ],
      },
    });

    if (!response.results.length) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    const pageId = response.results[0].id;
    const page = _transformPage(response.results[0]);

    // Get the recordMap for react-notion-x
    const recordMap = await notionX.getPage(pageId);

    return {
      ...page,
      recordMap,
    };
  } catch (error) {
    console.error(`Error fetching post with slug "${slug}":`, error);
    throw error;
  }
};
