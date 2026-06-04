"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { ShortcutHint } from "@/components/shortcut-hint";

const DIGIT_KEYS = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
const SEQUENCE_TIMEOUT_MS = 650;
const SCROLL_DURATION_MS = 260;
const SCROLL_DISTANCE_RATIO = 0.45;

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
};

const findHotkeyTarget = (hotkey: string) => {
  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-hotkey]"),
  ).find((element) => element.dataset.hotkey === hotkey);
};

const hasLongerHotkey = (hotkey: string) => {
  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-hotkey]"),
  ).some((element) => {
    const candidate = element.dataset.hotkey;
    return candidate
      ? candidate !== hotkey && candidate.startsWith(hotkey)
      : false;
  });
};

const openTarget = (element: HTMLElement) => {
  const anchor =
    element instanceof HTMLAnchorElement ? element : element.closest("a");

  if (!anchor) {
    element.click();
    return;
  }

  if (anchor.target === "_blank") {
    window.open(anchor.href, "_blank", "noopener,noreferrer");
    return;
  }

  anchor.click();
};

const triggerHotkey = (hotkey: string) => {
  const target = findHotkeyTarget(hotkey);

  if (target) {
    openTarget(target);
  }
};

const scrollByEased = (distance: number) => {
  const startY = window.scrollY;
  const startTime = performance.now();

  const step = (now: number) => {
    const elapsed = Math.min((now - startTime) / SCROLL_DURATION_MS, 1);
    const eased = 1 - (1 - elapsed) ** 3;

    window.scrollTo(0, startY + distance * eased);

    if (elapsed < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

export const KeyboardShortcuts = () => {
  const pendingSequenceRef = useRef<{ digits: string; prefix: string } | null>(
    null,
  );
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const clearPending = () => {
      pendingSequenceRef.current = null;

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const setPending = (prefix: string, digits = "") => {
      clearPending();
      pendingSequenceRef.current = { digits, prefix };

      timeoutRef.current = window.setTimeout(() => {
        if (digits) {
          triggerHotkey(`${prefix} ${digits}`);
        } else if (prefix === "g") {
          triggerHotkey("g");
        }

        clearPending();
      }, SEQUENCE_TIMEOUT_MS);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isTypingTarget(event.target)
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const pendingSequence = pendingSequenceRef.current;

      if (pendingSequence && DIGIT_KEYS.has(key)) {
        event.preventDefault();
        const digits = `${pendingSequence.digits}${key}`;
        const hotkey = `${pendingSequence.prefix} ${digits}`;

        if (findHotkeyTarget(hotkey) && !hasLongerHotkey(hotkey)) {
          triggerHotkey(hotkey);
          clearPending();
          return;
        }

        if (findHotkeyTarget(hotkey) || hasLongerHotkey(hotkey)) {
          setPending(pendingSequence.prefix, digits);
          return;
        }

        clearPending();
        return;
      }

      clearPending();

      if (key === "j" || key === "k") {
        event.preventDefault();
        scrollByEased(
          window.innerHeight * SCROLL_DISTANCE_RATIO * (key === "j" ? 1 : -1),
        );
        return;
      }

      if (key === "g" || key === "p") {
        event.preventDefault();
        setPending(key);
        return;
      }

      if (["b", "c", "e", "h", "i", "l", "r", "x"].includes(key)) {
        event.preventDefault();
        triggerHotkey(key);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      clearPending();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="fixed right-4 bottom-4 z-50 flex gap-1.5 rounded-md border border-neutral-200 bg-white/85 p-1.5 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/85">
      <div className="flex items-center gap-1">
        <ShortcutHint keys="j" />
        <ArrowDown className="size-3 text-neutral-500 dark:text-neutral-400" />
      </div>
      <div className="flex items-center gap-1">
        <ShortcutHint keys="k" />
        <ArrowUp className="size-3 text-neutral-500 dark:text-neutral-400" />
      </div>
    </div>
  );
};
