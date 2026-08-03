function apiBase() {
  if (process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true") return "";
  return (process.env.NEXT_PUBLIC_API_URL ?? "https://landing-generator-be.onrender.com").replace(/\/$/, "");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    credentials: "include",
    headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type Template = { id: string; name: string; description: string | null; category: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; thumbnailUrl: string | null; createdAt: string; updatedAt: string };
export type MediaAsset = { id: string; name: string; kind: "IMAGE" | "VIDEO" | "DOCUMENT" | "OTHER"; url: string; mimeType: string | null; size: number | null; altText: string | null; folder: string | null; createdAt: string };
export type Lead = { id: string; name: string | null; email: string | null; phone: string | null; status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "ARCHIVED"; source: string | null; landingPage: { id: string; name: string; slug: string } | null; createdAt: string };
export type Domain = { id: string; hostname: string; status: "PENDING" | "VERIFIED" | "FAILED"; sslEnabled: boolean; landingPage: { id: string; name: string; slug: string } | null; createdAt: string };
export type WorkspaceSettings = { id: string; workspaceName: string; logoUrl: string | null; primaryColor: string; notificationEmail: boolean; notificationLeads: boolean; notificationPublish: boolean };

export const workspaceApi = {
  templates: {
    list: () => request<Template[]>("/api/templates"),
    create: (input: { name: string; description?: string; category: string; status?: Template["status"] }) => request<Template>("/api/templates", { method: "POST", body: JSON.stringify(input) }),
    update: (id: string, input: Partial<Pick<Template, "name" | "description" | "category" | "status">>) => request<Template>(`/api/templates/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    delete: (id: string) => request<void>(`/api/templates/${id}`, { method: "DELETE" }),
  },
  media: {
    list: () => request<MediaAsset[]>("/api/media"),
    create: (input: { name: string; url: string; kind?: MediaAsset["kind"]; altText?: string; folder?: string }) => request<MediaAsset>("/api/media", { method: "POST", body: JSON.stringify(input) }),
    delete: (id: string) => request<void>(`/api/media/${id}`, { method: "DELETE" }),
  },
  leads: {
    list: () => request<Lead[]>("/api/leads"),
    create: (input: { name?: string; email?: string; phone?: string; source?: string }) => request<Lead>("/api/leads", { method: "POST", body: JSON.stringify(input) }),
    update: (id: string, input: Partial<Pick<Lead, "name" | "email" | "phone" | "status" | "source">>) => request<Lead>(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    delete: (id: string) => request<void>(`/api/leads/${id}`, { method: "DELETE" }),
  },
  domains: {
    list: () => request<Domain[]>("/api/domains"),
    create: (hostname: string) => request<Domain>("/api/domains", { method: "POST", body: JSON.stringify({ hostname }) }),
    delete: (id: string) => request<void>(`/api/domains/${id}`, { method: "DELETE" }),
  },
  settings: {
    get: () => request<WorkspaceSettings | null>("/api/settings"),
    update: (input: Omit<WorkspaceSettings, "id">) => request<WorkspaceSettings>("/api/settings", { method: "PUT", body: JSON.stringify(input) }),
  },
};
