/** Hosts that serve the EngliTutor workspace / marketing / admin — not customer landings. */

const DEFAULT_PLATFORM_HOSTS = [
  "localhost",
  "127.0.0.1",
  "app.pagecraft-ai.site",
  "pagecraft-ai.site",
  "www.pagecraft-ai.site",
  "admin.pagecraft-ai.site",
  "domains.pagecraft-ai.site",
] as const;

function envPlatformHosts(): string[] {
  const raw = process.env.NEXT_PUBLIC_PLATFORM_HOSTS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function normalizeHostname(host: string | null | undefined): string {
  if (!host) return "";
  return host.split(":")[0]?.trim().toLowerCase().replace(/\.$/, "") ?? "";
}

export function isPlatformHost(host: string | null | undefined): boolean {
  const hostname = normalizeHostname(host);
  if (!hostname) return true;

  if (hostname.endsWith(".vercel.app") || hostname.endsWith(".localhost")) return true;

  const known = new Set<string>([...DEFAULT_PLATFORM_HOSTS, ...envPlatformHosts()]);
  return known.has(hostname);
}

export function isCustomDomainHost(host: string | null | undefined): boolean {
  return !isPlatformHost(host);
}
