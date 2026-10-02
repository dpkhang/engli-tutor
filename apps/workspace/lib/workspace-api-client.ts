"use client";

import { ApiClient, ApiError } from "@engli-tutor/api-client";
import { getPathLocale, withLocalePath } from "./locale-path";

export class WorkspaceApiClient extends ApiClient {
  constructor() {
    const sameOrigin = process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true";
    super({
      baseURL: sameOrigin ? "" : process.env.NEXT_PUBLIC_API_URL,
      credentials: "include",
      defaultHeaders: { Accept: "application/json", "X-Client": "pagecraft-workspace" },
    });

    this.addErrorInterceptor((error) => {
      if (
        error instanceof ApiError &&
        error.status === 401 &&
        typeof window !== "undefined" &&
        !window.location.pathname.endsWith("/login")
      ) {
        const returnTo = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        const loginPath = withLocalePath("/login", getPathLocale(window.location.pathname));
        window.location.assign(`${loginPath}?returnTo=${returnTo}`);
      }
      return error;
    });
  }
}

export const workspaceApiClient = new WorkspaceApiClient();
