import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const mdMatch = pathname.match(/^\/blog\/([^/]+)\.md$/);
  if (mdMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/api/markdown/${mdMatch[1]}`;
    return NextResponse.rewrite(url);
  }

  const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const accept = request.headers.get("accept") ?? "";
    if (prefersMarkdown(accept)) {
      const url = request.nextUrl.clone();
      url.pathname = `/api/markdown/${blogMatch[1]}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

function prefersMarkdown(accept: string): boolean {
  const types = accept.split(",").map((part) => {
    const [type, ...params] = part.trim().split(";");
    const qParam = params.find((p) => p.trim().startsWith("q="));
    const q = qParam ? Number.parseFloat(qParam.split("=")[1]) : 1;
    return { type: type.trim().toLowerCase(), q: Number.isNaN(q) ? 1 : q };
  });

  const markdown = types.find((t) => t.type === "text/markdown");
  if (!markdown || markdown.q === 0) return false;

  const html = types.find(
    (t) => t.type === "text/html" || t.type === "application/xhtml+xml",
  );
  if (!html) return true;

  return markdown.q > html.q;
}

export const config = {
  matcher: ["/blog/:path*"],
};
