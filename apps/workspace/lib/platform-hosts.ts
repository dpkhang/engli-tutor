/** Hosts that serve the EngliTutor workspace / marketing / admin — not customer landings. */

const DEFAULT_PLATFORM_HOSTS = [
  "localhost",
  "127.0.0.1",
  "app.harrybox.cloud",
  "harrybox.cloud",
  "www.harrybox.cloud",
  "admin.harrybox.cloud",
  "domains.harrybox.cloud",
] as const;

function envPlatformHosts(): string[] {
  const raw = process.env.NEXT_PUBLIC_PLATFORM_HOSTS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

/** Parent domain of the API (api.harrybox.cloud → harrybox.cloud); its subdomains are ours, never customer domains. */
function apiParentDomain(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return null;
  try {
    const labels = new URL(raw).hostname.toLowerCase().split(".");
    return labels.length >= 3 ? labels.slice(1).join(".") : labels.join(".");
  } catch {
    return null;
  }
}

export function normalizeHostname(host: string | null | undefined): string {
  if (!host) return "";
  return host.split(":")[0]?.trim().toLowerCase().replace(/\.$/, "") ?? "";
}

/** 10/8, 172.16/12 and 192.168/16 — LAN access to a dev server, never a customer domain. */
export function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
}

export function isPlatformHost(host: string | null | undefined): boolean {
  const hostname = normalizeHostname(host);
  if (!hostname) return true;

  if (hostname.endsWith(".vercel.app") || hostname.endsWith(".localhost")) return true;
  if (isPrivateIpv4(hostname)) return true;

  const parent = apiParentDomain();
  if (parent && (hostname === parent || hostname.endsWith(`.${parent}`))) return true;

  const known = new Set<string>([...DEFAULT_PLATFORM_HOSTS, ...envPlatformHosts()]);
  return known.has(hostname);
}

export function isCustomDomainHost(host: string | null | undefined): boolean {
  return !isPlatformHost(host);
}
