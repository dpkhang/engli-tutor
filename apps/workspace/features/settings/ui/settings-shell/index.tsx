"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/features/accounts/api";
import { billingApi } from "@/features/payments/api/billing";
import { billingMeQueryKey } from "@/features/payments/hooks/use-billing";
import { queryKeys } from "@/lib/query";
import { SETTINGS_NAV, getSettingsSection } from "../../model/nav";
import { SettingsShellView } from "./settings-shell.view";

export function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const section = getSettingsSection(pathname);

  useEffect(() => {
    for (const item of SETTINGS_NAV) {
      router.prefetch(item.href);
    }
    void queryClient.prefetchQuery({ queryKey: queryKeys.account, queryFn: accountApi.get });
    void queryClient.prefetchQuery({ queryKey: billingMeQueryKey, queryFn: billingApi.me });
  }, [queryClient, router]);

  return (
    <SettingsShellView pathname={pathname} section={section}>
      {children}
    </SettingsShellView>
  );
}
