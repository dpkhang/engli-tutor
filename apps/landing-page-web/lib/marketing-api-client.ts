"use client";

import { ApiClient } from "@landing-page-generator/api-client";

export class MarketingApiClient extends ApiClient {
  constructor() {
    super({
      baseURL:
        process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true"
          ? ""
          : process.env.NEXT_PUBLIC_API_URL,
      credentials: "include",
      defaultHeaders: { Accept: "application/json", "X-Client": "pagecraft-marketing" },
    });
  }
}

export const marketingApiClient = new MarketingApiClient();
