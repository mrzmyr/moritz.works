import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Figure } from "./figure";

export const GoodBadExamples = ({
  good,
  bad,
  className,
}: {
  good: React.ReactNode;
  bad: React.ReactNode;
  className?: string;
}) => {
  return (
    <Figure>
      <div className={cn("grid grid-cols-2 gap-4", className)}>
        <div className="flex flex-col border border-neutral-200 dark:border-neutral-900 rounded-lg bg-white dark:bg-neutral-900/50">
          <div className="font-medium text-red-700 dark:text-red-400 px-4 py-2 rounded-tl-lg rounded-tr-lg border-b border-neutral-200 dark:border-neutral-900 flex items-center gap-1  ">
            <X className="w-4 h-4" /> <span>Bad</span>
          </div>
          <div className="flex flex-col gap-1 p-4">{bad}</div>
        </div>
        <div className="flex flex-col border border-neutral-200 dark:border-neutral-900 rounded-lg bg-white dark:bg-neutral-900/50">
          <div className="font-medium text-green-700 dark:text-green-400 px-4 py-2 rounded-tl-lg rounded-tr-lg border-b border-neutral-200 dark:border-neutral-900 flex items-center gap-1">
            <Check className="w-4 h-4" /> <span>Good</span>
          </div>
          <div className="flex flex-col gap-1 p-4">{good}</div>
        </div>
      </div>
    </Figure>
  );
};
