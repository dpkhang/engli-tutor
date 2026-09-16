"use client";

import { memo } from "react";
import { PageLoadingOverlay } from "../shared";

export type GlobalNavigationLoadingViewProps = {
  open: boolean;
};

export const GlobalNavigationLoadingView = memo(function GlobalNavigationLoadingView({
  open,
}: GlobalNavigationLoadingViewProps) {
  return <PageLoadingOverlay open={open} />;
});
