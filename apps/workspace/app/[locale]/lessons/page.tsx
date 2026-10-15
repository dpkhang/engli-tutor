import { Suspense } from "react";
import { RouteFallback } from "@/features/layout";
import { LessonsPage } from "@/features/learn";

export default function LessonsRoutePage() {
  return (
    <Suspense fallback={<RouteFallback messageKey="shell.loadingPath" />}>
      <LessonsPage />
    </Suspense>
  );
}
