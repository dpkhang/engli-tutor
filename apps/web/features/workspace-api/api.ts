import { workspaceApiClient } from "@/lib/workspace-api-client";

export type Template = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
export type MediaAsset = {
  id: string;
  name: string;
  kind: "IMAGE" | "VIDEO" | "DOCUMENT" | "OTHER";
  url: string;
  mimeType: string | null;
  size: number | null;
  altText: string | null;
  folder: string | null;
  createdAt: string;
};
export type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "ARCHIVED";
  source: string | null;
  landingPage: { id: string; name: string; slug: string } | null;
  createdAt: string;
};
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

export type DomainSearchResult = {
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
};

export type DomainSearchResponse = {
  registrar: "mock" | "cloudflare";
  query: string;
  years: number;
  results: DomainSearchResult[];
};
export type WorkspaceSettings = {
  id: string;
  workspaceName: string;
  logoUrl: string | null;
  primaryColor: string;
  notificationEmail: boolean;
  notificationLeads: boolean;
  notificationPublish: boolean;
};

export const workspaceApi = {
  templates: {
    list: () => workspaceApiClient.get<Template[]>("/api/templates"),
    create: (input: {
      name: string;
      description?: string;
      category: string;
      status?: Template["status"];
    }) => workspaceApiClient.post<Template>("/api/templates", input),
    update: (
      id: string,
      input: Partial<Pick<Template, "name" | "description" | "category" | "status">>,
    ) => workspaceApiClient.patch<Template>(`/api/templates/${id}`, input),
    delete: (id: string) => workspaceApiClient.delete(`/api/templates/${id}`),
  },
  media: {
    list: () => workspaceApiClient.get<MediaAsset[]>("/api/media"),
    create: (input: {
      name: string;
      url: string;
      kind?: MediaAsset["kind"];
      altText?: string;
      folder?: string;
    }) => workspaceApiClient.post<MediaAsset>("/api/media", input),
    delete: (id: string) => workspaceApiClient.delete(`/api/media/${id}`),
  },
  leads: {
    list: () => workspaceApiClient.get<Lead[]>("/api/leads"),
    create: (input: {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      source?: string | null;
      landingPageId?: string | null;
    }) => workspaceApiClient.post<Lead>("/api/leads", input),
    update: (
      id: string,
      input: Partial<Pick<Lead, "name" | "email" | "phone" | "status" | "source">>,
    ) => workspaceApiClient.patch<Lead>(`/api/leads/${id}`, input),
    delete: (id: string) => workspaceApiClient.delete(`/api/leads/${id}`),
  },
  domains: {
    list: () => workspaceApiClient.get<Domain[]>("/api/domains"),
    search: (q: string, years = 1) =>
      workspaceApiClient.get<DomainSearchResponse>(
        `/api/domains/search?q=${encodeURIComponent(q)}&years=${years}`,
      ),
    create: (input: { hostname: string; landingPageId?: string | null }) =>
      workspaceApiClient.post<Domain>("/api/domains", input),
    update: (
      id: string,
      input: { landingPageId?: string | null; autoRenew?: boolean; hostname?: string },
    ) => workspaceApiClient.patch<Domain>(`/api/domains/${id}`, input),
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
    verify: (id: string) => workspaceApiClient.post<Domain>(`/api/domains/${id}/verify`, {}),
    confirmCheckout: (sessionId: string) =>
      workspaceApiClient.post("/api/billing/confirm", { sessionId }),
    delete: (id: string) => workspaceApiClient.delete(`/api/domains/${id}`),
  },
  settings: {
    get: () => workspaceApiClient.get<WorkspaceSettings | null>("/api/settings"),
    update: (input: Omit<WorkspaceSettings, "id">) =>
      workspaceApiClient.put<WorkspaceSettings>("/api/settings", input),
  },
};
