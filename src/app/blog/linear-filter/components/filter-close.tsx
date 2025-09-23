"use client";

import { XIcon } from "lucide-react";

export const FilterClose = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      type="button"
      className="px-1.5 py-1 hover:bg-gray-100 hover:text-foreground"
      onClick={onClick}
      aria-label="Remove filter"
    >
      <XIcon className="w-3 h-3" />
    </button>
  );
};
