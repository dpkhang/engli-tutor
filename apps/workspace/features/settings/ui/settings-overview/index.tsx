"use client";

import { useQuery } from "@tanstack/react-query";
import { accountApi } from "@/features/accounts";
import { useBillingMe } from "@/features/payments";
import { useWorkspaceLocale } from "@/features/i18n";
import { queryKeys } from "@/lib/query";
import { SettingsOverviewDesktopView } from "./settings-overview.desktop.view";
import { SettingsOverviewMobileView } from "./settings-overview.mobile.view";
import { profileInitials, resolveOverviewPlan } from "./settings-overview.model";

export function SettingsOverview() {
  const locale = useWorkspaceLocale();
  const account = useQuery({ queryKey: queryKeys.account, queryFn: accountApi.get });
  const billing = useBillingMe();

  const profile = {
    name: account.data?.name,
    email: account.data?.email,
    image: account.data?.image ?? null,
    initials: profileInitials(account.data?.name, account.data?.email),
    loading: account.isPending,
    error: account.isError,
  };
  const plan = {
    value: resolveOverviewPlan(billing.data),
    loading: billing.isPending,
    error: billing.isError,
  };
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso));

  return (
    <>
      <SettingsOverviewMobileView profile={profile} />
      <SettingsOverviewDesktopView profile={profile} plan={plan} formatDate={formatDate} />
    </>
  );
}
