"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { LiveList } from "@liveblocks/client";
import { RoomProvider } from "@/lib/liveblocks";

export function DrawingProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  return (
    <RoomProvider
      id={`canvas:${slug}`}
      initialPresence={{}}
      initialStorage={{ strokes: new LiveList([]) }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </RoomProvider>
  );
}
