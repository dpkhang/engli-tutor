"use client";

import { memo } from "react";
import { Check, Copy, Gift, LoaderCircle, Share2, TicketPercent, UsersRound } from "lucide-react";
import { Alert, AlertDescription, Button, CardTitle, Input } from "@engli-tutor/ui";
import { SettingsCard, SettingsCardContent, SettingsCardHeader, SettingsPanel } from "../shared";

export type ReferralRedemptionRow = {
  id: string;
  referredName: string;
  referredEmailMasked: string;
  createdAt: string;
};

export type ReferralSettingsViewProps = {
  ready: boolean;
  code: string;
  shareUrl: string;
  referrerDays: number;
  referredDays: number;
  referrerMaxDays: number;
  totalReferred: number;
  proDaysEarned: number;
  redeemedCode: string | null;
  recentRedemptions: ReferralRedemptionRow[];
  manualCode: string;
  pendingRedeem: boolean;
  copied: "code" | "link" | null;
  notice: { tone: "success" | "error"; message: string } | null;
  onManualCodeChange: (value: string) => void;
  onRedeem: () => void;
  onCopyCode: () => void;
  onCopyLink: () => void;
};

export const ReferralSettingsView = memo(function ReferralSettingsView({
  ready,
  code,
  shareUrl,
  referrerDays,
  referredDays,
  referrerMaxDays,
  totalReferred,
  proDaysEarned,
  redeemedCode,
  recentRedemptions,
  manualCode,
  pendingRedeem,
  copied,
  notice,
  onManualCodeChange,
  onRedeem,
  onCopyCode,
  onCopyLink,
}: ReferralSettingsViewProps) {
  return (
    <SettingsPanel ready={ready}>
      <div className="space-y-4">
        <SettingsCard className="overflow-hidden">
          <SettingsCardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="size-5 text-primary" /> Refer friends
            </CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent className="space-y-5">
            <p className="text-sm leading-6 text-muted-foreground">
              Share your invite link with a friend. They get {referredDays} days of Premium after redeeming it
              {referrerDays > 0
                ? `, and you get ${referrerDays} days too (up to ${referrerMaxDays} days in total).`
                : `. You have reached the ${referrerMaxDays}-day referral reward limit.`}
            </p>

            <div className="grid gap-2 sm:grid-cols-3">
              <ReferralStat label="Friends referred" value={totalReferred.toLocaleString("en-US")} />
              <ReferralStat label="Premium days earned" value={`${proDaysEarned} / ${referrerMaxDays}`} />
              <ReferralStat label="Friend bonus" value={`${referredDays} days`} />
            </div>

            <div className="grid gap-3 rounded-3xl border border-border/70 bg-muted/20 p-3.5 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Your code</p>
                <p className="break-all font-mono text-2xl font-semibold tracking-wider text-foreground">{code}</p>
                <p className="truncate text-xs text-muted-foreground">{shareUrl}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Button type="button" variant="outline" className="rounded-full" onClick={onCopyCode}>
                  {copied === "code" ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied === "code" ? "Copied" : "Copy code"}
                </Button>
                <Button type="button" className="rounded-full" onClick={onCopyLink}>
                  {copied === "link" ? <Check className="size-4" /> : <Share2 className="size-4" />}
                  {copied === "link" ? "Copied" : "Copy link"}
                </Button>
              </div>
            </div>
          </SettingsCardContent>
        </SettingsCard>

        <SettingsCard>
          <SettingsCardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketPercent className="size-5 text-primary" /> Redeem an invite code
            </CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent className="space-y-4">
            {redeemedCode ? (
              <Alert>
                <AlertDescription>
                  You already redeemed invite code <span className="font-mono font-semibold">{redeemedCode}</span>.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <p className="text-sm leading-6 text-muted-foreground">
                  Got a code from a friend? Redeem it once to get {referredDays} days of Premium.
                </p>
                <form
                  className="flex flex-col gap-2 sm:flex-row"
                  onSubmit={(event) => {
                    event.preventDefault();
                    onRedeem();
                  }}
                >
                  <Input
                    value={manualCode}
                    onChange={(event) => onManualCodeChange(event.target.value)}
                    placeholder="Enter referral code"
                    className="h-11 rounded-2xl font-mono uppercase"
                    autoComplete="off"
                    disabled={pendingRedeem}
                  />
                  <Button type="submit" disabled={pendingRedeem || !manualCode.trim()} className="h-11 rounded-full">
                    {pendingRedeem ? <LoaderCircle className="size-4 animate-spin" /> : null}
                    Redeem
                  </Button>
                </form>
              </>
            )}

            {notice ? (
              <Alert variant={notice.tone === "error" ? "destructive" : "default"}>
                <AlertDescription>{notice.message}</AlertDescription>
              </Alert>
            ) : null}
          </SettingsCardContent>
        </SettingsCard>

        <SettingsCard>
          <SettingsCardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="size-5 text-primary" /> Recent referrals
            </CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent>
            {recentRedemptions.length ? (
              <ul className="divide-y overflow-hidden rounded-2xl border border-border/70">
                {recentRedemptions.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-3.5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.referredName}</p>
                      <p className="text-xs text-muted-foreground">{item.referredEmailMasked}</p>
                    </div>
                    <p className="shrink-0 text-xs text-muted-foreground">{item.createdAt}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                No referrals yet. Share your link to invite your first friend.
              </div>
            )}
          </SettingsCardContent>
        </SettingsCard>
      </div>
    </SettingsPanel>
  );
});

const ReferralStat = memo(function ReferralStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/25 px-3.5 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tracking-tight">{value}</p>
    </div>
  );
});
