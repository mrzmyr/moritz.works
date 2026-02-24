"use client";

import * as LucideIcons from "lucide-react";
import { Loader2, Search, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ICON_NAMES: string[] = (Object.keys(LucideIcons) as string[])
  .filter((k) => {
    if (!/^[A-Z]/.test(k)) return false;
    const val = (LucideIcons as Record<string, { displayName?: string; render?: unknown }>)[k];
    // Only include actual icon components — they always have a displayName set by createLucideIcon
    return !!(val?.displayName);
  })
  .sort();

function DynamicIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = (
    LucideIcons as unknown as Record<
      string,
      React.ComponentType<{ size?: number }>
    >
  )[name];
  if (!Icon) return null;
  return <Icon size={size} />;
}

type Tab = "icons" | "upload";

interface IconPickerProps {
  value: string | null;
  onSelect: (name: string | null) => void;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function IconPicker({ value, onSelect, children, open: openProp, onOpenChange: onOpenChangeProp }: IconPickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChangeProp?.(next);
  };
  const [tab, setTab] = useState<Tab>("icons");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && tab === "icons") {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open, tab]);

  const filtered = useMemo(() => {
    if (!query) return ICON_NAMES.slice(0, 200);
    const q = query.toLowerCase();
    const results: string[] = [];
    for (const name of ICON_NAMES) {
      if (name.toLowerCase().includes(q)) {
        results.push(name);
        if (results.length === 100) break;
      }
    }
    return results;
  }, [query]);

  const handleSelect = (name: string) => {
    onSelect(name);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setOpen(false);
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/agents/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Upload failed");
      }
      const { url } = await res.json();
      onSelect(url);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-72 p-2"
        align="start"
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Tabs + Remove */}
        <div className="flex items-center gap-0.5 mb-2 border-b border-neutral-100 dark:border-neutral-800 pb-1.5">
          {(["icons", "upload"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "px-2.5 py-0.5 text-xs rounded capitalize transition-colors",
                tab === t
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300",
              )}
            >
              {t === "icons" ? "Icons" : "Upload"}
            </button>
          ))}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-auto flex items-center gap-1 px-2 py-0.5 text-xs text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
            >
              <X size={10} />
              Remove
            </button>
          )}
        </div>

        {tab === "icons" && (
          <>
            <div className="flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 mb-2">
              <Search size={12} className="text-neutral-400 shrink-0" />
              <input
                ref={inputRef}
                className="flex-1 text-xs bg-transparent outline-none placeholder:text-neutral-400"
                placeholder="Search icons..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X size={10} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-8 gap-0.5 max-h-52 overflow-y-auto">
              {filtered.map((name) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => handleSelect(name)}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                    value === name &&
                      "bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-300 dark:ring-neutral-600",
                  )}
                >
                  <DynamicIcon name={name} size={14} />
                </button>
              ))}
              {query && filtered.length === 0 && (
                <p className="col-span-8 text-center text-xs text-neutral-400 py-4">
                  No icons found
                </p>
              )}
            </div>
          </>
        )}

        {tab === "upload" && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={cn(
                "w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center py-8 gap-2 transition-colors",
                dragging
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600",
              )}
            >
              {uploading ? (
                <Loader2 size={18} className="animate-spin text-neutral-400" />
              ) : (
                <>
                  <UploadCloud
                    size={18}
                    className={
                      dragging ? "text-blue-500" : "text-neutral-400"
                    }
                  />
                  <p className="text-xs text-neutral-500">
                    {dragging ? "Drop to upload" : "Upload an image"}
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    or ⌘+V to paste
                  </p>
                </>
              )}
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function DynamicLucideIcon({
  name,
  size = 16,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  if (name.startsWith("http") || name.startsWith("/")) {
    return (
      <img
        src={name}
        alt=""
        style={{ width: size, height: size }}
        className={cn("object-contain rounded-sm", className)}
      />
    );
  }
  const Icon = (
    LucideIcons as unknown as Record<
      string,
      React.ComponentType<{ size?: number; className?: string }>
    >
  )[name];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}
