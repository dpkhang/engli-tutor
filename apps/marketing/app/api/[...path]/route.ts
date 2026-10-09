import { NextResponse, type NextRequest } from "next/server";

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
    /^local(\.|$)/.test(hostname)
  );
}

/** Drop browser CORS metadata; keep Origin so Better Auth can match trustedOrigins. */
function stripBrowserFetchMetadata(headers: Headers) {
  headers.delete("sec-fetch-site");
  headers.delete("sec-fetch-mode");
  headers.delete("sec-fetch-dest");
  headers.delete("sec-fetch-user");
}

function adaptLocalHttpRequestCookies(headers: Headers) {
  const cookie = headers.get("cookie");
  if (!cookie) return;
  headers.set(
    "cookie",
    cookie.replace(/(^|;\s*)((?:englitutor|better-auth)\.)/g, "$1__Secure-$2"),
  );
}

function adaptSetCookieForLocal(raw: string, https: boolean): string {
  let adapted = raw
    .replace(/;\s*Domain=[^;]*/gi, "")
    .replace(/;\s*Partitioned=?[^;]*/gi, "");

  if (!https) {
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

  const rawCookies = response.headers.getSetCookie();
  for (const raw of rawCookies) {
    const value = local ? adaptSetCookieForLocal(raw, https) : raw;
    res.headers.append("set-cookie", value);
  }

  return res;
}

export const dynamic = "force-dynamic";

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as OPTIONS };
