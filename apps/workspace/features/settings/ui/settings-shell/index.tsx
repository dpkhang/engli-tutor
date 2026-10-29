"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/features/accounts";
import { billingApi } from "@/features/payments";
import { billingMeQueryKey } from "@/features/payments";
import { stripLocalePath } from "@/lib/locale-path";
import { queryKeys } from "@/lib/query";
import { SETTINGS_NAV, getSettingsSection, isSettingsOverview } from "../../model/nav";
import { SettingsShellView } from "./settings-shell.view";

export function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const routePath = stripLocalePath(pathname ?? "");
  const section = getSettingsSection(routePath);

  useEffect(() => {
    router.prefetch("/settings");
    for (const item of SETTINGS_NAV) {
      router.prefetch(item.href);
    }
    void queryClient.prefetchQuery({ queryKey: queryKeys.account, queryFn: accountApi.get });
    void queryClient.prefetchQuery({ queryKey: billingMeQueryKey, queryFn: billingApi.me });
  }, [queryClient, router]);

  return (
    <SettingsShellView
      pathname={routePath}
      isOverview={isSettingsOverview(routePath)}
      section={section}
    >
      {children}
    </SettingsShellView>
  );
}
