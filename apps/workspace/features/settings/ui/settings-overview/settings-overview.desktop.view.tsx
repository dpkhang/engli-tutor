"use client";

import { memo } from "react";
import { Badge, Button, Card, CardContent } from "@engli-tutor/ui";
import { LocalizedLink as Link, useWorkspaceI18n } from "@/features/i18n";
import { getSettingsNavGroups } from "../../model/nav";
import { settingsNavLabelKey } from "../settings-shell/settings-shell.model";
import { OverviewAvatar } from "./settings-overview.avatar";
import type { OverviewPlanState, OverviewProfile } from "./settings-overview.model";

const GROUPS = getSettingsNavGroups();

function Skeleton({ className }: { className: string }) {
  return <span className={`block animate-pulse rounded-lg bg-muted ${className}`} />;
}

/** Desktop (>=1024px): profile + plan cards and grouped shortcut grid. Hidden below `lg` via CSS. */
export const SettingsOverviewDesktopView = memo(function SettingsOverviewDesktopView({
  profile,
  plan,
  formatDate,
}: {
  profile: OverviewProfile;
  plan: OverviewPlanState;
  formatDate: (iso: string) => string;
}) {
  const t = useWorkspaceI18n();
  return (
    <div className="hidden space-y-6 lg:block">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4">
            {profile.loading ? (
              <>
                <Skeleton className="size-14 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </>
            ) : (
              <>
                <OverviewAvatar image={profile.image} initials={profile.initials} className="size-14 text-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {profile.name ?? t("settings.overview.unnamed")}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {profile.error ? t("settings.overview.loadFailed") : profile.email}
                  </p>
                </div>
              </>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href="/settings/account">{t("settings.overview.viewProfile")}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("settings.overview.plan")}
              </p>
              {plan.loading ? (
                <>
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </>
              ) : plan.value ? (
                <>
                  <p className="flex items-center gap-2 font-semibold">
                    <span className="truncate">{plan.value.name}</span>
                    <Badge variant="secondary">{t(plan.value.sourceKey)}</Badge>
                  </p>
                  {plan.value.date ? (
                    <p className="text-sm text-muted-foreground">
                      {t(plan.value.ends ? "settings.overview.endsOn" : "settings.overview.renewsOn", {
                        date: formatDate(plan.value.date),
                      })}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {plan.error ? t("settings.overview.loadFailed") : "—"}
                </p>
              )}
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/settings/billing">{t("settings.overview.managePlan")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {GROUPS.map((group) => (
        <section key={group.id} aria-label={t(group.labelKey)} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t(group.labelKey)}
          </h2>
          <ul className="grid gap-3 xl:grid-cols-2">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{t(settingsNavLabelKey(item))}</span>
                      <span className="block text-sm text-muted-foreground">{t(item.descriptionKey)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
});
