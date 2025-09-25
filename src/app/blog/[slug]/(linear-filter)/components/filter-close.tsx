"use client";

import { XIcon } from "lucide-react";

export const FilterClose = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      type="button"
      className="px-1.5 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-foreground dark:hover:text-neutral-200"
      onClick={onClick ?? (() => {})}
      aria-label="Remove filter"
    >
      <XIcon className="w-3 h-3" />
    </button>
  );
};
