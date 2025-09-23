import { TreeDeciduous } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { LastPosts, LastPostsSkeleton } from "@/components/last-posts";
import { PostStructuredData } from "@/components/post-structured-data";
import { Books, BooksSkeleton } from "./components/books";

export default async function Page() {
  return (
    <div>
      <PostStructuredData type="person" />
      <div className="text-neutral-800 leading-7 space-y-6 prose prose-a:decoration-neutral-300 prose-a:hover:decoration-neutral-400">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight">Moritz Meyer</span>
            <span className="opacity-50 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 rounded text-sm">
              he/him
            </span>
          </div>
        </div>
        <div className="leading-7 lg:mt-36">
          Hey, I&apos;m Moritz. I work in the triangle{" "}
          <span className="text-[12px] px-0.5 -mt-1 inline-block">◢</span> of
          Software Engineering, User Experience, and Engineering Management.
          Currently, I&apos;m work as{" "}
          <span className="font-semibold">Engineering Manager</span> at{" "}
          <span className="font-semibold">1KOMMA5°</span> in the{" "}
          <TreeDeciduous className="inline-block w-4 h-4 -mt-1 -mr-0.5" />{" "}
          Climate Tech space, mostly focused on customer experience in delivery
          processes.
        </div>
        <div className="leading-7">
          I <Link href="/blog">write</Link> down little realizations I make on
          my way.
        </div>
      </div>
      <div className="mt-12">
        <div className="flex items-center justify-between pr-4">
          <div className="font-medium dark:text-white">Recent Posts</div>
          <Link
            href="/blog"
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:underline flex items-center"
          >
            View All
          </Link>
        </div>

        <div className="flex flex-col gap-2 -ml-4 mt-4">
          <Suspense fallback={<LastPostsSkeleton />}>
            <LastPosts />
          </Suspense>
        </div>
      </div>
      <div className="mt-12">
        <div className="font-medium dark:text-white">Currently Reading</div>

        <div className="-ml-4">
          <Suspense fallback={<BooksSkeleton />}>
            <Books />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
