"use client";

import { useLandingPages } from "../../hooks/use-landing-pages";
import { LandingPageListView } from "./landing-page-list.view";

export function LandingPageList() {
  const query = useLandingPages();

  return (
    <LandingPageListView
      pages={query.data ?? []}
      isLoading={query.isLoading}
      isError={query.isError}
      errorMessage={query.error?.message ?? null}
      onRetry={() => {
        void query.refetch();
      }}
    />
  );
}
