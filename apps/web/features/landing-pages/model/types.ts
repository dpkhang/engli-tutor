export type LandingPageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type LandingPage = {
  id: string;
  name: string;
  slug: string;
  status: LandingPageStatus;
  createdAt: string;
  updatedAt: string;
  hasContent?: boolean;
  heroImageUrl?: string | null;
};

export type LandingPageDetail = LandingPage & {
  content: unknown;
  creditUsage?: {
    total: number;
    copy: number;
    structure: number;
    image: number;
    minimum: number;
    maximum: number;
    imageSurcharge: number;
    metrics: { sections: number; items: number; characters: number };
  };
};

export type CreateLandingPageInput = {
  name: string;
  slug: string;
};

export type GenerateLandingPageLayoutHint = {
  preset: "bold-split" | "editorial-stack" | "minimal-center" | "soft-cards";
  density?: "compact" | "comfortable" | "airy";
  radius?: "sharp" | "soft" | "pill";
  sectionVariantPlan?: Record<string, string>;
};

export type GenerateLandingPageInput = {
  name: string;
  slug: string;
  brief: string;
  audience?: string;
  tone: "professional" | "friendly" | "bold" | "luxury" | "playful";
  language: "vi" | "en";
  heroImageAssetId?: string;
  generateHeroImage?: boolean;
  layoutPreset?: GenerateLandingPageLayoutHint["preset"];
  layout?: GenerateLandingPageLayoutHint;
};

export type UpdateLandingPageInput = {
  name?: string;
  slug?: string;
  status?: LandingPageStatus;
  content?: import("./generated-content").GeneratedLandingContent;
};

export type WorkspaceIntegrations = {
  ai: boolean;
  openai: boolean;
  /** OpenAI Images API + R2 public upload ready for hero banners. */
  imageGeneration?: boolean;
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
