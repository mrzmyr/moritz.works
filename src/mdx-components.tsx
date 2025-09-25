import type { MDXComponents } from "mdx/types";
import { Figure, FigureCaption, FigureContent } from "@/components/figure";
import { H1, H2, H3, H4, H5, H6 } from "@/components/headlines";
import { PostComments } from "@/components/post-comments";
import { PostHeadline } from "@/components/post-headline";
import { PostMetadata } from "@/components/post-metadata";
import { PostStructuredData } from "@/components/post-structured-data";
import { SimpleCodeBlock } from "@/components/simple-code-block";
import { ZoomImage } from "@/components/zoom-image";

const components: MDXComponents = {
  PostMetadata,
  PostHeadline,
  PostComments,
  PostStructuredData,
  Figure,
  FigureCaption,
  FigureContent,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  img: ({ ...props }) => {
    return (
      <Figure>
        <FigureContent>
          <ZoomImage className="w-full" {...props} />
        </FigureContent>
        {props.alt && <FigureCaption>{props.alt}</FigureCaption>}
      </Figure>
    );
  },
  code: SimpleCodeBlock,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
