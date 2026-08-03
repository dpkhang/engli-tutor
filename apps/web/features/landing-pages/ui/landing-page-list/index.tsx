"use client";

import { useMemo, useState } from "react";
import { useLandingPages } from "../../hooks/use-landing-pages";
import type { LandingPageStatus } from "../../model/types";
import { LandingPageListView } from "./landing-page-list.view";

export type StatusFilter = "ALL" | LandingPageStatus;

export function LandingPageList() {
  const query = useLandingPages();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");

  const pages = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("vi");
    return (query.data ?? []).filter((page) => {
      const matchesStatus = status === "ALL" || page.status === status;
      const matchesSearch =
        !term ||
        page.name.toLocaleLowerCase("vi").includes(term) ||
        page.slug.toLocaleLowerCase("vi").includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [query.data, search, status]);

  return (
    <LandingPageListView
      pages={pages}
      total={query.data?.length ?? 0}
      search={search}
      status={status}
      isLoading={query.isLoading}
      isError={query.isError}
      errorMessage={query.error?.message ?? null}
      onSearchChange={setSearch}
      onStatusChange={setStatus}
      onClearFilters={() => {
        setSearch("");
        setStatus("ALL");
      }}
      onRetry={() => void query.refetch()}
    />
  );
}
