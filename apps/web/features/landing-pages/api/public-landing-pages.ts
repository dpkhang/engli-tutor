import { ApiClient, ApiError } from "@landing-page-generator/api-client";
import type { LandingPageDetail } from "../model/types";

/** Public client — no session redirect on 401/404. */
const publicApiClient = new ApiClient({
  baseURL:
    process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true"
      ? ""
      : process.env.NEXT_PUBLIC_API_URL,
  credentials: "omit",
  defaultHeaders: { Accept: "application/json", "X-Client": "pagecraft-public" },
});

export type PublicLandingPage = Pick<
  LandingPageDetail,
  "id" | "name" | "slug" | "status" | "content" | "updatedAt"
>;

export async function getPublishedLandingPageBySlug(slug: string): Promise<PublicLandingPage> {
  return publicApiClient.get<PublicLandingPage>(
    `/api/public/pages/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
}

export { ApiError };
