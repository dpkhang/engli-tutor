"use client";

import type { ReactNode } from "react";
import { Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { accountApi } from "@/features/accounts/api";
import { billingApi } from "@/features/payments/api/billing";
import { billingMeQueryKey } from "@/features/payments/hooks/use-billing";
import { SETTINGS_NAV, getSettingsSection, isSettingsNavActive } from "../model/nav";
import { SettingsContentLoading } from "./settings-content-loading";

export function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const section = getSettingsSection(pathname);

  useEffect(() => {
    for (const item of SETTINGS_NAV) {
      router.prefetch(item.href);
    }
    void queryClient.prefetchQuery({ queryKey: ["account"], queryFn: accountApi.get });
    void queryClient.prefetchQuery({ queryKey: billingMeQueryKey, queryFn: billingApi.me });
  }, [queryClient, router]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Personal"
        title="Settings"
        description={section?.description ?? "Manage your EngliTutor workspace."}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:w-56 lg:shrink-0">
          <nav
            aria-label="Settings"
            className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {SETTINGS_NAV.map((item) => {
              const Icon = item.icon;
              const active = isSettingsNavActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <Suspense fallback={<SettingsContentLoading />}>{children}</Suspense>
        </div>
      </div>
    </div>
  );
}
