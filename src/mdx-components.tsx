import type { MDXComponents } from "mdx/types";
import { Figure, FigureCaption, FigureContent } from "@/components/figure";
import { PostComments } from "@/components/post-comments";
import { PostHeadline } from "@/components/post-headline";
import { PostMetadata } from "@/components/post-metadata";
import { PostStructuredData } from "@/components/post-structured-data";
import { ZoomImage } from "@/components/zoom-image";

const components: MDXComponents = {
  PostMetadata,
  PostHeadline,
  PostComments,
  PostStructuredData,
  Figure,
  FigureCaption,
  FigureContent,
  img: ZoomImage,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
