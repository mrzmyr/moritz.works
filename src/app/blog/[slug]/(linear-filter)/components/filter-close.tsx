"use client";

import { XIcon } from "lucide-react";

export const FilterClose = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      type="button"
      className="px-1 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-foreground dark:hover:text-neutral-200"
      onClick={onClick ?? (() => {})}
      aria-label="Remove filter"
    >
      <XIcon className="w-4 h-4" />
    </button>
  );
};
