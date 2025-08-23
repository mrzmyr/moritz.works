import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "moritz.works",
  description: "Where I write down little realizations I made on my way.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark:bg-neutral-900 antialiased">
      <body className="bg-neutral-50 dark:bg-neutral-900 antialiased">
        <div className="max-w-2xl mx-auto pt-8 pb-12 px-4">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
