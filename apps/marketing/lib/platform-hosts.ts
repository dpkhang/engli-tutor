const PLATFORM_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "pagecraft-ai.site",
  "www.pagecraft-ai.site",
]);

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

export function normalizeHostname(value: string | null): string {
  return value?.split(":")[0]?.trim().toLowerCase().replace(/\.$/, "") ?? "";
}

export function isCustomDomainHost(value: string | null): boolean {
  const hostname = normalizeHostname(value);
  if (!hostname || hostname.endsWith(".vercel.app") || hostname.endsWith(".localhost")) return false;
  const parent = apiParentDomain();
  if (parent && (hostname === parent || hostname.endsWith(`.${parent}`))) return false;
  const configured = (process.env.NEXT_PUBLIC_PLATFORM_HOSTS || "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  return !PLATFORM_HOSTS.has(hostname) && !configured.includes(hostname);
}
