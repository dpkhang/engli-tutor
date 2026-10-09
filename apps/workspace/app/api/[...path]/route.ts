import { NextResponse, type NextRequest } from "next/server";
import { isPrivateIpv4 } from "@/lib/platform-hosts";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const HOP_BY_HOP = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
  "alt-svc",
  "cf-ray",
  "cf-cache-status",
  "server",
  "rndr-id",
  "x-render-origin-server",
]);

function isLocalDevHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^local(\.|$)/.test(hostname) ||
    isPrivateIpv4(hostname)
  );
}

/** The API only trusts localhost dev origins, so present LAN access (e.g. a phone) as localhost. */
function adaptLanOrigin(headers: Headers) {
  for (const name of ["origin", "referer"]) {
    const value = headers.get(name);
    if (!value) continue;
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      continue;
    }
    if (!isPrivateIpv4(url.hostname)) continue;
    url.hostname = "localhost";
    headers.set(name, name === "origin" ? url.origin : url.toString());
  }
}

/** Drop browser CORS metadata; keep Origin so Better Auth can match trustedOrigins. */
function stripBrowserFetchMetadata(headers: Headers) {
  headers.delete("sec-fetch-site");
  headers.delete("sec-fetch-mode");
  headers.delete("sec-fetch-dest");
  headers.delete("sec-fetch-user");
}

/**
 * Production Better Auth names cookies `__Secure-englitutor.*` because APP_URL is https.
 * HTTP localhost cannot store `__Secure-` cookies — strip the prefix when forwarding
 * upstream, and the reverse when returning Set-Cookie to the browser.
 */
function adaptLocalHttpRequestCookies(headers: Headers) {
  const cookie = headers.get("cookie");
  if (!cookie) return;
  headers.set(
    "cookie",
    cookie.replace(/(^|;\s*)((?:englitutor|better-auth)\.)/g, "$1__Secure-$2"),
  );
}

function adaptSetCookieForBrowser(raw: string, hostname: string, https: boolean): string {
  const cookieDomain = raw.match(/;\s*Domain=([^;]*)/i)?.[1]?.trim().replace(/^\./, "");
  const domainMatchesHost = cookieDomain
    ? hostname === cookieDomain || hostname.endsWith(`.${cookieDomain}`)
    : true;

  let adapted = raw.replace(/;\s*Partitioned=?[^;]*/gi, "");

  // Browsers reject Set-Cookie when an upstream shared domain does not contain
  // the frontend proxy host (for example, a Vercel preview deployment).
  if (!domainMatchesHost) adapted = adapted.replace(/;\s*Domain=[^;]*/gi, "");

  if (!https) {
    // HTTP localhost cannot use __Secure- / Secure cookies.
    adapted = adapted
      .replace(/^__Secure-/i, "")
      .replace(/^__Host-/i, "")
      .replace(/;\s*Secure/gi, "")
      .replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
  }

  return adapted;
}

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
  ).replace(/\/$/, "");
  const upstream = new URL(`/api/${path.join("/")}`, apiUrl);
  upstream.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  stripBrowserFetchMetadata(headers);

  const local = isLocalDevHost(request.nextUrl.hostname);
  const https = request.nextUrl.protocol === "https:";
  if (local && !https) adaptLocalHttpRequestCookies(headers);
  if (local) adaptLanOrigin(headers);

  const response = await fetch(upstream, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    redirect: "manual",
    cache: "no-store",
  });

  const hasNoBody =
    request.method === "HEAD" || response.status === 204 || response.status === 205;
  const body = hasNoBody ? null : await response.arrayBuffer();
  const res = new NextResponse(body, {
    status: response.status,
    statusText: response.statusText,
  });

  for (const [key, value] of response.headers) {
    const lower = key.toLowerCase();
    if (lower === "set-cookie" || HOP_BY_HOP.has(lower)) continue;
    res.headers.append(key, value);
  }

  if (process.env.NODE_ENV !== "production") {
    res.headers.set("x-upstream-url", upstream.toString());
    console.info(`[api-proxy] ${request.method} ${upstream.toString()} → ${response.status}`);
  }

  const rawCookies = response.headers.getSetCookie();
  if (rawCookies.length > 0) {
    const names = rawCookies.map((c) => c.split("=")[0] ?? "?").join(", ");
    console.info(`[api-proxy] ${request.method} /api/${path.join("/")} set-cookie: ${names}`);
  }
  for (const raw of rawCookies) {
    const value = adaptSetCookieForBrowser(raw, request.nextUrl.hostname, https);
    res.headers.append("set-cookie", value);
  }

  return res;
}

export const dynamic = "force-dynamic";

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as OPTIONS };
