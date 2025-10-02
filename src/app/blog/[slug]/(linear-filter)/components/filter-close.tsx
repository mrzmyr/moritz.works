"use client";

import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const FilterClose = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-row gap-1.5 items-center px-1.5 py-0.5",
        "bg-white ",
        "dark:bg-neutral-800",
        onClick && "hover:bg-neutral-100 dark:hover:bg-neutral-700",
      )}
      onClick={onClick ?? (() => {})}
      aria-label="Remove filter"
    >
      <XIcon className="w-4 h-4" />
    </button>
  );
};
