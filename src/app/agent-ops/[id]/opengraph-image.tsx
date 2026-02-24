import { ImageResponse } from "next/og";
import { getNodeById } from "../actions";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadInterFont(weight: 400 | 600): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`,
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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const node = await getNodeById(id);

  const title = node?.title || "Untitled Card";
  const description = node?.description ?? null;

  const [regular, semibold] = await Promise.all([
    loadInterFont(400),
    loadInterFont(600),
  ]);

  const fonts: ConstructorParameters<typeof ImageResponse>[1]["fonts"] = [];
  if (regular)
    fonts.push({ name: "Inter", data: regular, style: "normal", weight: 400 });
  if (semibold)
    fonts.push({
      name: "Inter",
      data: semibold,
      style: "normal",
      weight: 600,
    });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          fontFamily: fonts.length ? "Inter" : "sans-serif",
        }}
      >
        {/* Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: "#ffffff",
            borderRadius: 20,
            border: "1px solid #e5e7eb",
            padding: "52px 60px",
            width: 840,
            boxShadow:
              "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <span
            style={{
              fontSize: description ? 44 : 56,
              fontWeight: 600,
              color: "#111827",
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
            }}
          >
            {title}
          </span>

          {description && (
            <span
              style={{
                fontSize: 26,
                fontWeight: 400,
                color: "#6b7280",
                lineHeight: 1.55,
                display: "-webkit-box",
                overflow: "hidden",
              }}
            >
              {description.length > 220
                ? description.slice(0, 220) + "…"
                : description}
            </span>
          )}
        </div>

        {/* Footer branding */}
        <span
          style={{
            position: "absolute",
            bottom: 36,
            right: 48,
            fontSize: 20,
            fontWeight: 400,
            color: "#9ca3af",
            letterSpacing: "0.2px",
          }}
        >
          moritz.works
        </span>
      </div>
    ),
    { ...size, fonts },
  );
}
