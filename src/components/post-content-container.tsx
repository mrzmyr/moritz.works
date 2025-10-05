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

        "prose-blockquote:p-0",
        "prose-blockquote:my-12",
        "prose-blockquote:text-2xl",
        "prose-blockquote:border-0",
        "prose-blockquote:font-serif",
        "prose-blockquote:not-italic",
        "prose-blockquote:font-normal",
        "prose-blockquote:before:content-['']",
        "prose-blockquote:before:-mt-2",
        "prose-blockquote:after:content-['']",
        "prose-blockquote:[&>p]:m-0",
        "prose-blockquote:[&>p]:font-normal",
        "[&_cite]:not-italic",
        "[&_cite]:text-[13px]",
        "[&_cite]:font-sans",
        "[&_cite>a]:text-neutral-500",
        "[&_cite>a]:dark:text-neutral-400",
        "[&_cite>a]:no-underline",

        "prose-code:after:content-['']",
        "prose-code:before:content-['']",
        "prose-code:bg-muted",
        "prose-code:border",
        "prose-code:border-ring/30",
        "prose-code:font-normal",
        "prose-code:px-1",
        "prose-code:py-0",
        "prose-code:rounded-md",

        "prose-figure:my-8",

        "prose-headings:font-semibold",
        "prose-headings:mb-6",
        "prose-headings:mt-12",
        "prose-h1:text-2xl",
        "prose-h2:text-xl",
        "prose-h3:text-lg",
        "prose-h4:text-base",
        "prose-h5:text-base",
        "prose-h6:text-base",

        "prose-hr:mb-4",

        "prose-img:my-0",

        "prose-li:my-0.5",

        "prose-p:leading-[1.65]",
        "prose-p:my-2",

        "prose-pre:after:content-['']",
        "prose-pre:before:content-['']",
        "prose-pre:bg-white",
        "prose-pre:border",
        "prose-pre:border-border",
        "prose-pre:font-normal",
        "prose-pre:rounded-md",
        "prose-ul:my-4",
        "prose-ul:pl-4",
        "text-primary",
        "prose-strong:font-semibold",
      )}
    >
      {children}
    </div>
  );
};
