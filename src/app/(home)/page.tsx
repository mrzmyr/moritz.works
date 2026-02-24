import { TreeDeciduous } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SiGithub } from "react-icons/si";
import { Footer } from "@/components/footer";
import { LastPosts } from "@/components/last-posts";
import { PostStructuredData } from "@/components/post-structured-data";
import { Books, BooksSkeleton } from "../components/books";
import WorkList from "../components/work-list";
import { LlmOpsPreview } from "../llm-ops/preview";
import { AgentOpsPreview } from "../agent-ops/preview";
import { AuthButton } from "./auth-button";

const Headline = ({ children }: { children: React.ReactNode }) => {
  return <div className="font-medium dark:text-white">{children}</div>;
};

const Section = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col mt-16">{children}</div>;
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
    <>
      <PostStructuredData type="person" />
      <div className="max-w-3xl mx-auto pt-8 pb-12 px-4 h-full">
        <div className="text-neutral-800 leading-7 space-y-6 dark:text-neutral-200">
          <div className="flex items-start gap-6 justify-between ">
            <div className="flex flex-col">
              <span className="font-semibold tracking-tight">Moritz Meyer</span>
              <span className="opacity-50 rounded text-sm">he/him</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/mrzmyr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <SiGithub className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
              </a>
              <AuthButton />
            </div>
          </div>
          <div className="leading-7 lg:mt-36">
            Hey, I&apos;m Moritz. I work in the triangle{" "}
            <span className="text-[12px] px-0.5 -mt-1 inline-block">◢</span> of
            Software Engineering, User Experience, and Engineering Management.
            Currently, I&apos;m working as{" "}
            <span className="font-semibold">Engineering Manager</span> at{" "}
            <span className="font-semibold">1KOMMA5°</span> in the{" "}
            <span>
              <TreeDeciduous className="inline-block w-4 h-4 -mt-1 -mr-0.5" />{" "}
              Climate Tech
            </span>{" "}
            space, mostly focused on customer experience in delivery processes.
          </div>
          <div className="leading-7">
            Originally I studied a combination of computer science and
            psychology namely Usability Engineering,{" "}
            <a
              href="https://www.researchgate.net/publication/335566326_Emoji_Emoji_on_the_Wall_Show_Me_One_I_Show_You_All_-_An_Exploratory_Study_on_the_Connection_Between_Traits_and_Emoji_Usage"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              published a study
            </a>{" "}
            if your emojis predict your character, and built{" "}
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
            Currently I'm obsessing on LLMs, here you can find{" "}
            <a href="/llm-ops" className="underline">
              my overview of LLM operations
            </a>{" "}
            and{" "}
            <a href="/agent-ops" className="underline">
              agent operations
            </a>
            .
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <Link
              href="/llm-ops"
              className="flex flex-col rounded-xl border border-border bg-white dark:bg-neutral-900 p-0.5 outline-2 outline outline-neutral-100 dark:outline-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.06)] hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all duration-300 group"
            >
              <div className="rounded-xl border border-border/60 overflow-hidden max-h-[280px] pointer-events-none bg-[#EFEFEF] dark:bg-[#090909]">
                <div className="translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform">
                  <Suspense fallback={<div className="h-[160px]" />}>
                    <LlmOpsPreview />
                  </Suspense>
                </div>
              </div>
              <div className="flex flex-col px-3 py-2.5 gap-0.5">
                <h3 className="text-foreground font-medium tracking-tight">
                  LLM Operations
                </h3>
                <span className="text-muted-foreground text-sm font-normal leading-snug">
                  All components to run LLMs in production
                </span>
              </div>
            </Link>

            <Link
              href="/agent-ops"
              className="flex flex-col rounded-xl border border-border bg-white dark:bg-neutral-900 p-0.5 outline-2 outline outline-neutral-100 dark:outline-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.06)] hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all duration-300 group"
            >
              <div className="rounded-xl border border-border/60 overflow-hidden max-h-[280px] pointer-events-none bg-[#EFEFEF] dark:bg-[#090909]">
                <div className="translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform">
                  <Suspense fallback={<div className="h-[160px]" />}>
                    <AgentOpsPreview />
                  </Suspense>
                </div>
              </div>
              <div className="flex flex-col px-3 py-2.5 gap-0.5">
                <h3 className="text-foreground font-medium tracking-tight">
                  Agent Operations
                </h3>
                <span className="text-muted-foreground text-sm font-normal leading-snug">
                  All components to build and run AI agents
                </span>
              </div>
            </Link>
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
            <LastPosts />
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

        <Footer />
      </div>
    </>
  );
}
