"use client";

import { memo, type FormEvent, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { motion } from "motion/react";
import {
  Check,
  Copy,
  Languages,
  Lightbulb,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { Button, cn } from "@engli-tutor/ui";
import { useWorkspaceI18n } from "@/features/i18n";
import { type TranslateResult } from "../../api/translate-api";
import { EXPRESSION_TYPES } from "../../model/phrase-lexicon";
import type { PickExpression } from "../../model/translate-session";
import type { LookupSource } from "./index";

type SentenceData = NonNullable<TranslateResult["sentence"]>;

const KNOWN_CLAUSE_ROLES = new Set([
  "main",
  "subordinate",
  "relative",
  "condition",
  "contrast",
  "purpose",
  "other",
]);

/** Whole-sentence analysis, shared by the typed-text result and the "in this sentence" section. */
function SentenceAnalysis({
  sentence,
  translation,
  showMeaning,
}: {
  sentence: SentenceData;
  translation: string;
  showMeaning: boolean;
}) {
  const t = useWorkspaceI18n();
  const clauses = sentence.clauses ?? [];
  return (
    <div className="space-y-3">
      {showMeaning ? (
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
            {t("workspace.meaningInSentence")}
          </p>
          <p className="mt-1.5 text-xs leading-5">{sentence.meaningVi}</p>
        </div>
      ) : null}
      {sentence.breakdown ? (
        <p className="rounded-xl bg-muted/60 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
          {sentence.breakdown}
        </p>
      ) : null}
      {clauses.length ? (
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
            {t("translate.clausesTitle")}
          </p>
          <ol className="mt-2 space-y-1.5">
            {clauses.map((clause, index) => {
              const role = KNOWN_CLAUSE_ROLES.has(clause.role) ? clause.role : "other";
              const isMain = role === "main";
              return (
                <li
                  key={`${clause.text}-${index}`}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs leading-5",
                    isMain
                      ? "border-primary/30 bg-primary/8"
                      : "border-border/70 bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase",
                      isMain ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {t(`translate.clauseRole.${role}`)}
                  </span>
                  <p className="mt-0.5 font-medium">{clause.text}</p>
                  <p className="text-muted-foreground">{clause.meaningVi}</p>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
      {sentence.chunks.length ? (
        <div className="flex flex-wrap gap-1.5">
          {sentence.chunks.map((chunk, index) => (
            <span
              key={`${chunk.phrase}-${index}`}
              className="group relative rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
            >
              <span className="font-medium">{chunk.phrase}</span>
              <span className="text-muted-foreground"> · {chunk.meaningVi}</span>
            </span>
          ))}
        </div>
      ) : null}
      {sentence.moreNatural && sentence.moreNatural !== translation ? (
        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/8 px-3 py-2.5">
          <p className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">
            {t("translate.moreNatural")}
          </p>
          <p className="mt-1 text-xs leading-5">{sentence.moreNatural}</p>
        </div>
      ) : null}
      {sentence.tone ? (
        <p className="text-[11px] text-muted-foreground">
          {t("translate.tone")}{" "}
          <span className="font-medium text-foreground">{sentence.tone}</span>
        </p>
      ) : null}
    </div>
  );
}

/** The expression around the clicked word: type badge, phrase and its meaning. */
function ExpressionCard({
  expression,
  meaning,
  pending,
  onDismiss,
}: {
  expression: PickExpression;
  meaning: string;
  pending: boolean;
  onDismiss: () => void;
}) {
  const t = useWorkspaceI18n();
  const typeKey = EXPRESSION_TYPES.has(expression.type) ? expression.type : "other";
  const showBase = expression.base && expression.base !== expression.phrase.toLowerCase();
  return (
    <section className="rounded-xl border border-primary/25 bg-primary/8 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary-foreground uppercase">
          {t(`translate.expressionType.${typeKey}`)}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[11px] font-medium text-primary hover:underline"
        >
          {t("translate.onlyThisWord")}
        </button>
      </div>
      <p className="mt-2 text-sm font-semibold tracking-tight text-foreground">
        {expression.phrase}
        {showBase ? (
          <span className="ml-1.5 font-normal text-muted-foreground">· {expression.base}</span>
        ) : null}
      </p>
      {meaning ? (
        <p className="mt-1.5 text-base leading-7 font-semibold text-foreground">{meaning}</p>
      ) : pending ? (
        <div className="mt-2 h-5 w-3/5 animate-pulse rounded bg-muted" />
      ) : null}
      {expression.note ? (
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{expression.note}</p>
      ) : null}
    </section>
  );
}

/** Collapses the single-word meaning while an expression card leads the panel. */
function WordMeaningFold({
  folded,
  label,
  children,
}: {
  folded: boolean;
  label: string;
  children: ReactNode;
}) {
  if (!folded) return <>{children}</>;
  return (
    <details className="rounded-xl border border-border/70 px-3 py-2.5">
      <summary className="cursor-pointer text-[11px] font-semibold text-muted-foreground">
        {label}
      </summary>
      <div className="mt-2.5">{children}</div>
    </details>
  );
}

function highlightWordInSentence(sentence: string, word: string) {
  const index = sentence.toLowerCase().indexOf(word.toLowerCase());
  if (index < 0) return sentence;
  return (
    <>
      {sentence.slice(0, index)}
      <span className="rounded-sm bg-primary px-[0.15em] font-semibold text-primary-foreground">
        {sentence.slice(index, index + word.length)}
      </span>
      {sentence.slice(index + word.length)}
    </>
  );
}

export type FloatingTranslateViewProps = {
  open: boolean;
  reduceMotion: boolean;
  text: string;
  pending: boolean;
  error: string | null;
  result: TranslateResult | null;
  copied: boolean;
  contextPending: boolean;
  lookupSource: LookupSource;
  sentenceContext: TranslateResult | null;
  sentenceError: string | null;
  expression: PickExpression | null;
  expressionResult: TranslateResult | null;
  expressionPending: boolean;
  onDismissExpression: () => void;
  pickedWord: string | null;
  activeSentence: string | null;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
  onToggle: () => void;
  onSubmit: (event: FormEvent) => void;
  onTextChange: (value: string) => void;
  onComposerKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onClear: () => void;
  onSpeakEnglish: () => void;
  onCopyTranslation: () => void;
  onCopyText: (value: string) => void;
};

export const FloatingTranslateView = memo(function FloatingTranslateView({
  open,
  reduceMotion,
  text,
  pending,
  error,
  result,
  copied,
  contextPending,
  lookupSource,
  sentenceContext,
  sentenceError,
  expression,
  expressionResult,
  expressionPending,
  onDismissExpression,
  pickedWord,
  activeSentence,
  inputRef,
  onClose,
  onToggle,
  onSubmit,
  onTextChange,
  onComposerKeyDown,
  onClear,
  onSpeakEnglish,
  onCopyTranslation,
  onCopyText,
}: FloatingTranslateViewProps) {
  const t = useWorkspaceI18n();
  // A click on a word whose sentence differs from the word shows the sentence section.
  const showSentenceSection = Boolean(
    lookupSource === "pick" &&
      activeSentence &&
      pickedWord &&
      activeSentence.trim().toLowerCase() !== pickedWord.trim().toLowerCase(),
  );
  const sentenceData = sentenceContext?.sentence ?? null;
  const showExpression = lookupSource === "pick" && expression != null;

  return (
    <div className="pointer-events-none relative">
      <div
        className={cn(
          "fixed right-0 bottom-0 z-60 flex h-[58dvh] w-full flex-col overflow-hidden overscroll-contain border-t border-border/80 bg-card shadow-[0_-16px_40px_-28px_rgba(15,23,42,0.32)] lg:top-16 lg:h-auto lg:max-w-120 lg:border-l lg:shadow-[-16px_0_40px_-28px_rgba(15,23,42,0.28)]",
          "transform-gpu will-change-transform",
          reduceMotion
            ? ""
            : "transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "pointer-events-auto translate-y-0 lg:translate-x-0"
            : "pointer-events-none translate-y-full lg:translate-x-full lg:translate-y-0",
        )}
        role="dialog"
        aria-hidden={!open}
        aria-label={t("workspace.translateTitle")}
        inert={!open ? true : undefined}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/70 bg-linear-to-r from-primary/10 to-transparent px-3 py-2.5 sm:px-4 sm:py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:size-9">
              <Languages className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                {t("workspace.translateTitle")}{" "}
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-primary">
                  AI
                </span>
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {t("workspace.contextTranslation")}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onClose}
            aria-label={t("workspace.closeTranslate")}
          >
            <X className="size-4" />
          </button>
        </div>

        <form className="shrink-0 space-y-2.5 p-3 sm:space-y-3 sm:p-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 items-center gap-2 rounded-xl bg-muted/60 p-1">
            <span className="px-2 text-center text-xs font-semibold text-foreground">{t("workspace.english")}</span>
            <span className="px-2 text-center text-xs font-semibold text-foreground">
              {t("workspace.vietnamese")}
            </span>
          </div>

          <div className="relative">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              onKeyDown={onComposerKeyDown}
              rows={3}
              maxLength={2000}
              placeholder={t("workspace.translatePlaceholder")}
              className="max-h-28 w-full resize-none rounded-xl border border-input bg-background/60 px-3 py-2.5 pb-7 text-sm leading-5 shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 sm:max-h-none sm:py-3 sm:pb-8 sm:leading-6"
            />
            <div className="absolute right-2.5 bottom-2 flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>{text.length}/2000</span>
              {text ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="rounded px-1.5 py-0.5 font-medium hover:bg-muted hover:text-foreground"
                >
                  {t("workspace.clear")}
                </button>
              ) : null}
            </div>
          </div>
          {error ? (
            <p
              className="rounded-lg bg-destructive/8 px-3 py-2 text-xs text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={pending || !text.trim()}
            className="h-10 w-full rounded-full"
          >
            {pending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                {t("workspace.analyseContext")}
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                {t("workspace.translateContext")}
              </>
            )}
          </Button>
          <p className="text-center text-[10px] text-muted-foreground">
            {t("workspace.translationShortcut")}
          </p>
        </form>

        {pending ? (
          <div className="space-y-3 border-t border-border/70 p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-14 animate-pulse rounded-xl bg-muted/70" />
          </div>
        ) : null}

        {result && !pending ? (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto border-t border-border/70 px-4 py-4">
            {showExpression && expression ? (
              <ExpressionCard
                expression={expression}
                meaning={expression.meaningVi || expressionResult?.translation || ""}
                pending={expressionPending}
                onDismiss={onDismissExpression}
              />
            ) : null}
            <WordMeaningFold
              folded={showExpression}
              label={t("translate.wordOnlyMeaning", { word: pickedWord ?? result.query })}
            >
              <section className="rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold tracking-[0.14em] text-primary uppercase">
                    {t("workspace.suggestedTranslation")}
                  </p>
                  <div className="flex">
                    <button
                      type="button"
                      onClick={onSpeakEnglish}
                      className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-card hover:text-primary"
                      aria-label={t("workspace.listenEnglish")}
                    >
                      <Volume2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={onCopyTranslation}
                      className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-card hover:text-primary"
                      aria-label={t("workspace.copyTranslation")}
                    >
                      {copied ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm font-semibold tracking-tight text-foreground">
                  {result.word?.headword || result.query}
                </p>
                {result.word?.phonetic ? (
                  <p className="mt-1 font-mono text-[13px] leading-5 text-muted-foreground">
                    {result.word.phonetic}
                  </p>
                ) : null}
                <p className="mt-2 text-base leading-7 font-semibold text-foreground">
                  {result.translation}
                </p>
                {result.usageNote ? (
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{result.usageNote}</p>
                ) : null}
              </section>
            </WordMeaningFold>

            {result.alternatives.length ? (
              <section>
                <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                  {t("workspace.alternativeExpressions")}
                </p>
                <div className="mt-2 space-y-2">
                  {result.alternatives.map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      className="rounded-xl border border-border/70 px-3 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-primary uppercase">
                            {item.label}
                          </span>
                          <p className="mt-0.5 text-sm font-medium leading-5">{item.text}</p>
                          {item.note ? (
                            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                              {item.note}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => onCopyText(item.text)}
                          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {showSentenceSection && activeSentence && pickedWord ? (
              <section className="space-y-3">
                <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                  {t("workspace.inThisSentence")}
                </p>
                <p className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 text-xs leading-5 text-foreground">
                  “{highlightWordInSentence(activeSentence.trim(), pickedWord.trim())}”
                </p>
                {contextPending ? (
                  <div className="space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-12 animate-pulse rounded-xl bg-muted/70" />
                  </div>
                ) : null}
                {sentenceError ? (
                  <p
                    className="rounded-lg bg-destructive/8 px-3 py-2 text-xs text-destructive"
                    role="alert"
                  >
                    {sentenceError}
                  </p>
                ) : null}
                {sentenceData ? (
                  <>
                    {sentenceData.meaningVi ? (
                      <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                        <p className="text-[10px] font-bold tracking-[0.14em] text-primary uppercase">
                          {t("translate.sentenceTranslation")}
                        </p>
                        <p className="mt-1.5 text-sm leading-6 font-semibold text-foreground">
                          {sentenceData.meaningVi}
                        </p>
                      </div>
                    ) : null}
                    <SentenceAnalysis
                      sentence={sentenceData}
                      translation={sentenceContext?.translation ?? ""}
                      showMeaning={false}
                    />
                  </>
                ) : null}
              </section>
            ) : null}

            {result.sentence && !showSentenceSection ? (
              <section>
                <SentenceAnalysis
                  sentence={result.sentence}
                  translation={result.translation}
                  showMeaning
                />
              </section>
            ) : null}

            {result.word ? (
              <section>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                    {t("translate.keywordInContext")}
                  </p>
                  {result.word.level ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {result.word.level}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-semibold">
                  {result.word.headword}
                  {result.word.partOfSpeech ? (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      · {result.word.partOfSpeech}
                    </span>
                  ) : null}
                </p>
                {result.word.phonetic ? (
                  <p className="mt-1 font-mono text-[13px] leading-5 text-muted-foreground">
                    {result.word.phonetic}
                  </p>
                ) : null}
                <div className="mt-2 space-y-2">
                  {result.word.senses.map((sense, index) => (
                    <div key={index} className="text-xs leading-5">
                      <p>
                        <span className="mr-1 font-semibold text-primary">{index + 1}.</span>
                        {sense.meaningVi}
                      </p>
                      {sense.example ? (
                        <p className="pl-4 text-muted-foreground">“{sense.example}”</p>
                      ) : null}
                    </div>
                  ))}
                </div>
                {result.word.collocations.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {result.word.collocations.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {result.tips.length ? (
              <section className="rounded-xl bg-amber-500/8 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">
                  <Lightbulb className="size-3.5" />
                  {t("translate.remember")}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {result.tips.map((tip) => (
                    <li key={tip} className="flex gap-2 text-xs leading-5 text-muted-foreground">
                      <span className="text-amber-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="flex items-center justify-between border-t border-border pt-3">
              <p className="text-[10px] text-muted-foreground">
                {result.source === "dictionary"
                  ? t("translate.sourceDictionary")
                  : result.demo
                    ? t("translate.sourceDemo")
                    : t("translate.sourceAi")}
              </p>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
              >
                <RotateCcw className="size-3" />
                {t("translate.again")}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <motion.button
        type="button"
        onClick={onToggle}
        className={cn(
          "pointer-events-auto grid size-12 place-items-center rounded-full border border-border bg-card text-foreground shadow-lg transition-colors",
          open
            ? "border-primary/50 bg-primary/10 text-primary"
            : "hover:border-primary/40 hover:text-primary",
        )}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.94 }}
        aria-expanded={open}
        aria-label={open ? t("workspace.closeTranslate") : t("translate.open")}
        title={t("translate.shortcutTitle")}
      >
        {open ? <X className="size-4" /> : <Languages className="size-4" />}
      </motion.button>
    </div>
  );
});
