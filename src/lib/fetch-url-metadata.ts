"use server";

export interface UrlMetadata {
  title: string;
  faviconUrl: string;
}

export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  const parsed = new URL(url);
  const origin = parsed.origin;
  const domain = parsed.hostname;

  let html = "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; bot/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const text = await res.text();
      // Only keep the <head> to avoid processing huge bodies
      const headMatch = text.match(/<head[\s\S]*?<\/head>/i);
      html = headMatch ? headMatch[0] : text.slice(0, 10000);
    }
  } catch {
    // Proceed with empty html; title will fall back to domain
  }

  const title = extractTitle(html) || domain;
  const faviconUrl = extractFavicon(html, origin) ?? googleFavicon(domain);

  return { title, faviconUrl };
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? decodeHtmlEntities(match[1].trim()) : "";
}

function extractFavicon(html: string, origin: string): string | null {
  // Prefer apple-touch-icon, then icon, then shortcut icon
  const patterns = [
    /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]*>/i,
    /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return resolveUrl(match[1], origin);
    }
  }
  return null;
}

function resolveUrl(href: string, origin: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("//")) return `https:${href}`;
  if (href.startsWith("/")) return `${origin}${href}`;
  return `${origin}/${href}`;
}

function googleFavicon(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}
