import { Suspense } from "react";
import { CreateLandingPage } from "@/features/landing-pages/ui/create-landing-page";

export default function NewLandingPagePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Đang tải...</div>}>
      <CreateLandingPage />
    </Suspense>
  );
}
