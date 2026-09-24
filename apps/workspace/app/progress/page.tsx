import { Suspense } from "react";
import { LessonProgressPage } from "@/features/learn";

export default function ProgressRoutePage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-muted-foreground">Loading your lessons…</div>}
    >
      <LessonProgressPage />
    </Suspense>
  );
}
