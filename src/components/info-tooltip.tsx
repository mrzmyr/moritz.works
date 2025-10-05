"use client";

import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export const InfoTooltip = ({
  children,
  className,
}: React.PropsWithChildren<{
  className?: string;
}>) => {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={open}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn("cursor-pointer", className)}
            onClick={() => setOpen(!open)}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onTouchStart={() => setOpen(!open)}
            onKeyDown={(e) => {
              e.preventDefault();
              e.key === "Enter" && setOpen(!open);
            }}
          >
            <InfoIcon className="w-3.5 h-3.5 hover:text-neutral-600 dark:hover:text-neutral-400 inline-block align-baseline" />
          </button>
        </TooltipTrigger>
        <TooltipContent className={!children ? "hidden" : ""}>
          <span className="inline-block">{children}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
