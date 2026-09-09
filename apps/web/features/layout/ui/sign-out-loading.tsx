"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { PageLoadingOverlay } from "./page-loading-overlay";

type SignOutLoadingContextValue = {
  beginSignOut: () => void;
  endSignOut: () => void;
};

const SignOutLoadingContext = createContext<SignOutLoadingContextValue | null>(null);

export function SignOutLoadingProvider({ children }: { children: ReactNode }) {
  const [signingOut, setSigningOut] = useState(false);
  const beginSignOut = useCallback(() => setSigningOut(true), []);
  const endSignOut = useCallback(() => setSigningOut(false), []);
  const value = useMemo(() => ({ beginSignOut, endSignOut }), [beginSignOut, endSignOut]);

  return (
    <SignOutLoadingContext.Provider value={value}>
      {children}
      <PageLoadingOverlay
        open={signingOut}
        title="Signing out"
        description="Ending your session…"
        label="Signing out"
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
