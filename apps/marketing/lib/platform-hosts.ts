const PLATFORM_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "pagecraft-ai.site",
  "www.pagecraft-ai.site",
]);

export function normalizeHostname(value: string | null): string {
  return value?.split(":")[0]?.trim().toLowerCase().replace(/\.$/, "") ?? "";
}

export function isCustomDomainHost(value: string | null): boolean {
  const hostname = normalizeHostname(value);
  if (!hostname || hostname.endsWith(".vercel.app") || hostname.endsWith(".localhost")) return false;
  const configured = (process.env.NEXT_PUBLIC_PLATFORM_HOSTS || "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  return !PLATFORM_HOSTS.has(hostname) && !configured.includes(hostname);
}
