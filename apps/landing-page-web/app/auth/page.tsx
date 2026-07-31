import { Suspense } from "react";
import { AuthPage } from "@/features/auth";

export default function AuthRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100svh] items-center justify-center text-sm text-muted-foreground">
          Đang tải...
        </div>
      }
    >
      <AuthPage />
    </Suspense>
  );
}
