import { Suspense } from "react";
import { RouteFallback } from "@/features/layout";
import { LessonProgressPage } from "@/features/learn";

export default function ProgressRoutePage() {
  return (
    <Suspense
      fallback={<RouteFallback messageKey="shell.loadingYourLessons" />}
    >
      <LessonProgressPage />
    </Suspense>
  );
}
