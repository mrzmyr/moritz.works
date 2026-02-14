import { notFound } from "next/navigation";
import { PageBack } from "@/components/page-back";
import { PostContentConatiner } from "@/components/post-content-container";
import { PostHeadline } from "@/components/post-headline";
import { PostMetadata } from "@/components/post-metadata";
import { PostStructuredData } from "@/components/post-structured-data";
import { PostCopyMarkdown } from "@/components/ui/post-copy-markdown";
import { DrawingProvider } from "@/components/drawing/drawing-provider";
import { DrawingLayer } from "@/components/drawing/drawing-layer";
import { siteConfig } from "@/config/app";
import { getPostMetadata } from "@/lib/posts";
import { getAbsolutePostUrl } from "@/lib/urls";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: post, error } = await getPostMetadata(slug);

  if (error || !post) {
    notFound();
  }

  return (
    <DrawingProvider slug={slug}>
      <div className="relative">
        {/* Canvas layer: full viewport width, behind content */}
        <DrawingLayer />

        {/* Content layer: opaque background, above canvas */}
        <div
          className="relative z-10 bg-neutral-50 dark:bg-[#090909] pt-12 pb-12"
          data-drawing-content
        >
          <PageBack href="/blog" />
          <PostStructuredData
            type="article"
            title={post.title}
            description={post.excerpt}
            url={post.url}
            datePublished={post.createdAt}
            dateModified={post.updatedAt}
            image={`${siteConfig.url}/static/og/default.png`}
          />
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <PostHeadline>{post.title}</PostHeadline>
                <PostMetadata
                  createdAt={new Date(post.createdAt)}
                  updatedAt={new Date(post.updatedAt)}
                />
              </div>
              {post.content && (
                <PostCopyMarkdown
                  content={post.content}
                  url={getAbsolutePostUrl({ slug: post.slug })}
                />
              )}
            </div>
          </div>
          <PostContentConatiner>{children}</PostContentConatiner>
        </div>
      </div>
    </DrawingProvider>
  );
}
