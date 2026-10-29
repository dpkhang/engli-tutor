"use client";

import { memo } from "react";
import { ChevronRight } from "lucide-react";
import { LocalizedLink as Link, useWorkspaceI18n } from "@/features/i18n";
import { getSettingsNavGroups } from "../../model/nav";
import { SIDEBAR_PRIVACY, settingsNavLabelKey } from "../settings-shell/settings-shell.model";
import { OverviewAvatar } from "./settings-overview.avatar";
import type { OverviewProfile } from "./settings-overview.model";

const GROUPS = getSettingsNavGroups();
const ROW_CLASS =
  "flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50";

/** Mobile (<1024px): compact profile row, grouped list of sections, legal footer. Hidden from `lg` via CSS. */
export const SettingsOverviewMobileView = memo(function SettingsOverviewMobileView({
  profile,
}: {
  profile: OverviewProfile;
}) {
  const t = useWorkspaceI18n();
  return (
    <div className="space-y-5 lg:hidden">
      <Link
        href="/settings/account"
        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {profile.loading ? (
          <>
            <span className="size-12 shrink-0 animate-pulse rounded-full bg-muted" />
            <span className="h-10 flex-1 animate-pulse rounded-lg bg-muted" />
          </>
        ) : (
          <>
            <OverviewAvatar image={profile.image} initials={profile.initials} className="size-12 text-base" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">
                {profile.error ? t("settings.overview.unnamed") : (profile.name ?? t("settings.overview.unnamed"))}
              </span>
              {profile.email ? (
                <span className="block truncate text-sm text-muted-foreground">{profile.email}</span>
              ) : null}
            </span>
          </>
        )}
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      </Link>

      {GROUPS.map((group) => (
        <section key={group.id} aria-label={t(group.labelKey)} className="space-y-2">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t(group.labelKey)}
          </h2>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link href={item.href} className={ROW_CLASS}>
                    <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{t(settingsNavLabelKey(item))}</span>
                      <span className="block truncate text-xs text-muted-foreground">{t(item.descriptionKey)}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section aria-label={t("settings.overview.legal")} className="space-y-2">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("settings.overview.legal")}
        </h2>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {SIDEBAR_PRIVACY.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link href={item.href} target="_blank" rel="noopener noreferrer" className={ROW_CLASS}>
                  <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1 text-sm font-medium">{t(item.key)}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
});
