import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/config/app";
import { getNodeById } from "../actions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const node = await getNodeById(id);
  if (!node) return {};

  const title = node.title || "Untitled Card";
  const description = node.description ?? undefined;
  const ogImageUrl = `${siteConfig.url}/agent-ops/${id}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/agent-ops/${id}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function NodePage({ params }: Props) {
  const { id } = await params;
  const node = await getNodeById(id);
  if (!node) notFound();

  const title = node.title || "Untitled Card";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-neutral-50 dark:bg-[#090909]">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-border shadow-sm p-5 flex flex-col gap-3">
          {node.title && (
            <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
              {title}
            </h1>
          )}
          {node.description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
              {node.description}
            </p>
          )}
        </div>

        <Link
          href={`/agent-ops?node=${id}`}
          className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors text-center"
        >
          View on canvas →
        </Link>
      </div>
    </main>
  );
}
