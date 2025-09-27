export const PostContentConatiner = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="prose prose-neutral dark:prose-invert dark:prose-p:opacity-95 max-w-none prose-headings:mt-6 prose-headings:mb-2 text-neutral-900 dark:text-neutral-200 prose-li:my-0.5 prose-ul:pl-4 prose-ul:my-1 prose-code:bg-neutral-100/50 prose-code:border prose-code:border-neutral-200 prose-code:text-neutral-900 prose-code:rounded-md prose-code:px-1 prose-code:py-0 prose-code:font-normal prose-code:after:content-[''] prose-code:before:content-[''] prose-a:underline prose-headings:font-semibold prose-pre:bg-white dark:prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-700 prose-pre:rounded-md prose-pre:font-normal prose-pre:after:content-[''] prose-pre:before:content-[''] prose-p:my-2 prose-hr:mb-4 prose-p:leading-[1.65] prose-figure:my-6 prose-blockquote:font-serif prose-blockquote:text-2xl prose-blockquote:py-2 prose-img:my-0">
      {children}
    </div>
  );
};
