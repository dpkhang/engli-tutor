"use client";

import { HuntRound } from "../hunt-round";
import { useWorkspaceI18n } from "@/features/i18n";
import { Check, Volume2 } from "lucide-react";
import { Button, cn } from "@engli-tutor/ui";
import { ClickableTranslateText } from "@/features/translate";
import { sampleAnswerFor } from "../../../model/games";
import { type LearningGameRound } from "../../../api/types";
import { HuntReveal } from "../hunt-reveal";
import { explanationOf } from "../game-play-page.model";
import { TimerRing, PicturePrompt } from "../round-shared";
import { ChoiceRound } from "../choice-round";
import { OpenRound } from "../open-round";
import { OrderRound } from "../order-round";
import { MatchRound } from "../match-round";
import { SpellRound } from "../spell-round";
import { FlashRound } from "../flash-round";
import type { RoundPlayState } from "./use-round-play";

export function RoundPlayView({
  round,
  gameId,
  canGoBack,
  enter,
  saved,
  s,
  onBack,
}: {
  round: LearningGameRound;
  gameId: string;
  canGoBack: boolean;
  enter: "next" | "back";
  saved: boolean;
  s: RoundPlayState;
  onBack: () => void;
}) {
  const t = useWorkspaceI18n();
  const question = round.question;

  return (
    <article
      className={cn(
        "space-y-5",
        question.kind === "flash"
          ? "bg-transparent"
          : "rounded-3xl border border-border/70 bg-card p-5 sm:p-6",
      )}
    >
      {question.kind === "flash" ? null : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {round.level} · {gameId.replaceAll("-", " ")}
          </p>
          {s.timed ? (
            s.waitsForAudio && !s.audioStarted ? (
              <span className="text-xs text-muted-foreground">{t("learn.game.timerWaits")}</span>
            ) : (
              <div className="flex items-center gap-2">
                {s.micPaused ? (
                  <span className="text-xs text-muted-foreground">
                    {t("learn.game.timerPaused")}
                  </span>
                ) : null}
                <TimerRing seconds={s.seconds} total={s.totalSeconds} />
              </div>
            )
          ) : null}
        </div>
      )}
      {question.kind === "flash" ? null : (
        <h3 className="text-lg font-semibold tracking-tight">{question.prompt}</h3>
      )}

      {question.kind !== "flash" && (round.material?.imageUrl || round.material?.imageEmoji) ? (
        <PicturePrompt imageUrl={round.material.imageUrl} imageEmoji={round.material.imageEmoji} />
      ) : question.kind !== "flash" && question.kind !== "hunt" && round.material ? (
        <div className="space-y-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
          {round.material.speakable ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={!s.canHear && s.hears >= s.hearMax}
                onClick={s.onHear}
              >
                <Volume2 className="size-4" />
                {s.hears === 0
                  ? t("workspace.listen")
                  : t("learn.game.hearAgain", {
                      count: Math.max(0, s.hearMax - s.hears),
                    })}
              </Button>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
              <ClickableTranslateText text={round.material.body} />
            </pre>
          )}
        </div>
      ) : null}

      {question.kind === "choice" || question.kind === "fix" ? (
        <ChoiceRound
          question={question}
          value={s.value}
          locked={s.locked}
          onChange={s.onChangeText}
        />
      ) : null}
      {question.kind === "open" ? (
        <OpenRound
          value={s.value}
          locked={s.locked}
          allowMic={gameId === "speed-reply"}
          onRecordingChange={s.handleRecordingChange}
          placeholder={t("workspace.typeAnswerEnglish")}
          onChange={s.onChangeText}
        />
      ) : null}
      {question.kind === "order" ? (
        <OrderRound
          items={s.shuffledOrder}
          value={s.orderValue}
          locked={s.locked}
          onChange={s.onChangeJson}
        />
      ) : null}
      {question.kind === "match" ? (
        <MatchRound
          pairs={question.pairs}
          rights={s.shuffledRights}
          mapping={s.matchMapping}
          locked={s.locked}
          onChange={s.onChangeJson}
        />
      ) : null}
      {question.kind === "hunt" ? (
        <HuntRound
          question={question}
          options={s.shuffledHunt}
          selected={s.huntPicked}
          locked={s.locked}
          speakable={Boolean(round.material?.speakable)}
          fallbackText={round.material?.body}
          hearsLeft={Math.max(0, s.hearMax - s.hears)}
          canHear={s.canHear}
          onHear={s.onHear}
          onChange={s.onChangeJson}
        />
      ) : null}
      {question.kind === "spell" ? (
        <SpellRound
          letters={question.letters}
          answer={question.answer}
          value={s.value}
          locked={s.locked}
          onChange={s.onChangeText}
        />
      ) : null}
      {question.kind === "flash" ? (
        <FlashRound
          question={question}
          imageUrl={round.material?.imageUrl}
          saved={saved}
          locked={s.locked}
          canGoBack={canGoBack}
          enter={enter}
          onSpeak={s.onSpeakFlash}
          onSave={s.onSave}
          onBack={onBack}
          onRate={s.onRate}
        />
      ) : null}

      {s.locked && question.kind === "hunt" ? (
        <HuntReveal
          question={question}
          picked={s.huntPicked}
          transcript={question.transcript ?? round.material?.body}
          correct={s.correct}
          onSpeak={s.onSpeakWord}
        />
      ) : s.locked && question.kind !== "flash" ? (
        <div className="space-y-2 rounded-xl border border-accent/25 bg-accent/8 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Check className="size-4 text-accent" />
            {s.correct ? t("learn.game.onTrack") : t("learn.game.checkHint")}
          </p>
          {s.evaluation ? (
            <div className="space-y-1.5 text-sm">
              {s.evaluation.matched.length ? (
                <p className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("learn.game.covered")}
                  </span>
                  {s.evaluation.matched.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                    >
                      {item}
                    </span>
                  ))}
                </p>
              ) : null}
              {s.evaluation.missing.length ? (
                <p className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("learn.game.missingParts")}
                  </span>
                  {s.evaluation.missing.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-400/15 dark:text-rose-300"
                    >
                      {item}
                    </span>
                  ))}
                </p>
              ) : null}
              {s.evaluation.overLimit && round.maxWords ? (
                <p className="text-xs font-medium text-rose-600 dark:text-rose-300">
                  {t("learn.game.overLimit", {
                    count: s.evaluation.wordCount,
                    max: round.maxWords,
                  })}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("learn.game.wordsUsed", { count: s.evaluation.wordCount })}
                </p>
              )}
            </div>
          ) : null}
          <p className="text-sm leading-relaxed text-muted-foreground">{explanationOf(question)}</p>
          <p className="text-sm text-foreground">
            <span className="font-medium">{t("learn.game.sample")} </span>
            {sampleAnswerFor(question)}
          </p>
        </div>
      ) : question.kind === "flash" ? null : (
        <Button
          type="button"
          className="h-11 w-full rounded-full sm:w-auto"
          disabled={!s.ready}
          onClick={s.onSubmitCurrent}
        >
          {t("learn.game.submit")}
        </Button>
      )}
    </article>
  );
}
