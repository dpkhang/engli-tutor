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

export type UpdateLandingPageInput = {
  name?: string;
  slug?: string;
  status?: LandingPageStatus;
};

export const STATUS_LABEL: Record<LandingPageStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const STATUS_OPTIONS: LandingPageStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
