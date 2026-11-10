"use client";

import { memo } from "react";
import { LocalizedLink as Link, useWorkspaceI18n } from "@/features/i18n";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@engli-tutor/ui";
import { type LearningGameRound } from "../../../api/types";

export const FlashResultsView = memo(function FlashResultsView({
  missedRounds,
  correctCount,
  total,
  hasDecks,
  playsBlocked,
  onPracticeMissed,
  onBackToDecks,
  onStart,
  onUpgrade,
}: {
  missedRounds: LearningGameRound[];
  correctCount: number;
  total: number;
  hasDecks: boolean;
  playsBlocked: boolean;
  onPracticeMissed: () => void;
  onBackToDecks: () => void;
  onStart: () => void;
  onUpgrade: () => void;
}) {
  const t = useWorkspaceI18n();
  return (
    <div className="space-y-5 overflow-hidden rounded-[1.75rem] border border-primary/20 bg-linear-to-br from-primary to-primary/80 px-6 py-8 text-primary-foreground">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
          {missedRounds.length ? t("workspace.keepGoing") : t("workspace.allLearned")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {missedRounds.length
            ? t("workspace.youKnowWords", {
                correct: correctCount,
                total: total,
              })
            : t("workspace.allWordsSet")}
        </h2>
        <p className="mt-2 max-w-xl text-sm text-primary-foreground/75">
          {missedRounds.length
            ? t("learn.game.practiceMissedHint", {
                count: missedRounds.length,
              })
            : t("learn.game.pickAnother")}
        </p>
      </div>
      {missedRounds.length ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {missedRounds.map((item) =>
            item.question.kind === "flash" ? (
              <li key={item.id} className="rounded-2xl bg-white/10 px-4 py-2.5">
                <span className="block text-sm font-semibold capitalize">{item.question.word}</span>
                <span className="block text-xs text-primary-foreground/75">
                  {item.question.meaningVi}
                </span>
              </li>
            ) : null,
          )}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {missedRounds.length ? (
          <Button
            type="button"
            className="rounded-full border-0 bg-white text-[#0b1524] hover:bg-white/90"
            onClick={onPracticeMissed}
          >
            <RotateCcw className="size-4" />
            {t("workspace.practiceWordsAgain", {
              count: missedRounds.length,
              plural: missedRounds.length > 1 ? "s" : "",
            })}
          </Button>
        ) : hasDecks ? (
          <Button
            type="button"
            className="rounded-full border-0 bg-white text-[#0b1524] hover:bg-white/90"
            onClick={onBackToDecks}
          >
            <ArrowLeft className="size-4" />
            {t("workspace.allLevelsGame")}
          </Button>
        ) : null}
        {playsBlocked ? (
          <Button
            type="button"
            className="rounded-full border-0 bg-white/15 text-white hover:bg-white/25"
            onClick={onUpgrade}
          >
            {t("workspace.seePlans")}
          </Button>
        ) : (
          <Button
            type="button"
            className="rounded-full border-0 bg-white/15 text-white hover:bg-white/25"
            onClick={onStart}
          >
            {t("workspace.playAgain")}
          </Button>
        )}
        {missedRounds.length && hasDecks ? (
          <Button
            type="button"
            className="rounded-full border-0 bg-white/15 text-white hover:bg-white/25"
            onClick={onBackToDecks}
          >
            <ArrowLeft className="size-4" />
            {t("workspace.allLevelsGame")}
          </Button>
        ) : null}
        <Button
          asChild
          variant="outline"
          className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          <Link href="/games">{t("workspace.moreGames")}</Link>
        </Button>
      </div>
    </div>
  );
});
