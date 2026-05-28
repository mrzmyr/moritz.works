import { ImageResponse } from "next/og";
import { getPostMetadata } from "@/lib/posts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadInterFont(weight: 700): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Inter:ital,wght@1,${weight}`,
      { headers: { "User-Agent": "node.js" } },
    ).then((r) => r.text());
    const [, url] =
      css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/) ?? [];
    if (!url) return null;
    return fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: post } = await getPostMetadata(slug);
  const title = post?.title ?? "moritz.works";

  const bold = await loadInterFont(700);
  const fonts: NonNullable<
    ConstructorParameters<typeof ImageResponse>[1]
  >["fonts"] = [];
  if (bold)
    fonts.push({ name: "Inter", data: bold, style: "italic", weight: 700 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "60px 64px",
          background: "#ffffff",
          fontFamily: fonts.length ? "Inter" : "sans-serif",
          fontStyle: "italic",
          fontWeight: 700,
          color: "#000000",
        }}
      >
        <div
          style={{
            fontSize: 72,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            marginBottom: 24,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 4,
            overflow: "hidden",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 36,
            letterSpacing: "-0.5px",
            color: "#6b7280",
          }}
        >
          moritz.works
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
