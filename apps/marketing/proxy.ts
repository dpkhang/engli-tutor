import { NextResponse, type NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE, DEFAULT_LOCALE, type Locale } from "@engli-tutor/i18n";

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

  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
