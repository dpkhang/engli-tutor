"use client";

import { resetAccountAppearance } from "@/features/settings/model/preferences";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { useActionDialog } from "@engli-tutor/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useBillingMe } from "@/features/payments/hooks/use-billing";
import { hasPremiumAccess, planBadgeLabel } from "@/features/payments/model/plans";
import { usePendingReferral } from "@/features/referrals";
import { useSignOutLoading } from "../shared";
import { TranslateSessionProvider, useTranslateSession, isLessonTranslatePath } from "@/features/translate";
import { LessonSearch } from "../lesson-search";
import { AppShellView } from "./app-shell.view";

function isAiDockHiddenPath(pathname: string) {
  return (
    pathname.startsWith("/settings") ||
    pathname.startsWith("/policy") ||
    pathname.startsWith("/payments") ||
    pathname === "/accounts"
  );
}

function isBareShellPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/onboarding" ||
    pathname === "/welcome" ||
    pathname === "/speaking" ||
    pathname.startsWith("/demo/") ||
    pathname === "/domain-unavailable" ||
    pathname === "/payments/result"
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TranslateSessionProvider>
      <AppShellFrame>{children}</AppShellFrame>
    </TranslateSessionProvider>
  );
}

function TranslateRouteReset() {
  const pathname = usePathname();
  const { setOpen } = useTranslateSession();
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);
  return null;
}

function AppShellFrame({ children }: { children: ReactNode }) {
  const dialog = useActionDialog();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { beginSignOut, endSignOut } = useSignOutLoading();
  const { open: translateOpen } = useTranslateSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  const [aiLauncherExpanded, setAiLauncherExpanded] = useState(true);
  const [clipAiTools, setClipAiTools] = useState(false);
  const aiDockActionRef = useRef<"idle" | "open-tools" | "show-pill">("idle");
  const aiToolsInnerRef = useRef<HTMLDivElement>(null);
  const [aiToolsHeight, setAiToolsHeight] = useState(0);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { data } = useSession();
  const user = data?.user;
  const billing = useBillingMe(Boolean(user));
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Account";
  const initials = displayName.slice(0, 1).toUpperCase();
  const isPracticeExercise = /^\/skills\/[^/]+\/[^/]+/.test(pathname);
  const showTranslate = isLessonTranslatePath(pathname);
  const showAiDock = !isAiDockHiddenPath(pathname);
  const search = useMemo(() => <LessonSearch />, []);
  usePendingReferral(Boolean(user));

  useEffect(() => {
    setAccountOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (showAiDock) return;
    aiDockActionRef.current = "idle";
    setAiToolsOpen(false);
    setAiLauncherExpanded(true);
    setClipAiTools(false);
  }, [showAiDock]);

  useEffect(() => {
    if (!accountOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!accountMenuRef.current?.contains(target)) setAccountOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  useLayoutEffect(() => {
    const node = aiToolsInnerRef.current;
    if (!node) return;
    setAiToolsHeight(node.scrollHeight);
  }, [aiToolsOpen, pathname]);

  useEffect(() => {
    if (aiDockActionRef.current !== "open-tools") return;
    if (aiLauncherExpanded || aiToolsOpen) return;

    const timer = window.setTimeout(() => {
      aiDockActionRef.current = "idle";
      setAiToolsOpen(true);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [aiLauncherExpanded, aiToolsOpen]);

  useEffect(() => {
    if (aiDockActionRef.current !== "show-pill") return;
    if (aiToolsOpen || aiLauncherExpanded) return;

    const timer = window.setTimeout(() => {
      aiDockActionRef.current = "idle";
      setAiLauncherExpanded(true);
    }, 320);

    return () => window.clearTimeout(timer);
  }, [aiToolsOpen, aiLauncherExpanded]);

  const onToggleMobile = useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  const onCloseMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const onToggleAccount = useCallback(() => {
    setAccountOpen((open) => !open);
  }, []);

  const onSignOut = useCallback(async () => {
    const accepted = await dialog.confirm({
      title: "Sign out?",
      description: "You’ll need to sign in again to keep learning with EngliTutor.",
      confirmLabel: "Sign out",
      tone: "danger",
    });
    if (!accepted) return;
    setAccountOpen(false);
    beginSignOut();
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      resetAccountAppearance();
      queryClient.clear();
      window.location.assign("/login");
    } catch {
      endSignOut();
    }
  }, [beginSignOut, dialog, endSignOut, queryClient]);

  const onToggleAiDock = useCallback(() => {
    if (aiToolsOpen) {
      aiDockActionRef.current = "show-pill";
      setClipAiTools(true);
      setAiToolsOpen(false);
      return;
    }
    aiDockActionRef.current = "open-tools";
    setAiLauncherExpanded(false);
  }, [aiToolsOpen]);

  const onAiToolsAnimationComplete = useCallback(() => {
    if (aiToolsOpen) {
      setClipAiTools(false);
      return;
    }
    if (aiDockActionRef.current !== "show-pill") return;
    aiDockActionRef.current = "idle";
    setAiLauncherExpanded(true);
  }, [aiToolsOpen]);

  if (isBareShellPath(pathname)) {
    return <div className="min-h-svh bg-background">{children}</div>;
  }

  return (
    <AppShellView
      pathname={pathname}
      search={search}
      routeReset={<TranslateRouteReset />}
      mobileOpen={mobileOpen}
      accountOpen={accountOpen}
      aiToolsOpen={aiToolsOpen}
      aiLauncherExpanded={aiLauncherExpanded}
      clipAiTools={clipAiTools}
      aiToolsHeight={aiToolsHeight}
      user={user}
      planLoading={billing.isLoading}
      planLabel={planBadgeLabel(billing.data)}
      hasPaidPlan={hasPremiumAccess(billing.data)}
      displayName={displayName}
      initials={initials}
      isPracticeExercise={isPracticeExercise}
      showTranslate={showTranslate}
      showAiDock={showAiDock}
      translateOpen={translateOpen}
      accountMenuRef={accountMenuRef}
      aiToolsInnerRef={aiToolsInnerRef}
      onToggleMobile={onToggleMobile}
      onCloseMobile={onCloseMobile}
      onToggleAccount={onToggleAccount}
      onSignOut={onSignOut}
      onToggleAiDock={onToggleAiDock}
      onAiToolsAnimationComplete={onAiToolsAnimationComplete}
    >
      {children}
    </AppShellView>
  );
}
