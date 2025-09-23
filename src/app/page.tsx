import { TreeDeciduous } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { LastPosts, LastPostsSkeleton } from "@/components/last-posts";
import { PostStructuredData } from "@/components/post-structured-data";
import { Books, BooksSkeleton } from "./components/books";
import WorkList from "./components/work-list";

const Headline = ({ children }: { children: React.ReactNode }) => {
  return <div className="font-medium dark:text-white">{children}</div>;
};

const Section = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col mt-12">{children}</div>;
};

const QuickLink = ({
  children,
  href,
  ...props
}: {
  children: React.ReactNode;
  href: string;
  [key: string]: any;
}) => {
  return (
    <Link
      href={href}
      className="text-neutral-600 dark:text-neutral-400 text-sm hover:text-neutral-800 dark:hover:text-neutral-200"
      {...props}
    >
      {children}
    </Link>
  );
};

export default async function Page() {
  return (
    <div>
      <PostStructuredData type="person" />
      <div className="text-neutral-800 leading-7 space-y-6 dark:text-neutral-200">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight">Moritz Meyer</span>
            <span className="opacity-50 rounded text-sm">he/him</span>
          </div>
        </div>
        <div className="leading-7 lg:mt-36">
          Hey, I&apos;m Moritz. I work in the triangle{" "}
          <span className="text-[12px] px-0.5 -mt-1 inline-block">◢</span> of
          Software Engineering, User Experience, and Engineering Management.
          Currently, I&apos;m working as{" "}
          <span className="font-semibold">Engineering Manager</span> at{" "}
          <span className="font-semibold">1KOMMA5°</span> in the{" "}
          <TreeDeciduous className="inline-block w-4 h-4 -mt-1 -mr-0.5" />{" "}
          Climate Tech space, mostly focused on customer experience in delivery
          processes.
        </div>
        <div className="leading-7">
          Originally studied the combination of computer science and psychology
          namely Usability Engineering, made a{" "}
          <a
            href="https://www.researchgate.net/publication/335566326_Emoji_Emoji_on_the_Wall_Show_Me_One_I_Show_You_All_-_An_Exploratory_Study_on_the_Connection_Between_Traits_and_Emoji_Usage"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            study
          </a>{" "}
          if how you use emojis predicts your character, and built{" "}
          <Link
            href="https://pixy.day"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Pixy
          </Link>
          .
        </div>
        <div className="leading-7">
          I{" "}
          <Link href="/blog" className="underline">
            write
          </Link>{" "}
          down little realizations I make on my way.
        </div>
      </div>

      <Section>
        <div className="flex items-center justify-between">
          <Headline>Work</Headline>
          <QuickLink
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.linkedin.com/in/bd40da1b5cafa74efb3c0d32ae3989b0/"
          >
            View All
          </QuickLink>
        </div>

        <div className="mt-6">
          <WorkList />
        </div>
      </Section>

      <Section>
        <div className="flex items-center justify-between">
          <Headline>Recent Posts</Headline>
          <QuickLink href="/blog">View All</QuickLink>
        </div>

        <div className="flex flex-col gap-2 -ml-4 mt-4 -mr-4">
          <Suspense fallback={<LastPostsSkeleton />}>
            <LastPosts />
          </Suspense>
        </div>
      </Section>

      <Section>
        <Headline>Currently Reading</Headline>

        <div className="-ml-4 -mr-4 mt-4">
          <Suspense fallback={<BooksSkeleton />}>
            <Books />
          </Suspense>
        </div>
      </Section>
    </div>
  );
}
