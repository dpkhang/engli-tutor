"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { PageLoadingOverlay } from "./page-loading-overlay";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";

type SignOutLoadingContextValue = {
  beginSignOut: () => void;
  endSignOut: () => void;
};

const SignOutLoadingContext = createContext<SignOutLoadingContextValue | null>(null);

export function SignOutLoadingProvider({ children }: { children: ReactNode }) {
  const t = useWorkspaceI18n();
  const [signingOut, setSigningOut] = useState(false);
  const beginSignOut = useCallback(() => setSigningOut(true), []);
  const endSignOut = useCallback(() => setSigningOut(false), []);
  const value = useMemo(() => ({ beginSignOut, endSignOut }), [beginSignOut, endSignOut]);

  return (
    <SignOutLoadingContext.Provider value={value}>
      {children}
      <PageLoadingOverlay
        open={signingOut}
        title={t("workspace.signingOut")}
        description={t("workspace.endingSession")}
        label={t("workspace.signingOut")}
      />
    </SignOutLoadingContext.Provider>
  );
}

export function useSignOutLoading() {
  const context = useContext(SignOutLoadingContext);
  if (!context) {
    throw new Error("useSignOutLoading must be used within SignOutLoadingProvider");
  }
  return context;
}
