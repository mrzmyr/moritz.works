import { notFound } from "next/navigation";
import { getPostContent } from "@/lib/posts";

export const PostContent = async ({ slug }: { slug: string }) => {
  const { data: post, error } = await getPostContent(slug);

  if (error || !post) {
    notFound();
  }

  // @ts-expect-error used as dynamic import
  const Content = post.content as React.ComponentType;

  return <Content />;
};
