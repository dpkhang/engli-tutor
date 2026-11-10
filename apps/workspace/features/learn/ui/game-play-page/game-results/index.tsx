"use client";

import { memo } from "react";
import { LocalizedLink as Link, useWorkspaceI18n } from "@/features/i18n";
import { RotateCcw } from "lucide-react";
import { Button } from "@engli-tutor/ui";
import { longestStreak, sampleAnswerFor } from "../../../model/games";
import { type LearningGame, type LearningGameRound } from "../../../api/types";
import { HuntResultsSummary } from "../hunt-reveal";
import { type RoundAnswer } from "../types";

export const GameResultsView = memo(function GameResultsView({
  game,
  session,
  scores,
  answers,
  correctCount,
  totalPoints,
  playsBlocked,
  onStart,
  onRetryMissedRounds,
  onUpgrade,
}: {
  game: LearningGame;
  session: LearningGameRound[];
  scores: boolean[];
  answers: Array<RoundAnswer | undefined>;
  correctCount: number;
  totalPoints: number;
  playsBlocked: boolean;
  onStart: () => void;
  onRetryMissedRounds: () => void;
  onUpgrade: () => void;
}) {
  const t = useWorkspaceI18n();
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-primary/20 bg-linear-to-br from-primary to-primary/80 px-6 py-8 text-primary-foreground">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
        {t("workspace.niceWork")}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
        {t("workspace.youGotScore", {
          correct: correctCount,
          total: session.length,
        })}
      </h2>
      <p className="mt-2 max-w-xl text-sm text-primary-foreground/75">
        {t("workspace.gameScoreDescription")}
      </p>
      {game.id === "speed-reply" ? (
        <div className="mt-5 space-y-4">
          <p className="flex flex-wrap gap-2 text-sm font-semibold">
            <span className="rounded-full bg-white/15 px-3 py-1">
              {t("learn.game.points", { count: totalPoints })}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1">
              {t("learn.game.bestStreak", { count: longestStreak(scores) })}
            </span>
          </p>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
              {t("learn.game.reviewAnswers")}
            </p>
            <ul className="space-y-2">
              {session.map((item, i) => {
                const answer = answers[i];
                return (
                  <li
                    key={`${item.id}-${i}`}
                    className="space-y-1 rounded-2xl bg-white/10 px-4 py-3 text-sm"
                  >
                    <p className="flex items-start justify-between gap-3 font-semibold">
                      <span>{item.question.prompt}</span>
                      <span className="shrink-0 text-xs">
                        {answer?.correct ? "✓" : "✗"}{" "}
                        {t("learn.game.points", {
                          count: answer?.points ?? 0,
                        })}
                      </span>
                    </p>
                    <p className="text-primary-foreground/85">
                      <span className="font-medium">{t("learn.game.yourAnswer")} </span>
                      {answer?.value.trim() ? answer.value : t("learn.game.noAnswer")}
                    </p>
                    <p className="text-primary-foreground/70">
                      <span className="font-medium">{t("learn.game.sample")} </span>
                      {sampleAnswerFor(item.question)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
      {game.id === "keyword-hunt" ? (
        <HuntResultsSummary session={session} answers={answers} />
      ) : null}
      <div className="mt-5 flex flex-wrap gap-3">
        {playsBlocked ? (
          <Button
            type="button"
            className="rounded-full border-0 bg-white text-[#0b1524] hover:bg-white/90"
            onClick={onUpgrade}
          >
            {t("workspace.seePlans")}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              className="rounded-full border-0 bg-white text-[#0b1524] hover:bg-white/90"
              onClick={onStart}
            >
              <RotateCcw className="size-4" />
              {t("workspace.playAgain")}
            </Button>
            {game.id === "speed-reply" && scores.some((score) => !score) ? (
              <Button
                type="button"
                className="rounded-full border-0 bg-white/15 text-white hover:bg-white/25"
                onClick={onRetryMissedRounds}
              >
                {t("learn.game.retryMissed", {
                  count: scores.filter((score) => !score).length,
                })}
              </Button>
            ) : null}
          </>
        )}
        <Button asChild className="rounded-full border-0 bg-white/15 text-white hover:bg-white/25">
          <Link href={`/skills/${game.relatedSkill}`}>{t("workspace.relatedSkill")}</Link>
        </Button>
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
