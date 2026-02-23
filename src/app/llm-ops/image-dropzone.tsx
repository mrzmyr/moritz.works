"use client";

import { Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  value: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
  className?: string;
  readOnly?: boolean;
}

export function ImageDropzone({
  value,
  onUpload,
  onRemove,
  className,
  readOnly = false,
}: ImageDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dragCounter = useRef(0);

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
        throw new Error(err.error ?? "Upload failed");
      }
      const { url } = await res.json();
      onUpload(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  if (value) {
    return (
      <div
        className={cn("relative rounded-[8px] overflow-hidden group", className)}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Attached to node"
          className="w-full h-full object-cover"
        />
        {dragging && (
          <div className="absolute inset-0 bg-blue-50/90 dark:bg-blue-900/50 flex items-center justify-center rounded-b-xl border-2 border-dashed border-blue-400">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-300">
              Drop to replace
            </p>
          </div>
        )}
        {!dragging && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={onRemove}
              className="bg-white dark:bg-neutral-900 rounded p-1.5 shadow text-red-500 hover:text-red-600"
              title="Remove image"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center rounded-b-xl">
            <Loader2 size={18} className="animate-spin text-neutral-500" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[8px] border-2 border-dashed flex flex-col items-center justify-center py-4 gap-1.5 transition-colors cursor-default",
        dragging
          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
          : "border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30 hover:border-neutral-300 dark:hover:border-neutral-600",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {uploading ? (
        <Loader2 size={16} className="animate-spin text-neutral-400" />
      ) : (
        <>
          {dragging ? (
            <UploadCloud size={16} className="text-blue-500" />
          ) : (
            <ImageIcon size={16} className="text-neutral-400" />
          )}
          <p className="text-[10px] text-neutral-400">
            {dragging ? "Drop image here" : "Drag an image to attach"}
          </p>
        </>
      )}
    </div>
  );
}
