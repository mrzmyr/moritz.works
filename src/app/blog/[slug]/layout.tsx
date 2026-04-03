import { kv } from "@vercel/kv";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { ClapButton } from "@/components/clap-button";
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
  const [{ data: post, error }, headersList] = await Promise.all([
    getPostMetadata(slug),
    headers(),
  ]);

  if (error || !post) {
    notFound();
  }

  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const [claps, userClaps] = await Promise.all([
    kv.get<number>(`claps:${slug}`).then((v) => v ?? 0),
    kv.get<number>(`claps:${slug}:ip:${ip}`).then((v) => v ?? 0),
  ]);

  return (
    <>
      <Breadcrumb
        items={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
      />
      <PostStructuredData
        type="article"
        title={post.title}
        description={post.excerpt}
        url={post.url}
        datePublished={post.createdAt}
        dateModified={post.updatedAt}
        image={`${siteConfig.url}/static/og/default.png`}
      />
      <div className="relative">
        <div className="my-12">
          <PostHeadline>{post.title}</PostHeadline>
          <PostMetadata
            createdAt={new Date(post.createdAt)}
            updatedAt={new Date(post.updatedAt)}
          />
        </div>
        <ClapButton slug={slug} initialClaps={claps} initialUserClaps={userClaps} />
        <PostContentConatiner>{children}</PostContentConatiner>
      </div>
    </>
  );
}
