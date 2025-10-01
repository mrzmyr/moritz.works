import { notFound } from "next/navigation";
import { PageBack } from "@/components/page-back";
import { PostComments } from "@/components/post-comments";
import { PostContentConatiner } from "@/components/post-content-container";
import { PostHeadline } from "@/components/post-headline";
import { PostMetadata } from "@/components/post-metadata";
import { PostStructuredData } from "@/components/post-structured-data";
import { siteConfig } from "@/config/app";
import { getPostMetadata } from "@/lib/posts";

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
    <>
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
        <PostHeadline>{post.title}</PostHeadline>
        <PostMetadata
          createdAt={new Date(post.createdAt)}
          updatedAt={new Date(post.updatedAt)}
        />
      </div>
      <PostContentConatiner>{children}</PostContentConatiner>
    </>
  );
}
