import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "@engli-tutor/i18n";

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

function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  const accepted = request.headers.get("accept-language")?.split(",")[0]?.trim().toLowerCase().split("-")[0];
  return isLocale(accepted) ? accepted : DEFAULT_LOCALE;
}

function localePath(pathname: string, locale: Locale): string {
  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}

function workspaceReturnTo(request: NextRequest, locale: Locale): URL {
  const dest = request.nextUrl.clone();
  const returnTo = request.nextUrl.searchParams.get("returnTo");
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    const queryAt = returnTo.indexOf("?");
    const path = (queryAt >= 0 ? returnTo.slice(0, queryAt) : returnTo) || "/";
    dest.pathname = isLocale(path.split("/")[1]) ? path : localePath(path, locale);
    dest.search = queryAt >= 0 ? returnTo.slice(queryAt) : "";
    dest.hash = "";
    return dest;
  }
  dest.pathname = `/${locale}`;
  dest.search = "";
  dest.hash = "";
  return dest;
}

async function hasWorkspaceSession(request: NextRequest): Promise<boolean> {
  const cookie = request.headers.get("cookie");
  if (!cookie) return false;
  try {
    const response = await fetch(`${apiBase(request)}/api/auth/get-session`, {
      headers: { accept: "application/json", cookie },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return false;
    const body = (await response.json().catch(() => null)) as {
      session?: { id?: unknown } | null;
      user?: { id?: unknown } | null;
    } | null;
    return typeof body?.session?.id === "string" && typeof body?.user?.id === "string";
  } catch {
    return false;
  }
}

/**
 * Locale prefixing for every page route; signed-in users cannot open /login.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeSegment = pathname.split("/")[1];
  const locale = isLocale(localeSegment) ? localeSegment : detectLocale(request);
  const hasLocalePrefix = isLocale(localeSegment);

  if (shouldBypass(pathname)) return NextResponse.next();

  if (!hasLocalePrefix) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = localePath(pathname, locale);
    const response = NextResponse.redirect(redirect);
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 31_536_000, sameSite: "lax" });
    return response;
  }

  // Absolute returnTo (marketing) is left to the login page, which first
  // hands the session to that host.
  const returnTo = request.nextUrl.searchParams.get("returnTo");
  const relativeReturnTo = !returnTo || (returnTo.startsWith("/") && !returnTo.startsWith("//"));
  if (pathname === `/${locale}/login` && relativeReturnTo && (await hasWorkspaceSession(request))) {
    return NextResponse.redirect(workspaceReturnTo(request, locale));
  }
  const response = NextResponse.next();
  if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 31_536_000, sameSite: "lax" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
