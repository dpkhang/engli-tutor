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
  status: "PENDING" | "VERIFIED" | "FAILED";
  sslEnabled: boolean;
  landingPage: { id: string; name: string; slug: string } | null;
  createdAt: string;
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
    create: (hostname: string) => workspaceApiClient.post<Domain>("/api/domains", { hostname }),
    delete: (id: string) => workspaceApiClient.delete(`/api/domains/${id}`),
  },
  settings: {
    get: () => workspaceApiClient.get<WorkspaceSettings | null>("/api/settings"),
    update: (input: Omit<WorkspaceSettings, "id">) =>
      workspaceApiClient.put<WorkspaceSettings>("/api/settings", input),
  },
};
