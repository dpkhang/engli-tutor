import { NextResponse, type NextRequest } from "next/server";
import { isCustomDomainHost, normalizeHostname } from "./lib/platform-hosts";

type ResolvePayload = { landingPage?: { slug?: string; status?: string } };

function shouldBypass(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const host = normalizeHostname(request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  if (!isCustomDomainHost(host) || shouldBypass(request.nextUrl.pathname)) return NextResponse.next();

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || request.nextUrl.origin).replace(/\/$/, "");
  try {
    const response = await fetch(
      `${apiBase}/api/public/domains/resolve?host=${encodeURIComponent(host)}`,
      { headers: { Accept: "application/json", "X-Client": "pagecraft-edge" }, cache: "no-store" },
    );
    if (response.ok) {
      const data = (await response.json()) as ResolvePayload;
      const slug = data.landingPage?.slug?.trim().toLowerCase();
      if (slug && data.landingPage?.status === "PUBLISHED") {
        const target = request.nextUrl.clone();
        target.pathname = `/p/${slug}`;
        target.search = "";
        return NextResponse.rewrite(target);
      }
    }
  } catch {
    // The unavailable page below is the stable failure state for edge resolution.
  }

  const unavailable = request.nextUrl.clone();
  unavailable.pathname = "/domain-unavailable";
  unavailable.search = "";
  return NextResponse.rewrite(unavailable);
}

export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
