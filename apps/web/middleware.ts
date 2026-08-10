import { NextResponse, type NextRequest } from "next/server";
import { isCustomDomainHost, normalizeHostname } from "./lib/platform-hosts";

type ResolvePayload = {
  landingPage?: { slug?: string; status?: string };
};

function requestHost(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-host");
  return normalizeHostname(forwarded ?? request.headers.get("host"));
}

function apiBase(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true") {
    return request.nextUrl.origin;
  }
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return request.nextUrl.origin;
}

function shouldBypass(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

async function resolveSlug(request: NextRequest, host: string): Promise<string | null> {
  const url = `${apiBase(request)}/api/public/domains/resolve?host=${encodeURIComponent(host)}`;
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "X-Client": "pagecraft-edge" },
      // Edge should always see current domain↔page mapping.
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as ResolvePayload;
    const slug = data.landingPage?.slug?.trim().toLowerCase();
    if (!slug || data.landingPage?.status !== "PUBLISHED") return null;
    return slug;
  } catch {
    return null;
  }
}

/**
 * Custom domains (Host ≠ platform) → published landing at /p/{slug}.
 * Workspace hosts are unchanged.
 */
export async function middleware(request: NextRequest) {
  const host = requestHost(request);
  if (!isCustomDomainHost(host)) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (shouldBypass(pathname)) return NextResponse.next();

  // Already on public renderer — keep as-is (useful for debugging).
  if (pathname.startsWith("/p/")) return NextResponse.next();

  const slug = await resolveSlug(request, host);
  if (!slug) {
    const unavailable = request.nextUrl.clone();
    unavailable.pathname = "/domain-unavailable";
    unavailable.search = "";
    return NextResponse.rewrite(unavailable);
  }

  const target = request.nextUrl.clone();
  target.pathname = `/p/${slug}`;
  target.search = "";
  const response = NextResponse.rewrite(target);
  response.headers.set("x-pagecraft-domain-host", host);
  response.headers.set("x-pagecraft-domain-slug", slug);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
