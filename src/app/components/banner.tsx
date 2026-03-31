"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { Book } from "@/lib/get-books";

export const Banner = ({ currentBook }: { currentBook?: Book }) => {
  const [time, setTime] = useState<{ hours: string; minutes: string } | null>(
    null
  );
  const [colonVisible, setColonVisible] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hamburgTime = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Berlin",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);
      const [hours, minutes] = hamburgTime.split(":");
      setTime({ hours, minutes });
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    const colonInterval = setInterval(() => {
      setColonVisible((v) => !v);
    }, 1000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(colonInterval);
    };
  }, []);

  const bookUrl = currentBook
    ? `https://oku.club/book/${currentBook.slug}`
    : undefined;

  return (
    <div className="flex justify-between items-center text-sm text-neutral-400 dark:text-neutral-500 mb-8">
      <div className="flex items-center gap-1">
        {time && (
          <span className="font-mono">
            {time.hours}
            <span className={colonVisible ? "opacity-100" : "opacity-0"}>
              :
            </span>
            {time.minutes}
          </span>
        )}
        <span className="mx-1">·</span>
        <span>Hamburg</span>
      </div>
      {currentBook && bookUrl && (
        <div>
          Currently reading:{" "}
          <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
              <Link
                href={bookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="italic underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                {currentBook.title}
              </Link>
            </HoverCardTrigger>
            <HoverCardContent align="end" className="w-auto p-3">
              <div className="flex gap-3 items-center">
                {currentBook.imageLinks?.thumbnail && (
                  <Image
                    src={currentBook.imageLinks.thumbnail}
                    alt={currentBook.title}
                    width={36}
                    height={54}
                    className="rounded shadow-sm shrink-0"
                  />
                )}
                <div className="flex flex-col gap-0.5">
                  <div className="font-medium text-sm text-foreground">
                    {currentBook.title}
                  </div>
                  {currentBook.authors?.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {currentBook.authors.map((a) => a.name).join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      )}
    </div>
  );
};
