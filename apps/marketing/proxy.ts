import { NextResponse, type NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE, DEFAULT_LOCALE, type Locale } from "@engli-tutor/i18n";
import { isCustomDomainHost, normalizeHostname } from "./lib/platform-hosts";

type ResolvePayload = { landingPage?: { slug?: string; status?: string } };

function shouldBypass(pathname: string) {
  return pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico" || /\.[a-zA-Z0-9]+$/.test(pathname);
}

function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  const accepted = request.headers.get("accept-language")?.split(",")[0]?.trim().toLowerCase().split("-")[0];
  return isLocale(accepted) ? accepted : DEFAULT_LOCALE;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!shouldBypass(pathname) && pathname === "/") {
    const target = request.nextUrl.clone();
    target.pathname = `/${detectLocale(request)}`;
    return NextResponse.redirect(target);
  }

  const firstSegment = pathname.split("/")[1];
  if (!shouldBypass(pathname) && !isLocale(firstSegment)) {
    const target = request.nextUrl.clone();
    target.pathname = `/${detectLocale(request)}${pathname}`;
    return NextResponse.redirect(target);
  }

  const host = normalizeHostname(request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  if (!isCustomDomainHost(host) || shouldBypass(pathname)) return NextResponse.next();

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || request.nextUrl.origin).replace(/\/$/, "");
  try {
    const response = await fetch(`${apiBase}/api/public/domains/resolve?host=${encodeURIComponent(host)}`, { headers: { Accept: "application/json", "X-Client": "pagecraft-edge" }, cache: "no-store" });
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
