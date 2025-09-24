import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageBack } from "@/components/page-back";
import { PostComments } from "@/components/post-comments";
import { PostHeadline } from "@/components/post-headline";
import { PostMetadata } from "@/components/post-metadata";
import { PostStructuredData } from "@/components/post-structured-data";
import { siteConfig } from "@/config/app";
import { getPostMetadata, getPosts } from "@/lib/posts";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { data: post, error } = await getPostMetadata(params.slug);

  if (error || !post) {
    notFound();
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [...siteConfig.keywords, ...post.title.toLowerCase().split(" ")],
    authors: [
      {
        name: siteConfig.author.name,
        url: siteConfig.url,
      },
    ],
    creator: siteConfig.author.name,
    publisher: siteConfig.author.name,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: post.url,
      siteName: siteConfig.name,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [siteConfig.author.name],
      images: [
        {
          url: `${siteConfig.url}/static/og/default.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`${siteConfig.url}/static/og/default.png`],
      creator: siteConfig.author.twitter,
    },
    alternates: {
      canonical: post.url,
    },
  };
}

const PostContent = async ({ slug }: { slug: string }) => {
  const { data: post, error } = await getPostMetadata(slug);

  if (error || !post) {
    notFound();
  }

  const { default: Content } = await import(`@/content/${slug}.mdx`);

  return (
    <>
      <PostStructuredData
        type="article"
        title={post.title}
        description={post.excerpt}
        url={post.url}
        datePublished={post.createdAt}
        dateModified={post.updatedAt}
        image={`${siteConfig.url}/static/og/default.png`}
      />
      <div className="mb-8">
        <PostHeadline>{post.title}</PostHeadline>
        <PostMetadata
          createdAt={new Date(post.createdAt)}
          updatedAt={new Date(post.updatedAt)}
        />
      </div>
      <div className="prose prose-neutral dark:prose-invert dark:prose-p:opacity-95 max-w-none prose-headings:mt-4 prose-headings:mb-2 text-neutral-900 dark:text-neutral-200 prose-li:my-0.5 prose-ul:pl-4 prose-ul:my-1 prose-code:bg-neutral-100/50 prose-code:border prose-code:border-neutral-200 prose-code:text-neutral-900 prose-code:rounded-md prose-code:px-1 prose-code:py-0 prose-code:font-normal prose-code:after:content-[''] prose-code:before:content-[''] prose-a:underline prose-headings:font-semibold prose-pre:bg-white dark:prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-700 prose-pre:rounded-md prose-pre:font-normal prose-pre:after:content-[''] prose-pre:before:content-[''] prose-p:my-2 prose-hr:mb-4 prose-p:leading-[1.65]">
        <Content />
      </div>

      <PostComments slug={slug} />
    </>
  );
};

const PostContentSkeleton = () => {
  return (
    <div className="mb-8">
      <div className="h-[24px] w-2/5 bg-neutral-200 dark:bg-neutral-700 rounded" />
      <div className="h-[20px] w-3/5 bg-neutral-200 dark:bg-neutral-700 rounded" />
    </div>
  );
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <PageBack href="/blog" />
      <Suspense fallback={<PostContentSkeleton />}>
        <PostContent slug={slug} />
      </Suspense>
    </>
  );
}

export async function generateStaticParams() {
  const { data: posts, error } = await getPosts();

  if (error || !posts) {
    notFound();
  }

  return posts.map((post) => ({
    slug: post.id,
  }));
}

export const dynamicParams = false;
