import { ApiClient } from "@landing-page-generator/api-client";

export type PublicLandingPage = {
  id: string;
  name: string;
  slug: string;
  status: "PUBLISHED";
  content: unknown;
  updatedAt: string;
};

const publicApi = new ApiClient({
  baseURL:
    process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true"
      ? ""
      : process.env.NEXT_PUBLIC_API_URL,
  credentials: "omit",
  defaultHeaders: { Accept: "application/json", "X-Client": "pagecraft-public" },
});

export function getPublicLandingPage(slug: string) {
  return publicApi.get<PublicLandingPage>(`/api/public/pages/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
}
