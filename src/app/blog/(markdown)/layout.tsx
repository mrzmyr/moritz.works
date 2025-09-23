import { PageBack } from "@/components/page-back";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageBack />
      <div className="prose dark:prose-invert max-w-none prose-headings:mb-2 text-neutral-900 dark:text-neutral-200 prose-li:my-0.5 prose-ul:pl-4 prose-code:bg-neutral-100/50 prose-code:border prose-code:border-neutral-200 prose-code:text-neutral-900 prose-code:rounded-md prose-code:px-1 prose-code:py-0 prose-code:font-normal prose-code:after:content-[''] prose-code:before:content-[''] prose-a:underline">
        {children}
      </div>
    </>
  );
}
