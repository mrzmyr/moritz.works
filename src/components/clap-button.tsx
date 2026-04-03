"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

let heartId = 0;

const LAUGH_EMOJIS = ["😂", "🤣", "💀", "😭", "🫠", "😩", "🤪", "😜", "🥴", "😆"];

type FloatingHeart = {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  scale: number;
  rotation: number;
  duration: number;
  emoji?: string;
};

function getIntensity(userClaps: number): number {
  return Math.pow(userClaps / 50, 2.5);
}

function spawnHearts(
  userClaps: number,
  buttonRect: DOMRect,
): FloatingHeart[] {
  const intensity = getIntensity(userClaps);
  const count = Math.floor(1 + intensity * 40);
  const cx = buttonRect.left + buttonRect.width / 2;
  const cy = buttonRect.top + buttonRect.height / 2;

  return Array.from({ length: count }, () => {
    const id = ++heartId;
    const shootChance = intensity > 0.3 ? intensity : 0;

    if (Math.random() < shootChance) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * (400 + intensity * 800);
      const useEmoji = intensity > 0.5 && Math.random() < (intensity - 0.5) * 2;
      return {
        id,
        startX: cx,
        startY: cy,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: 0.3 + Math.random() * (0.8 + intensity * 2),
        rotation: (Math.random() - 0.5) * 540 * intensity,
        duration: 0.6 + Math.random() * 0.8 + intensity * 0.6,
        emoji: useEmoji
          ? LAUGH_EMOJIS[Math.floor(Math.random() * LAUGH_EMOJIS.length)]
          : undefined,
      };
    }

    return {
      id,
      startX: 0,
      startY: 0,
      x: (Math.random() - 0.5) * (16 + intensity * 80),
      y: -(30 + intensity * 80),
      scale: 0.9,
      rotation: (Math.random() - 0.5) * intensity * 90,
      duration: 0.6 + intensity * 0.3,
    };
  });
}

export function ClapButton({ slug }: { slug: string }) {
  const [claps, setClaps] = useState(0);
  const [userClaps, setUserClaps] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [pageHearts, setPageHearts] = useState<FloatingHeart[]>([]);
  const [glowing, setGlowing] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    fetch(`/api/claps?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        setClaps(data.claps ?? 0);
        setUserClaps(data.userClaps ?? 0);
        if ((data.userClaps ?? 0) >= 50) setDisabled(true);
      })
      .catch(() => {});
  }, [slug]);

  const handleClap = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || userClaps >= 50) return;

      const nextUserClaps = userClaps + 1;
      const intensity = getIntensity(nextUserClaps);

      setClaps((c) => c + 1);
      setUserClaps((c) => {
        const next = c + 1;
        if (next >= 50) setDisabled(true);
        return next;
      });

      setGlowing(true);
      setGlowIntensity(intensity);
      setTimeout(() => setGlowing(false), 600 + intensity * 600);

      if (intensity > 0.4) {
        setShaking(true);
        setTimeout(() => setShaking(false), 300 + intensity * 300);
      }

      const buttonRect = e.currentTarget.getBoundingClientRect();
      const spawned = spawnHearts(nextUserClaps, buttonRect);

      const local = spawned.filter((h) => h.startX === 0);
      const page = spawned.filter((h) => h.startX !== 0);

      if (local.length > 0) {
        setHearts((h) => [...h, ...local]);
        const ids = local.map((h) => h.id);
        setTimeout(() => {
          setHearts((h) => h.filter((heart) => !ids.includes(heart.id)));
        }, 1000 + intensity * 500);
      }

      if (page.length > 0) {
        setPageHearts((h) => [...h, ...page]);
        const ids = page.map((h) => h.id);
        setTimeout(() => {
          setPageHearts((h) => h.filter((heart) => !ids.includes(heart.id)));
        }, 1800 + intensity * 600);
      }

      fetch("/api/claps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
        .then((r) => {
          if (r.status === 429) setDisabled(true);
          return r.json();
        })
        .then((data) => {
          if (data.claps) setClaps(data.claps);
          if (data.userClaps) setUserClaps(data.userClaps);
        })
        .catch(() => {});
    },
    [disabled, userClaps, slug],
  );

  const glowSpread = Math.floor(60 + glowIntensity * 140);
  const glowBlur = Math.floor(90 + glowIntensity * 200);
  const glowOpacity = (0.15 + glowIntensity * 0.65).toFixed(2);

  return (
    <>
      <AnimatePresence>
        {glowing && (
          <motion.div
            initial={{
              opacity: 0,
              boxShadow: `inset 0 0 ${glowBlur * 0.6}px ${glowSpread * 0.4}px rgba(239,68,68,${glowOpacity})`,
            }}
            animate={{
              opacity: 1,
              boxShadow: `inset 0 0 ${glowBlur}px ${glowSpread}px rgba(239,68,68,${glowOpacity})`,
            }}
            exit={{
              opacity: 0,
              boxShadow: `inset 0 0 ${glowBlur * 0.6}px ${glowSpread * 0.4}px rgba(239,68,68,${glowOpacity})`,
            }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              exit: { duration: 2, ease: [0.22, 1, 0.36, 1] },
            }}
            className="pointer-events-none fixed inset-0 z-40"
          />
        )}
      </AnimatePresence>

      {/* Screen shake */}
      {shaking && (
        <style>{`
          @keyframes page-shake {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            10% { transform: translate(-${2 + glowIntensity * 6}px, ${1 + glowIntensity * 3}px) rotate(-${glowIntensity * 0.5}deg); }
            30% { transform: translate(${2 + glowIntensity * 6}px, -${1 + glowIntensity * 3}px) rotate(${glowIntensity * 0.5}deg); }
            50% { transform: translate(-${1 + glowIntensity * 4}px, ${2 + glowIntensity * 4}px) rotate(-${glowIntensity * 0.3}deg); }
            70% { transform: translate(${1 + glowIntensity * 4}px, -${1 + glowIntensity * 2}px) rotate(${glowIntensity * 0.3}deg); }
            90% { transform: translate(-${1 + glowIntensity * 2}px, ${1 + glowIntensity * 2}px) rotate(0deg); }
          }
          body { animation: page-shake ${0.3 + glowIntensity * 0.3}s ease-out; }
        `}</style>
      )}

      {/* Page-level shooting hearts */}
      <AnimatePresence>
        {pageHearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{
              opacity: 1,
              x: 0,
              y: 0,
              scale: 0.9,
              rotate: 0,
            }}
            animate={{
              opacity: [1, 1, 0],
              x: h.x,
              y: h.y,
              scale: [0.9, h.scale, h.scale * 0.3],
              rotate: h.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: h.duration,
              ease: [0.22, 1, 0.36, 1],
              opacity: { times: [0, 0.6, 1] },
            }}
            className="pointer-events-none fixed z-50 text-red-500"
            style={{ left: h.startX, top: h.startY }}
          >
            {h.emoji ? (
              <span style={{ fontSize: 16 + h.scale * 12 }}>{h.emoji}</span>
            ) : (
              <Heart
                className="fill-red-500"
                style={{ width: 16 + h.scale * 12, height: 16 + h.scale * 12 }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <div
        className="fixed top-28 z-50 flex flex-col items-center gap-1"
        style={{ right: "max(1rem, calc(50% - 384px - 5rem))" }}
      >
        <div className="relative">
          <AnimatePresence>
            {hearts.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 1, y: 0, x: h.x * 0.3, scale: 0.9, rotate: 0 }}
                animate={{ opacity: 0, y: h.y, x: h.x, scale: 0.5, rotate: h.rotation }}
                exit={{ opacity: 0 }}
                transition={{ duration: h.duration, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 text-red-500"
              >
                <Heart className="size-4 fill-red-500" />
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={handleClap}
            disabled={disabled}
            className="flex size-12 items-center justify-center rounded-full bg-background transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 duration-200 cursor-pointer"
          >
            <Heart
              className={`size-5 transition-colors duration-200 ${
                userClaps > 0
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              }`}
            />
          </motion.button>
        </div>

        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {claps}
        </span>
        <AnimatePresence>
          {userClaps >= 50 && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.9, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="flex flex-col items-center gap-0.5 whitespace-nowrap"
            >
              <span className="text-[10px] tracking-wide text-muted-foreground/70">
                thank you
              </span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
                className="text-sm"
              >
                🫶
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
