"use client";

import { Search, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TOKEN = process.env.NEXT_PUBLIC_LOGOKIT_TOKEN;
const DOMAIN_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

function logoUrl(domain: string) {
  return `https://img.logokit.com/${encodeURIComponent(domain)}?token=${TOKEN}`;
}

type ImgState = "idle" | "loading" | "loaded" | "error";

interface LogokitPickerProps {
  onSelect: (url: string) => void;
}

export function LogokitPicker({ onSelect }: LogokitPickerProps) {
  const [domain, setDomain] = useState("");
  const [previewDomain, setPreviewDomain] = useState<string | null>(null);
  const [imgState, setImgState] = useState<ImgState>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  if (!TOKEN) {
    return (
      <p className="text-xs text-neutral-400 px-0.5">
        Set <code className="text-neutral-600 dark:text-neutral-300">NEXT_PUBLIC_LOGOKIT_TOKEN</code> to enable brand logos.
      </p>
    );
  }

  const normalise = (value: string) =>
    value.trim().replace(/^https?:\/\//, "").replace(/[/?#].*$/, "").toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = normalise(domain);
    if (!d) return;
    if (!DOMAIN_RE.test(d)) {
      setPreviewDomain(d);
      setImgState("error");
      return;
    }
    setPreviewDomain(d);
    setImgState("loading");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
    setPreviewDomain(null);
    setImgState("idle");
  };

  const handleClear = () => {
    setDomain("");
    setPreviewDomain(null);
    setImgState("idle");
    inputRef.current?.focus();
  };

  const errorMessage =
    imgState === "error"
      ? previewDomain && !DOMAIN_RE.test(previewDomain)
        ? `"${previewDomain}" doesn't look like a valid domain`
        : `No logo found for "${previewDomain}"`
      : null;

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex items-center gap-1">
        <div className="flex flex-1 items-center gap-1.5 border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1">
          <Search size={12} className="text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            value={domain}
            onChange={handleChange}
            placeholder="apple.com"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 text-xs bg-transparent outline-none placeholder:text-neutral-400 min-w-0"
          />
          {domain && (
            <button
              type="button"
              onClick={handleClear}
              className="text-neutral-400 hover:text-neutral-600 shrink-0"
            >
              <X size={10} />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!domain.trim()}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0",
            domain.trim()
              ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed",
          )}
        >
          Search
        </button>
      </form>

      {errorMessage && (
        <p className="text-xs text-red-500 dark:text-red-400 px-0.5">{errorMessage}</p>
      )}

      {previewDomain && imgState !== "error" && (
        <div className={cn(
          "flex items-center gap-3 rounded-lg border border-neutral-200 dark:border-neutral-700 p-2.5",
          imgState === "loading" && "opacity-50",
        )}>
          <img
            key={previewDomain}
            src={logoUrl(previewDomain)}
            alt={previewDomain}
            className="w-8 h-8 object-contain rounded-sm shrink-0"
            onLoad={() => setImgState("loaded")}
            onError={() => setImgState("error")}
          />
          <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate flex-1 min-w-0">
            {previewDomain}
          </span>
          {imgState === "loaded" && (
            <button
              type="button"
              onClick={() => onSelect(logoUrl(previewDomain))}
              className="shrink-0 px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
            >
              Use
            </button>
          )}
        </div>
      )}

      {imgState === "idle" && (
        <p className="text-[10px] text-neutral-400 px-0.5">
          Enter a domain to preview its logo
        </p>
      )}
    </div>
  );
}
