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

export type WizardDraftServerResponse = {
  id: string;
  updatedAt: string;
  payload: {
    version: 1;
    mode: "ai" | "manual";
    step: 1 | 2 | 3 | 4;
    selectedFrameId: string | null;
    selectedBannerId?: string | null;
    generateHeroImage?: boolean;
    ai: {
      name: string;
      slug: string;
      brief: string;
      audience?: string;
      tone: "professional" | "friendly" | "bold" | "luxury" | "playful";
      language: "vi" | "en";
    };
  };
} | null;

export async function getWizardDraft(): Promise<WizardDraftServerResponse> {
  return workspaceApiClient.get<WizardDraftServerResponse>("/api/landing-pages/wizard-draft", {
    cache: "no-store",
  });
}

export async function putWizardDraft(
  payload: NonNullable<WizardDraftServerResponse>["payload"],
): Promise<NonNullable<WizardDraftServerResponse>> {
  return workspaceApiClient.put<NonNullable<WizardDraftServerResponse>>(
    "/api/landing-pages/wizard-draft",
    { payload },
  );
}

export async function deleteWizardDraft(): Promise<void> {
  return workspaceApiClient.delete("/api/landing-pages/wizard-draft");
}

export async function getWorkspaceIntegrations(): Promise<WorkspaceIntegrations> {
  return workspaceApiClient.get<WorkspaceIntegrations>("/api/meta/integrations", {
    cache: "no-store",
  });
}
