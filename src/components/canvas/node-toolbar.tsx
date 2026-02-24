"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  GripVertical,
  Share2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { siteConfig } from "@/config/app";
import type { AgentNodeData } from "./types";

interface NodeToolbarProps {
  id: string;
  data: AgentNodeData;
  draggable?: boolean;
  isLinkCard: boolean;
  toggleCollapse: (id: string) => void;
}

export function NodeToolbar({
  id,
  data,
  draggable,
  isLinkCard,
  toggleCollapse,
}: NodeToolbarProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = () => {
    const permalink = `${siteConfig.url}/agent-ops/${id}`;
    navigator.clipboard.writeText(permalink);
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
      setIsShareOpen(false);
    }, 1500);
  };

  const handleShare = (platform: "x" | "linkedin") => {
    const title = data.title ?? "";
    const permalink = `${siteConfig.url}/agent-ops/${id}`;
    const url =
      platform === "x"
        ? `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(permalink)}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(permalink)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsShareOpen(false);
  };

  return (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      {isLinkCard && data.linkUrl && (
        <a
          href={data.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400 dark:text-neutral-500"
          title="Open link"
        >
          <ExternalLink size={12} />
        </a>
      )}

      {data.hasChildren && (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse(id);
          }}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400 dark:text-neutral-500"
          title={data.collapsed ? "Expand children" : "Collapse children"}
        >
          {data.collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </button>
      )}

      <Popover open={isShareOpen} onOpenChange={setIsShareOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400 dark:text-neutral-500"
            title="Share"
          >
            <Share2 size={12} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-1.5"
          side="bottom"
          align="end"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-full text-left"
            >
              {linkCopied ? (
                <Check className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 shrink-0" />
              )}
              {linkCopied ? "Copied!" : "Copy link"}
            </button>
            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-0.5" />
            <button
              type="button"
              onClick={() => handleShare("x")}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-full text-left"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 fill-current shrink-0"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>
            <button
              type="button"
              onClick={() => handleShare("linkedin")}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-full text-left"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 fill-current shrink-0"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Share on LinkedIn
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {draggable && (
        <GripVertical
          size={14}
          className="text-neutral-400 dark:text-neutral-500 cursor-grab active:cursor-grabbing"
        />
      )}
    </div>
  );
}
