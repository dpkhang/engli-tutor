"use client";

import { memo, useId } from "react";
import {
  Check,
  Copy,
  Gift,
  LoaderCircle,
  Share2,
  TicketPercent,
  UsersRound,
} from "lucide-react";
import { Alert, AlertDescription, Button, Input, Label } from "@engli-tutor/ui";
import {
  SettingsCard,
  SettingsCardContent,
  SettingsErrorState,
  SettingsPanel,
  SettingsSection,
} from "../shared";
import { useWorkspaceI18n, useWorkspaceLocale } from "@/features/i18n";
import type { ReferralRewardStatus } from "../../model/referrals";

export type ReferralRedemptionRow = {
  id: string;
  referredName: string;
  referredEmailMasked: string;
  createdAt: string;
};

export type ReferralSettingsViewProps = {
  ready: boolean;
  error: boolean;
  code: string;
  shareUrl: string;
  referredDays: number;
  rewardStatus: ReferralRewardStatus;
  totalReferred: number;
  proDaysEarned: number;
  redeemedCode: string | null;
  recentRedemptions: ReferralRedemptionRow[];
  manualCode: string;
  pendingRedeem: boolean;
  copied: "code" | "link" | null;
  notice: { tone: "success" | "error"; message: string } | null;
  onRetry: () => void;
  onManualCodeChange: (value: string) => void;
  onRedeem: () => void;
  onCopyCode: () => void;
  onCopyLink: () => void;
};

export const ReferralSettingsView = memo(function ReferralSettingsView({
  ready,
  error,
  code,
  shareUrl,
  referredDays,
  rewardStatus,
  totalReferred,
  proDaysEarned,
  redeemedCode,
  recentRedemptions,
  manualCode,
  pendingRedeem,
  copied,
  notice,
  onRetry,
  onManualCodeChange,
  onRedeem,
  onCopyCode,
  onCopyLink,
}: ReferralSettingsViewProps) {
  const t = useWorkspaceI18n();
  const locale = useWorkspaceLocale();
  const codeInputId = useId();
  const nf = new Intl.NumberFormat(locale);
  const maxDays = rewardStatus.maxDays;

  if (error) {
    return (
      <SettingsPanel ready={ready}>
        <SettingsErrorState
          message={t("settings.referral.loadFailed")}
          retryLabel={t("settings.referral.retry")}
          onRetry={onRetry}
        />
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel ready={ready}>
      <div className="space-y-4">
        <SettingsCard>
          <SettingsCardContent className="pt-4">
            <SettingsSection
              icon={<Gift className="size-5 text-primary" aria-hidden />}
              title={t("workspace.referFriends")}
              description={`${t("workspace.shareInvite")} ${t("settings.referral.inviteDescription", { days: nf.format(referredDays) })}`}
            >
              <div className="grid gap-2 sm:grid-cols-3">
                <ReferralStat
                  label={t("workspace.friendsReferred")}
                  value={nf.format(totalReferred)}
                />
                <ReferralStat
                  label={t("workspace.premiumDaysEarned")}
                  value={`${nf.format(proDaysEarned)} / ${nf.format(maxDays)}`}
                />
                <ReferralStat
                  label={t("workspace.friendBonus")}
                  value={t("settings.referral.daysValue", {
                    days: nf.format(referredDays),
                  })}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                {rewardStatus.kind === "earning"
                  ? t("settings.referral.rewardEarning", {
                      days: nf.format(rewardStatus.days),
                      max: nf.format(maxDays),
                    })
                  : t("settings.referral.rewardLimit", {
                      max: nf.format(maxDays),
                    })}
              </p>

              <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-3.5">
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {t("workspace.yourCode")}
                  </p>
                  <p className="break-all font-mono text-2xl font-semibold tracking-wider text-foreground">
                    {code}
                  </p>
                  <p className="break-all text-xs text-muted-foreground">
                    <span className="sr-only">
                      {t("settings.referral.shareUrlLabel")}:{" "}
                    </span>
                    {shareUrl}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full rounded-full sm:w-auto"
                    onClick={onCopyCode}
                    disabled={!code}
                  >
                    {copied === "code" ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    {copied === "code"
                      ? t("workspace.copied")
                      : t("workspace.copyCode")}
                  </Button>
                  <Button
                    type="button"
                    className="h-11 w-full rounded-full sm:w-auto"
                    onClick={onCopyLink}
                    disabled={!shareUrl}
                  >
                    {copied === "link" ? (
                      <Check className="size-4" />
                    ) : (
                      <Share2 className="size-4" />
                    )}
                    {copied === "link"
                      ? t("workspace.copied")
                      : t("workspace.copyLink")}
                  </Button>
                </div>
                <p role="status" aria-live="polite" className="sr-only">
                  {copied ? t("workspace.copied") : ""}
                </p>
              </div>
            </SettingsSection>
          </SettingsCardContent>
        </SettingsCard>

        <SettingsCard>
          <SettingsCardContent className="pt-4">
            <SettingsSection
              icon={
                <TicketPercent className="size-5 text-primary" aria-hidden />
              }
              title={t("workspace.redeemInvite")}
              description={
                redeemedCode
                  ? undefined
                  : t("workspace.redeemInviteDescription", {
                      days: nf.format(referredDays),
                    })
              }
            >
              {redeemedCode ? (
                <Alert>
                  <AlertDescription>
                    {t("settings.referral.alreadyRedeemed", {
                      code: redeemedCode,
                    })}
                  </AlertDescription>
                </Alert>
              ) : (
                <form
                  className="flex flex-col gap-2 sm:flex-row sm:items-end"
                  onSubmit={(event) => {
                    event.preventDefault();
                    onRedeem();
                  }}
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Label htmlFor={codeInputId}>
                      {t("settings.referral.codeLabel")}
                    </Label>
                    <Input
                      id={codeInputId}
                      value={manualCode}
                      onChange={(event) =>
                        onManualCodeChange(event.target.value)
                      }
                      placeholder={t("workspace.enterReferralCode")}
                      className="h-11 rounded-2xl font-mono uppercase"
                      autoComplete="off"
                      disabled={pendingRedeem}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={pendingRedeem || !manualCode.trim()}
                    className="h-11 w-full rounded-full sm:w-auto"
                  >
                    {pendingRedeem ? (
                      <LoaderCircle
                        className="size-4 animate-spin"
                        aria-hidden
                      />
                    ) : null}
                    {t("settings.referral.redeemButton")}
                  </Button>
                </form>
              )}
            </SettingsSection>
          </SettingsCardContent>
        </SettingsCard>

        {notice ? (
          <Alert
            variant={notice.tone === "error" ? "destructive" : "default"}
            role={notice.tone === "error" ? "alert" : "status"}
          >
            <AlertDescription>{notice.message}</AlertDescription>
          </Alert>
        ) : null}

        <SettingsCard>
          <SettingsCardContent className="pt-4">
            <SettingsSection
              icon={<UsersRound className="size-5 text-primary" aria-hidden />}
              title={t("workspace.recentReferrals")}
              description={t("settings.referral.recentDescription")}
            >
              {recentRedemptions.length ? (
                <ul className="divide-y overflow-hidden rounded-2xl border border-border/70">
                  {recentRedemptions.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-3.5 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {item.referredName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.referredEmailMasked}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-muted-foreground">
                        {item.createdAt}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                  {t("workspace.noReferrals")}
                </div>
              )}
            </SettingsSection>
          </SettingsCardContent>
        </SettingsCard>
      </div>
    </SettingsPanel>
  );
});

const ReferralStat = memo(function ReferralStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/25 px-3.5 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tracking-tight">{value}</p>
    </div>
  );
});
