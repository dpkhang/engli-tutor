import { Suspense } from "react";
import { LoginPage } from "@/features/auth/ui/login-page";

export default function LoginRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
