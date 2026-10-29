"use client";

import { memo } from "react";
import { LocalizedLink as Link } from "@/features/i18n";
import { ChevronDown, Crown, Gauge, LogOut, Settings, UserRound } from "lucide-react";
import { cn } from "@engli-tutor/ui";
import { AnimatePresence, motion } from "motion/react";
import { useWorkspaceI18n, WorkspaceLanguageSwitcher } from "@/features/i18n";
import type { AppShellChromeProps } from "./app-shell.model";

type AccountMenuProps = Pick<
  AppShellChromeProps,
  | "localize"
  | "hasPaidPlan"
  | "displayName"
  | "initials"
  | "accountOpen"
  | "accountMenuRef"
  | "onToggleAccount"
  | "onSignOut"
> & {
  user: NonNullable<AppShellChromeProps["user"]>;
  /** Mobile: hide name + chevron below `sm`. Desktop: always show. */
  compact?: boolean;
};

export const AccountMenu = memo(function AccountMenu({
  user,
  localize,
  hasPaidPlan,
  displayName,
  initials,
  accountOpen,
  accountMenuRef,
  onToggleAccount,
  onSignOut,
  compact = false,
}: AccountMenuProps) {
  const t = useWorkspaceI18n();
  return (
    <div className="relative" ref={accountMenuRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full px-2 py-1.5 text-left hover:bg-muted"
        aria-haspopup="menu"
        aria-expanded={accountOpen}
        onClick={onToggleAccount}
      >
        <span
          className={cn(
            "relative grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
            hasPaidPlan &&
              "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_18px_-5px_hsl(var(--primary))]",
          )}
        >
          {initials}
          {hasPaidPlan ? (
            <span className="absolute -top-1.5 -left-1.5 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background shadow-sm">
              <Crown className="size-2.5 fill-current" strokeWidth={2} />
            </span>
          ) : null}
        </span>
        <span className={cn("max-w-32 truncate text-sm font-medium", compact && "hidden sm:inline")}>
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition-transform",
            compact && "hidden sm:block",
            accountOpen && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {accountOpen ? (
          <motion.div
            role="menu"
            className="absolute top-full right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-lg"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.16 }}
          >
            <div className="border-b border-border px-3 py-2.5">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="py-1">
              <Link
                href={localize("/settings/account")}
                role="menuitem"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted"
              >
                <UserRound className="size-4 text-muted-foreground" />
                {t("workspace.account")}
              </Link>
              <Link
                href={localize("/payments")}
                role="menuitem"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted"
              >
                <Gauge className="size-4 text-muted-foreground" />
                {t("workspace.plans")}
              </Link>
              <Link
                href={localize("/settings")}
                role="menuitem"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted"
              >
                <Settings className="size-4 text-muted-foreground" />
                {t("workspace.settings")}
              </Link>
            </div>
            <div className="border-t border-border pt-1">
              <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2">
                <span className="text-sm text-muted-foreground">{t("workspace.language")}</span>
                <WorkspaceLanguageSwitcher />
              </div>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={onSignOut}
              >
                <LogOut className="size-4" />
                {t("workspace.signOut")}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
});
