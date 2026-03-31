import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => {
  const allItems: BreadcrumbItem[] = [{ label: "moritz.works", href: "/" }, ...items];

  return (
    <nav className="mb-6 text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
      {allItems.map((item, index) => (
        <span key={item.label} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRightIcon className="w-3 h-3 opacity-70" aria-hidden="true" />
          )}
          {item.href ? (
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};
