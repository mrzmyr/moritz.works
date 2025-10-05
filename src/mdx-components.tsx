import type { MDXComponents } from "mdx/types";
import { Card, CardContent, CardTitle } from "@/components/card";
import { Figure, FigureCaption, FigureContent } from "@/components/figure";
import { GoodBadExamples } from "@/components/good-bad-examples";
import { H1, H2, H3, H4, H5, H6 } from "@/components/headlines";
import { InfoTooltip } from "@/components/info-tooltip";
import { PostHeadline } from "@/components/post-headline";
import { PostMetadata } from "@/components/post-metadata";
import { PostStructuredData } from "@/components/post-structured-data";
import { SimpleCodeBlock } from "@/components/simple-code-block";
import { SlackMessage } from "@/components/slack-message";
import { StackItem } from "@/components/stack-item";
import { ZoomImage } from "@/components/zoom-image";

const components: MDXComponents = {
  PostMetadata,
  PostHeadline,
  PostStructuredData,
  Figure,
  FigureCaption,
  FigureContent,
  GoodBadExamples,
  SlackMessage,
  Card,
  CardContent,
  CardTitle,
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
  InfoTooltip,
  StackItem,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
