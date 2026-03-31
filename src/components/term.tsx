"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface TermProps {
  children: React.ReactNode;
  definition: string;
  className?: string;
}

function parseDefinition(text: string) {
  const lines = text.split('\n');
  let title = '';
  let description = '';
  const details: { label: string; value: string }[] = [];

  lines.forEach((line) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      title = line.slice(2, -2);
    } else if (line.startsWith('**') && line.includes(':**')) {
      const match = line.match(/\*\*(.+?):\*\*\s*(.+)/);
      if (match) {
        details.push({ label: match[1], value: match[2] });
      }
    } else if (line.trim() && !title) {
      title = line;
    } else if (line.trim() && !line.startsWith('**')) {
      description = line;
    }
  });

  return { title, description, details };
}

export const Term = ({ children, definition, className }: TermProps) => {
  const [open, setOpen] = useState(false);
  const { title, description, details } = parseDefinition(definition);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          className={cn(
            "cursor-help border-b border-dashed border-neutral-400 dark:border-neutral-600",
            className
          )}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        side="top"
        sideOffset={8}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* Header */}
        <div className="px-4 py-3">
          <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
            {title}
          </h4>
          {description && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Divider */}
        {details.length > 0 && (
          <div className="border-t border-neutral-200 dark:border-neutral-800" />
        )}

        {/* Details */}
        {details.length > 0 && (
          <div className="px-4 py-3 space-y-2">
            {details.map((detail, i) => (
              <div key={i} className="text-xs">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {detail.label}:
                </span>{' '}
                <span className="text-neutral-500 dark:text-neutral-400">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
