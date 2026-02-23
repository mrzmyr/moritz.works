"use client";

import { memo, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const REMARK_PLUGINS = [remarkGfm];

const MARKDOWN_COMPONENTS = {
  a: ({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

const MemoPreview = memo(function MemoPreview({ value }: { value: string }) {
  return (
    <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={MARKDOWN_COMPONENTS}>
      {value}
    </ReactMarkdown>
  );
});

interface MarkdownEditorProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** When flipped to true, enters editing mode and auto-focuses the textarea. */
  forceEdit?: boolean;
  /** Called after forceEdit has been consumed so the parent can reset the flag. */
  onForceEditConsumed?: () => void;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Add a description...",
  className,
  forceEdit,
  onForceEditConsumed,
}: MarkdownEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  // Auto-focus textarea whenever editing becomes true
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  // Enter editing mode when parent signals forceEdit
  useEffect(() => {
    if (!forceEdit) return;
    setEditing(true);
    onForceEditConsumed?.();
    // onForceEditConsumed is intentionally omitted — it's only called once per trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceEdit]);

  const commit = () => {
    setEditing(false);
    if (draft !== (value ?? "")) {
      onChange(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      setDraft(value ?? "");
      setEditing(false);
    }
  };

  // Nothing to show when empty and not actively editing
  if (!value && !editing) return null;

  const textarea = (
    <textarea
      ref={textareaRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => e.stopPropagation()}
      placeholder={placeholder}
      className={cn(
        "nodrag w-full resize-none rounded px-1 py-0.5 text-xs font-mono outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-600 bg-transparent text-neutral-600 dark:text-neutral-300 placeholder:text-neutral-400",
        "border-0",
        className,
      )}
      rows={3}
    />
  );

  // No saved value yet — just show the textarea (hidden via CSS until editing)
  if (!value) {
    return (
      <div className={cn(className, !editing && "hidden")}>{textarea}</div>
    );
  }

  // Has value — show rendered markdown preview; textarea overlays it while editing
  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onDoubleClick={() => setEditing(true)}
        className={cn(
          "w-full text-left cursor-text prose prose-sm max-w-none",
          "leading-tight",
          "text-neutral-500 dark:text-neutral-400",
          "[&_p]:my-0.5 [&_p]:text-neutral-500 dark:[&_p]:text-neutral-400",
          "[&_h1]:text-xs [&_h1]:font-semibold [&_h2]:text-xs [&_h2]:font-semibold [&_h3]:text-xs [&_h3]:font-semibold",
          "[&_strong]:font-medium [&_strong]:text-inherit",
          "[&_a]:text-neutral-600 dark:[&_a]:text-neutral-300 [&_a]:underline",
          "[&_code]:text-xs [&_code]:font-mono [&_code]:bg-neutral-100 dark:[&_code]:bg-neutral-800 [&_code]:px-0.5 [&_code]:rounded",
          "[&_ul]:pl-4 [&_ol]:pl-4 [&_li]:my-0",
          editing && "hidden",
        )}
      >
        <MemoPreview value={value} />
      </button>
      <div className={cn(!editing && "hidden")}>{textarea}</div>
    </div>
  );
}
