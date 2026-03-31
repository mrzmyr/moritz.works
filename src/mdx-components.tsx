import {
  ArrowRightIcon,
  BlendIcon,
  GlobeIcon,
  HandshakeIcon,
  SpeechIcon,
  TargetIcon,
  UserIcon,
} from "lucide-react";
import type { MDXComponents } from "mdx/types";
import { AiButton } from "@/components/ai-button";
import { Blink } from "@/components/blink";
import { Card, CardContent, CardTitle } from "@/components/card";
import { Figure, FigureCaption, FigureContent } from "@/components/figure";
import {
  BadExample,
  ExampleGroup,
  GoodExample,
} from "@/components/good-bad-examples";
import { Grid, GridItem } from "@/components/grid";
import { H1, H2, H3, H4, H5, H6 } from "@/components/headlines";
import { InfoTooltip } from "@/components/info-tooltip";
import { PostHeadline } from "@/components/post-headline";
import { PostMetadata } from "@/components/post-metadata";
import { PostStructuredData } from "@/components/post-structured-data";
import { SimpleCodeBlock } from "@/components/simple-code-block";
import { SlackMessage } from "@/components/slack-message/slack-message";
import { SlackMessageReply } from "@/components/slack-message/slack-message-reply";
import { StackItem } from "@/components/stack-item";
import { Term } from "@/components/term";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ZoomImage } from "@/components/zoom-image";

const components: MDXComponents = {
  PostMetadata,
  PostHeadline,
  PostStructuredData,
  Figure,
  FigureCaption,
  FigureContent,
  ExampleGroup,
  GoodExample,
  BadExample,
  SlackMessage,
  SlackMessageReply,
  Card,
  CardContent,
  CardTitle,
  Blink,
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
  Image: ({ ...props }) => {
    return <ZoomImage className="w-full" {...props} />;
  },
  code: SimpleCodeBlock,
  InfoTooltip,
  Term,
  StackItem,
  Grid,
  GridItem,
  AiButton,
  SpeechIcon,
  UserIcon,
  GlobeIcon,
  TargetIcon,
  HandshakeIcon,
  ArrowRightIcon,
  BlendIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
