"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { Heart } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShortcutHint } from "@/components/shortcut-hint";

const MAX_CLAPS = 50;
const FLUSH_DELAY_MS = 600;
const BURST_RESET_MS = 900;

const HEART_COLORS = ["#ef4444", "#f43f5e", "#ec4899", "#fb7185"];
const SPARKLE_EMOJIS = ["✨", "💖", "💘", "💝"];

const RING_SIZE = 56;
const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

let particleId = 0;

type Particle = {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  duration: number;
  delay: number;
  color: string;
  emoji?: string;
};

function getIntensity(userClaps: number): number {
  return (userClaps / MAX_CLAPS) ** 2;
}

function spawnParticles(userClaps: number): Particle[] {
  const intensity = getIntensity(userClaps);
  const count = 3 + Math.floor(intensity * 25);
  // Spread widens with intensity: gentle upward fan → full 360° burst.
  const spread = Math.PI * (0.5 + intensity * 1.5);

  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
    const distance = 50 + Math.random() * (60 + intensity * 400);
    const useEmoji = intensity > 0.5 && Math.random() < (intensity - 0.5) * 1.5;

    return {
      id: ++particleId,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      scale: 0.6 + Math.random() * 0.6 + intensity * 0.8,
      rotation: (Math.random() - 0.5) * (60 + intensity * 360),
      duration: 0.7 + Math.random() * 0.5 + intensity * 0.4,
      delay: i * 0.012,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      emoji: useEmoji
        ? SPARKLE_EMOJIS[Math.floor(Math.random() * SPARKLE_EMOJIS.length)]
        : undefined,
    };
  });
}

function RollingCount({ value }: { value: number }) {
  return (
    <div className="relative flex h-4 min-w-6 items-center justify-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="block text-xs font-medium tabular-nums text-muted-foreground"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function ClapButton({
  slug,
  initialClaps = 0,
  initialUserClaps = 0,
}: {
  slug: string;
  initialClaps?: number;
  initialUserClaps?: number;
}) {
  const [claps, setClaps] = useState(initialClaps);
  const [userClaps, setUserClaps] = useState(initialUserClaps);
  const [disabled, setDisabled] = useState(initialUserClaps >= MAX_CLAPS);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [burst, setBurst] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [glowing, setGlowing] = useState(false);
  const [shaking, setShaking] = useState(false);

  const reduceMotion = useReducedMotion();
  const heartControls = useAnimationControls();

  const pendingRef = useRef(0);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    const count = pendingRef.current;
    if (count <= 0) return;
    pendingRef.current = 0;

    fetch("/api/claps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, count }),
    })
      .then((r) => {
        if (r.status === 429) setDisabled(true);
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => {
        if (typeof data.claps === "number") setClaps(data.claps);
        if (typeof data.userClaps === "number") {
          setUserClaps(data.userClaps);
          if (data.userClaps >= MAX_CLAPS) setDisabled(true);
        }
      })
      .catch(() => {
        setClaps((c) => Math.max(0, c - count));
        setUserClaps((c) => {
          const reverted = Math.max(0, c - count);
          if (reverted < MAX_CLAPS) setDisabled(false);
          return reverted;
        });
      });
  }, [slug]);

  useEffect(() => {
    const flushWithBeacon = () => {
      const count = pendingRef.current;
      if (count <= 0) return;
      pendingRef.current = 0;
      navigator.sendBeacon(
        "/api/claps",
        new Blob([JSON.stringify({ slug, count })], {
          type: "application/json",
        }),
      );
    };
    window.addEventListener("pagehide", flushWithBeacon);
    return () => window.removeEventListener("pagehide", flushWithBeacon);
  }, [slug]);

  const handleClap = useCallback(() => {
    if (disabled || userClaps >= MAX_CLAPS) return;

    const nextUserClaps = userClaps + 1;
    const intensity = getIntensity(nextUserClaps);

    setClaps((c) => c + 1);
    setUserClaps(nextUserClaps);
    if (nextUserClaps >= MAX_CLAPS) setDisabled(true);

    pendingRef.current += 1;
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(flush, FLUSH_DELAY_MS);

    setBurst((b) => b + 1);
    if (burstTimer.current) clearTimeout(burstTimer.current);
    burstTimer.current = setTimeout(() => setBurst(0), BURST_RESET_MS);

    heartControls.start({
      scale: [1, 1.35, 0.9, 1],
      rotate: [0, -12, 8, 0],
      transition: { duration: 0.45, ease: EASE_OUT },
    });

    if (reduceMotion) return;

    const spawned = spawnParticles(nextUserClaps);
    setParticles((p) => [...p.slice(-120), ...spawned]);
    const ids = spawned.map((p) => p.id);
    setTimeout(
      () => {
        setParticles((p) => p.filter((particle) => !ids.includes(particle.id)));
      },
      1800 + intensity * 600,
    );

    if (intensity > 0.15) {
      setGlowing(true);
      setGlowIntensity(intensity);
      setTimeout(() => setGlowing(false), 500 + intensity * 500);
    }

    if (intensity > 0.45) {
      setShaking(true);
      setTimeout(() => setShaking(false), 300 + intensity * 300);
    }
  }, [disabled, userClaps, flush, heartControls, reduceMotion]);

  const progress = Math.min(userClaps / MAX_CLAPS, 1);
  const done = userClaps >= MAX_CLAPS;

  const glowSpread = Math.floor(50 + glowIntensity * 120);
  const glowBlur = Math.floor(80 + glowIntensity * 180);
  const glowOpacity = (0.1 + glowIntensity * 0.5).toFixed(2);

  return (
    <>
      <AnimatePresence>
        {glowing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            style={{
              boxShadow: `inset 0 0 ${glowBlur}px ${glowSpread}px rgba(239,68,68,${glowOpacity})`,
            }}
            className="pointer-events-none fixed inset-0 z-40"
          />
        )}
      </AnimatePresence>

      {shaking && (
        <style>{`
          @keyframes page-shake {
            0%, 100% { transform: translate(0, 0); }
            20% { transform: translate(-${1 + glowIntensity * 4}px, ${1 + glowIntensity * 2}px); }
            40% { transform: translate(${1 + glowIntensity * 4}px, -${1 + glowIntensity * 2}px); }
            60% { transform: translate(-${1 + glowIntensity * 3}px, ${1 + glowIntensity * 2}px); }
            80% { transform: translate(${1 + glowIntensity * 2}px, -${1 + glowIntensity}px); }
          }
          body { animation: page-shake ${0.3 + glowIntensity * 0.3}s ease-out; }
        `}</style>
      )}

      <div className="fixed bottom-6 right-4 z-50 flex flex-col items-center gap-1 rounded-full bg-neutral-50 px-2 py-1.5 shadow-nice lg:bottom-auto lg:top-28 lg:right-[max(1rem,calc(50%-336px-5rem))] lg:shadow-none dark:bg-[#090909]">
        <div className="relative">
          {/* Particle burst, anchored to the button center */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
              animate={{
                x: p.x,
                y: p.y,
                scale: [0, p.scale, p.scale * 0.4],
                rotate: p.rotation,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: EASE_OUT,
                opacity: { times: [0, 0.65, 1] },
              }}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              {p.emoji ? (
                <span style={{ fontSize: 14 }}>{p.emoji}</span>
              ) : (
                <Heart
                  className="size-3.5"
                  style={{ color: p.color, fill: p.color }}
                />
              )}
            </motion.div>
          ))}

          {/* Accumulating "+n" chip for rapid taps */}
          <AnimatePresence>
            {burst > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white"
              >
                +{burst}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress ring toward the 50-clap cap */}
          <svg
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="pointer-events-none absolute -inset-1 size-14 -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={2.5}
              className="stroke-border/60"
            />
            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              initial={false}
              animate={{
                strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress),
              }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
              className="stroke-red-500"
            />
          </svg>

          <motion.button
            type="button"
            aria-label={done ? "Thanks for the love" : "Like this post"}
            data-hotkey="c"
            onClick={handleClap}
            disabled={disabled}
            whileTap={disabled ? undefined : { scale: 0.85 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-background hover:bg-accent disabled:cursor-not-allowed"
          >
            <motion.div animate={heartControls}>
              <Heart
                className={`size-5 transition-colors duration-200 ${
                  userClaps > 0
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                }`}
              />
            </motion.div>
          </motion.button>
        </div>

        <RollingCount value={claps} />
        <ShortcutHint keys="c" />

        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.9, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: EASE_OUT, delay: 0.3 }}
              className="flex flex-col items-center gap-0.5 whitespace-nowrap pb-1"
            >
              <span className="text-[10px] tracking-wide text-muted-foreground/70">
                thank you
              </span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.8 }}
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
