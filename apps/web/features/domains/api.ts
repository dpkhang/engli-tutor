import { workspaceApiClient } from "@/lib/workspace-api-client";

export type Domain = {
  id: string;
  hostname: string;
  status: "PENDING" | "REGISTERING" | "DNS_PENDING" | "VERIFIED" | "FAILED";
  sslEnabled: boolean;
  source?: "BROUGHT" | "PURCHASED";
  registrar?: "MANUAL" | "CLOUDFLARE" | "MOCK";
  dnsStatus?: "NONE" | "PENDING" | "ACTIVE" | "FAILED";
  sslStatus?: "NONE" | "PENDING" | "ACTIVE" | "FAILED";
  verification?: string | null;
  expiresAt?: string | null;
  autoRenew?: boolean;
  purchasePriceVnd?: number | null;
  landingPage: { id: string; name: string; slug: string; status?: string } | null;
  createdAt: string;
};

export type DomainSearchResponse = {
  registrar: "mock" | "cloudflare";
  query: string;
  years: number;
  results: Array<{
    hostname: string;
    available: boolean;
    premium: boolean;
    priceVnd: number;
    retailPriceVnd: number;
    currency: "vnd";
    tld: string;
    years: number;
    quoteToken: string;
    quoteExpiresAt: string;
  }>;
};

export type DomainVerificationPayload = {
  domain: Domain;
  instructions: {
    hostname: string;
    kind: "subdomain" | "apex";
    method: "CNAME" | "TXT";
    records: Array<{
      type: "TXT" | "CNAME";
      host: string;
      hostLabel: string;
      value: string;
      purpose: string;
      required: boolean;
    }>;
    expectedTxtValue: string;
    expectedCnameTarget: string | null;
    lookupHosts: string[];
    skipDns: boolean;
    notes: string[];
  } | null;
  message?: string;
};

export type DomainVerifyResult = {
  domain: Domain;
  dns: {
    ok: boolean;
    skipDns: boolean;
    matchedHost: string | null;
    message: string;
    checkedHosts: string[];
    foundValues: string[];
  } | null;
  instructions: DomainVerificationPayload["instructions"];
};

export const domainApi = {
  list: () => workspaceApiClient.get<Domain[]>("/api/domains"),
  search: (q: string, years = 1) =>
    workspaceApiClient.get<DomainSearchResponse>(
      `/api/domains/search?q=${encodeURIComponent(q)}&years=${years}`,
    ),
  create: (input: { hostname: string; landingPageId?: string | null }) =>
    workspaceApiClient.post<Domain>("/api/domains", input),
  update: (id: string, input: { landingPageId?: string | null; autoRenew?: boolean }) =>
    workspaceApiClient.patch<Domain>(`/api/domains/${id}`, input),
  purchase: (input: {
    hostname: string;
    years: number;
    quoteToken: string;
    landingPageId?: string | null;
    autoRenew?: boolean;
  }) =>
    workspaceApiClient.post<{ url: string | null; sessionId: string; domainId: string }>(
      "/api/domains/purchase",
      { ...input, returnOrigin: window.location.origin },
    ),
  verify: (id: string) =>
    workspaceApiClient.post<DomainVerifyResult>(`/api/domains/${id}/verify`, {}),
  getVerification: (id: string) =>
    workspaceApiClient.get<DomainVerificationPayload>(`/api/domains/${id}/verification`),
  confirmCheckout: (sessionId: string) =>
    workspaceApiClient.post("/api/billing/confirm", { sessionId }),
  delete: (id: string) => workspaceApiClient.delete(`/api/domains/${id}`),
};
