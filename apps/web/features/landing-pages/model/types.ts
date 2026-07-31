export type LandingPageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type LandingPage = {
  id: string;
  name: string;
  slug: string;
  status: LandingPageStatus;
  createdAt: string;
};

export type CreateLandingPageInput = {
  name: string;
  slug: string;
};
