import { cn } from "@/lib/utils";

export const PostContentConatiner = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert",
        "dark:prose-p:opacity-95",
        "dark:prose-pre:bg-neutral-900",
        "dark:prose-pre:border-neutral-700",
        "dark:text-neutral-200",
        "max-w-none",
        "pb-28",
        "prose-a:underline",
        "prose-blockquote:font-serif",
        "prose-blockquote:py-2",
        "prose-blockquote:text-2xl",
        "prose-code:after:content-['']",
        "prose-code:before:content-['']",
        "prose-code:bg-neutral-50",
        "prose-code:border",
        "prose-code:border-neutral-200",
        "prose-code:font-normal",
        "prose-code:px-1",
        "prose-code:py-0",
        "prose-code:rounded-md",
        "prose-code:text-neutral-900/50",
        "prose-figure:my-8",
        "prose-headings:font-semibold",
        "prose-headings:mb-2",
        "prose-headings:mt-6",
        "prose-hr:mb-4",
        "prose-img:my-0",
        "prose-li:my-0.5",
        "prose-p:leading-[1.65]",
        "prose-p:my-2",
        "prose-pre:after:content-['']",
        "prose-pre:before:content-['']",
        "prose-pre:bg-white",
        "prose-pre:border",
        "prose-pre:border-neutral-200",
        "prose-pre:font-normal",
        "prose-pre:rounded-md",
        "prose-ul:my-1",
        "prose-ul:pl-4",
        "text-neutral-900",
      )}
    >
      {children}
    </div>
  );
};
