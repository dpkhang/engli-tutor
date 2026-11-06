"use client";

import { memo } from "react";
import { ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@engli-tutor/ui";
import { LocalizedLink as Link, useWorkspaceI18n } from "@/features/i18n";
import { DataLoadingState } from "@/features/layout";
import { REVIEW_TODAY_HREF } from "../../model/vocab-trainer";

export type ReviewTodayPageViewProps = {
  loading: boolean;
  dueCount: number;
  reviewsUsed: number | null;
  /** null = unlimited plan. */
  reviewsLimit: number | null;
};

export const ReviewTodayPageView = memo(function ReviewTodayPageView({
  loading,
  dueCount,
  reviewsUsed,
  reviewsLimit,
}: ReviewTodayPageViewProps) {
  const t = useWorkspaceI18n();

  if (loading) {
    return <DataLoadingState title={t("learn.review.loading")} description="" cards={2} />;
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-10">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link href="/games">
          <ArrowLeft /> {t("workspace.allGames")}
        </Link>
      </Button>
      <section className="space-y-5 rounded-3xl border border-border/70 bg-card p-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">{t("learn.review.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("learn.review.subtitle")}</p>
        </header>
        {dueCount > 0 ? (
          <>
            <p className="text-lg font-semibold" role="status">
              {t(dueCount === 1 ? "learn.review.dueOne" : "learn.review.dueOther", { count: dueCount })}
            </p>
            <Button asChild className="h-11 rounded-full px-6">
              <Link href={REVIEW_TODAY_HREF}>
                <RotateCcw /> {t("learn.review.start")}
              </Link>
            </Button>
          </>
        ) : (
          <div className="flex gap-3" role="status">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
            <div>
              <p className="font-semibold">{t("learn.review.empty")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("learn.review.emptyHint")}</p>
            </div>
          </div>
        )}
        {reviewsLimit !== null && reviewsUsed !== null ? (
          <p className="text-xs text-muted-foreground">
            {t("learn.review.quota", { used: reviewsUsed, limit: reviewsLimit })}
          </p>
        ) : null}
      </section>
    </div>
  );
});
