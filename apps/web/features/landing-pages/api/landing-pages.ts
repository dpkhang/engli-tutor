import type {
  CreateLandingPageInput,
  GenerateLandingPageInput,
  LandingPage,
  LandingPageDetail,
  UpdateLandingPageInput,
  WorkspaceIntegrations,
} from "../model/types";
import { workspaceApiClient } from "@/lib/workspace-api-client";

export async function getLandingPages(): Promise<LandingPage[]> {
  return workspaceApiClient.get<LandingPage[]>("/api/landing-pages", { cache: "no-store" });
}

export async function getLandingPage(id: string): Promise<LandingPageDetail> {
  return workspaceApiClient.get<LandingPageDetail>(`/api/landing-pages/${id}`, {
    cache: "no-store",
  });
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPageDetail> {
  return workspaceApiClient.get<LandingPageDetail>(
    `/api/landing-pages/by-slug/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
}

export async function createLandingPage(input: CreateLandingPageInput): Promise<LandingPage> {
  return workspaceApiClient.post<LandingPage>("/api/landing-pages", input);
}

export async function generateLandingPage(
  input: GenerateLandingPageInput,
): Promise<LandingPageDetail> {
  return workspaceApiClient.post<LandingPageDetail>("/api/landing-pages/generate", input);
}

export async function updateLandingPage(
  id: string,
  input: UpdateLandingPageInput,
): Promise<LandingPageDetail> {
  return workspaceApiClient.patch<LandingPageDetail>(`/api/landing-pages/${id}`, input);
}

export async function deleteLandingPage(id: string): Promise<void> {
  return workspaceApiClient.delete(`/api/landing-pages/${id}`);
}

export async function getWorkspaceIntegrations(): Promise<WorkspaceIntegrations> {
  return workspaceApiClient.get<WorkspaceIntegrations>("/api/meta/integrations", {
    cache: "no-store",
  });
}
