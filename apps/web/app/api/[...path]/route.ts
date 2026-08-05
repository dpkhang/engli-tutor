import type { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function adaptLocalRequestCookies(headers: Headers) {
  const cookie = headers.get("cookie");
  if (!cookie) return;
  headers.set(
    "cookie",
    cookie.replace(/(^|;\s*)((?:pagecraft|better-auth)\.)/g, "$1__Secure-$2"),
  );
}

function adaptLocalResponseCookies(headers: Headers) {
  const cookies = headers.getSetCookie();
  if (cookies.length === 0) return;

  headers.delete("set-cookie");
  for (const cookie of cookies) {
    headers.append(
      "set-cookie",
      cookie
        .replace(/^__Secure-/, "")
        .replace(/;\s*Domain=[^;]+/gi, "")
        .replace(/;\s*Secure/gi, "")
        .replace(/;\s*SameSite=None/gi, "; SameSite=Lax"),
    );
  }
}

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL ?? "https://landing-generator-be.onrender.com"
  ).replace(/\/$/, "");
  const upstream = new URL(`/api/${path.join("/")}`, apiUrl);
  upstream.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const isLocalhost =
    request.nextUrl.hostname === "localhost" || request.nextUrl.hostname === "127.0.0.1";
  if (isLocalhost) adaptLocalRequestCookies(headers);

  const response = await fetch(upstream, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers(response.headers);
  if (isLocalhost) adaptLocalResponseCookies(responseHeaders);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const dynamic = "force-dynamic";

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as OPTIONS };
