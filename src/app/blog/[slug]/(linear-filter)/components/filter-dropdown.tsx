"use client";

import { motion, type Variants } from "framer-motion";
import { Check, ListFilter } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AiFilterIcon } from "./icons";
import { TERMS } from "./shared";

// Sonic GIF asset
const SONIC_GIF_URL = "https://i.imgur.com/qgTCkPU.gif";

export function FilterDropdown({
  onSelect = null,
  shouldShake = false,
}: {
  onSelect?: ((value: string) => void) | null;
  shouldShake?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  // Sonic run state: only run once per "no onSelect but user typed"
  const [sonicRunOnce, setSonicRunOnce] = useState(false);
  const [shouldShowSonic, setShouldShowSonic] = useState(false);
  const sonicTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TERMS;
    return TERMS.filter((t) => t.value.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (shouldShake) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShake]);

  const shakeVariants: Variants = {
    shake: {
      x: [-8, 8, -8, 8, 0],
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    static: {
      x: 0,
    },
  };

  return (
    <div className="relative w-full">
      {/* Sonic runner: only show when shouldShowSonic is true */}
      {shouldShowSonic && (
        <motion.img
          src={SONIC_GIF_URL}
          alt="Sonic running"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "40px",
            zIndex: 50,
            pointerEvents: "none",
          }}
          initial={{ left: "-60px" }}
          animate={{ left: "calc(100% + 60px)" }}
          transition={{
            repeat: 0,
            duration: 5,
            ease: "linear",
          }}
        />
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <motion.button
            variants={shakeVariants}
            animate={isShaking ? "shake" : "static"}
            className={cn(
              "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
              "hover:bg-accent hover:text-accent-foreground",
              "px-1.5 h-7 has-[>svg]:px-1.5 font-normal",
              "text-neutral-800 dark:text-white",
              open && "bg-neutral-100 dark:bg-neutral-800",
            )}
            aria-expanded={open}
          >
            <ListFilter className="w-3 h-3" />
            Filter…
          </motion.button>
        </PopoverTrigger>

        <PopoverContent align="start" className="p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Filter…"
              className="h-9"
              onValueChange={(v) => setQuery(v)}
            />
            <CommandList>
              <CommandGroup>
                {filtered.map((t) => (
                  <CommandItem
                    key={t.value}
                    value={t.value}
                    disabled
                    className="opacity-60"
                  >
                    <div className="flex items-center gap-2">
                      {t.icon}
                      {t.value}
                    </div>
                    {/* purely visual checkmark; items are disabled (non-selectable) */}
                    <Check className="ml-auto opacity-0" />
                  </CommandItem>
                ))}

                <CommandItem
                  value="ai_filter"
                  onSelect={() => {
                    onSelect?.(query.trim());
                    if (!onSelect) {
                      setShouldShowSonic(true);
                      setSonicRunOnce(true);
                      if (sonicTimeoutRef.current)
                        clearTimeout(sonicTimeoutRef.current);
                      sonicTimeoutRef.current = setTimeout(() => {
                        setShouldShowSonic(false);
                      }, 5000);
                    }
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    <AiFilterIcon />
                    <span>AI Filter</span>
                    {query.trim() && (
                      <span className="text-muted-foreground">
                        &quot;{query.trim()}&quot;
                      </span>
                    )}
                  </div>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
