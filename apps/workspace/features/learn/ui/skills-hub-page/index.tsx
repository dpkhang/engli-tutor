"use client";

import { useSkillsCoverage } from "../../hooks/use-learning-catalog";
import { SkillsHubPageView } from "./skills-hub-page.view";

export function SkillsHubPage() {
  const { coverage, loading, source } = useSkillsCoverage();
  return <SkillsHubPageView coverage={coverage} loading={loading} source={source} />;
}
