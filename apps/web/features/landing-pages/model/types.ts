export type LandingPageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type LandingPage = {
  id: string;
  name: string;
  slug: string;
  status: LandingPageStatus;
  createdAt: string;
  updatedAt: string;
};

export type LandingPageDetail = LandingPage & {
  content: unknown;
};

export type CreateLandingPageInput = {
  name: string;
  slug: string;
};

export type GenerateLandingPageInput = {
  name: string;
  slug: string;
  brief: string;
  audience?: string;
  tone: "professional" | "friendly" | "bold" | "luxury" | "playful";
  language: "vi" | "en";
};

export type UpdateLandingPageInput = {
  name?: string;
  slug?: string;
  status?: LandingPageStatus;
};

export type WorkspaceIntegrations = {
  ai: boolean;
  openai: boolean;
  email: boolean;
  r2: boolean;
  redis: boolean;
  stripe: boolean;
  vnPayments: boolean;
};

export const STATUS_LABEL: Record<LandingPageStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const STATUS_OPTIONS: LandingPageStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
