"use client";

import { useSoftSectionSnap } from "../../hooks/use-soft-section-snap";
import { MarketingHomeView } from "./marketing-home.view";

export function MarketingHome() {
  useSoftSectionSnap();

  return <MarketingHomeView />;
}
