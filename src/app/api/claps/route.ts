import { kv } from "@vercel/kv";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const claps = (await kv.get<number>(`claps:${slug}`)) ?? 0;

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userClaps = (await kv.get<number>(`claps:${slug}:ip:${ip}`)) ?? 0;

  return NextResponse.json({ claps, userClaps });
}

export async function POST(request: Request) {
  const body = await request.json();
  const slug = body.slug;

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const ipKey = `claps:${slug}:ip:${ip}`;
  const userClaps = (await kv.get<number>(ipKey)) ?? 0;

  if (userClaps >= 50) {
    return NextResponse.json({ error: "Rate limit reached" }, { status: 429 });
  }

  const [claps, newUserClaps] = await Promise.all([
    kv.incr(`claps:${slug}`),
    kv.incr(ipKey),
  ]);

  return NextResponse.json({ claps, userClaps: newUserClaps });
}
