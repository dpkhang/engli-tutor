import type { CreateLandingPageAdvancedValues } from "./schema";

export type LandingPageLocalMetadata = Pick<
  CreateLandingPageAdvancedValues,
  "description" | "category" | "objective" | "template" | "tags"
>;

const PREFIX = "pagecraft:landing-page-meta:";

/** UI-only metadata until the backend exposes taxonomy/content fields. */
export function saveLandingPageLocalMetadata(
  pageId: string,
  metadata: LandingPageLocalMetadata,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${PREFIX}${pageId}`, JSON.stringify(metadata));
}

export function getLandingPageLocalMetadata(
  pageId: string,
): LandingPageLocalMetadata | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(`${PREFIX}${pageId}`);
  if (!value) return null;
  try {
    return JSON.parse(value) as LandingPageLocalMetadata;
  } catch {
    return null;
  }
}
