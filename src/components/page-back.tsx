import Link from "next/link";

export const PageBack = () => {
  return (
    <div className="mb-6">
      <Link
        href="/blog"
        className="text-sm text-neutral-600 dark:text-neutral-400 hover:underline flex items-center"
      >
        ← Back
      </Link>
    </div>
  );
};
