"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/relay-4Hyx/",
      ui_host: "https://eu.posthog.com",
      defaults: "2025-05-24",
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
