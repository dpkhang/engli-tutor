"use client";

import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "motion/react";
import { ApiError } from "@engli-tutor/api-client";
import type { Translator } from "@engli-tutor/i18n";
import { useWorkspaceI18n } from "@/features/i18n";
import { upgradeMessageFromError } from "@/features/payments";
import { type TranslateDirection, type TranslateResult } from "../../api/translate-api";
import { lookupTranslation } from "../../model/translate-lookup";
import { getCachedLookup } from "../../model/translate-cache";
import { isTranslateHotkey } from "../../model/translate-path";
import { useTranslateSession } from "../../model/translate-session";
import { FloatingTranslateView } from "./floating-translate.view";

function mergeWord(
  current: TranslateResult["word"],
  incoming: TranslateResult["word"],
): TranslateResult["word"] {
  if (!incoming) return current;
  if (!current) return incoming;
  return {
    ...incoming,
    phonetic: incoming.phonetic || current.phonetic,
    headword: incoming.headword || current.headword,
    partOfSpeech: incoming.partOfSpeech || current.partOfSpeech,
    level: incoming.level || current.level,
    senses: incoming.senses.length ? incoming.senses : current.senses,
    collocations: incoming.collocations.length ? incoming.collocations : current.collocations,
  };
}

function mergeWordWithSentence(
  current: TranslateResult | null,
  contextual: TranslateResult,
): TranslateResult {
  if (!current) return contextual;
  return {
    ...current,
    sentence: contextual.sentence ?? current.sentence,
    word: mergeWord(current.word, contextual.word),
    alternatives: contextual.alternatives.length ? contextual.alternatives : current.alternatives,
    usageNote: contextual.usageNote || current.usageNote,
    tips: contextual.tips.length ? contextual.tips : current.tips,
    paraphrase: contextual.paraphrase || current.paraphrase,
  };
}

function errorMessage(error: unknown, t: Translator) {
  const upgradeMessage = upgradeMessageFromError(error, t);
  if (upgradeMessage) return upgradeMessage;
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return t("translate.unavailable");
}

const DIRECTION: TranslateDirection = "en-vi";

export function FloatingTranslate() {
  const t = useWorkspaceI18n();
  const { open, setOpen, pickedWord, pickNonce, activeSentence } = useTranslateSession();
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [contextPending, setContextPending] = useState(false);
  const contextRequestRef = useRef(0);

  useEffect(() => {
    const openOnShortcut = (event: KeyboardEvent) => {
      if (!isTranslateHotkey(event)) return;
      event.preventDefault();
      setOpen(true);
    };
    document.addEventListener("keydown", openOnShortcut);
    return () => {
      document.removeEventListener("keydown", openOnShortcut);
    };
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const clear = useCallback(() => {
    contextRequestRef.current += 1;
    setText("");
    setResult(null);
    setError(null);
    setContextPending(false);
    inputRef.current?.focus();
  }, []);

  const copyTranslation = useCallback(async () => {
    if (!result?.translation) return;
    await navigator.clipboard.writeText(result.translation);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_600);
  }, [result?.translation]);

  const speak = useCallback((value: string) => {
    if (!("speechSynthesis" in window) || !value.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }, []);

  const submit = useCallback(
    async (nextText?: string) => {
      const query = (nextText ?? text).trim();
      if (!query) return null;
      if (pending && nextText == null) return null;
      setText(query);
      setError(null);
      setCopied(false);
      const cached = getCachedLookup(DIRECTION, query);
      if (cached) {
        setResult(cached);
        setPending(false);
        if (!cached.word?.phonetic) {
          void lookupTranslation({ text: query, direction: DIRECTION })
            .then((next) => {
              if (next.word?.phonetic) setResult(next);
            })
            .catch(() => undefined);
        }
        return cached;
      }
      setPending(true);
      try {
        const next = await lookupTranslation({ text: query, direction: DIRECTION });
        setResult(next);
        return next;
      } catch (lookupError) {
        setError(errorMessage(lookupError, t));
        return null;
      } finally {
        setPending(false);
      }
    },
    [pending, t, text],
  );

  const loadSentenceContext = useCallback(async (sentence: string, word: string) => {
    const requestId = ++contextRequestRef.current;
    const cachedContext = getCachedLookup(DIRECTION, sentence, word);
    if (cachedContext) {
      setResult((current) => mergeWordWithSentence(current, cachedContext));
      setContextPending(false);
      return;
    }
    setContextPending(true);
    try {
      const contextual = await lookupTranslation({
        text: sentence,
        direction: DIRECTION,
        focusWord: word,
      });
      if (requestId !== contextRequestRef.current) return;
      setResult((current) => mergeWordWithSentence(current, contextual));
    } catch {
      if (requestId !== contextRequestRef.current) return;
    } finally {
      if (requestId === contextRequestRef.current) setContextPending(false);
    }
  }, []);

  useEffect(() => {
    if (!open || !pickedWord || pickNonce === 0) return;
    setError(null);
    void (async () => {
      const sentence = activeSentence?.trim() ?? "";
      const sameAsWord = sentence.toLowerCase() === pickedWord.trim().toLowerCase();
      const wordLookup = submit(pickedWord);
      const contextLookup =
        sentence && !sameAsWord ? loadSentenceContext(sentence, pickedWord) : Promise.resolve();
      await Promise.all([wordLookup, contextLookup]);
      if (!sentence || sameAsWord) setContextPending(false);
    })();
    if (window.matchMedia("(min-width: 1024px)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- push from practice clicks
  }, [pickNonce]);

  const onSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      void submit();
    },
    [submit],
  );

  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const onToggle = useCallback(() => setOpen(!open), [open, setOpen]);
  const onTextChange = useCallback((value: string) => {
    setText(value);
    setResult(null);
    setError(null);
  }, []);
  const onComposerKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        void submit();
      }
    },
    [submit],
  );
  const onSpeakEnglish = useCallback(() => {
    speak(result?.query ?? "");
  }, [result?.query, speak]);
  const onCopyTranslation = useCallback(() => {
    void copyTranslation();
  }, [copyTranslation]);
  const onCopyText = useCallback((value: string) => {
    void navigator.clipboard.writeText(value);
  }, []);

  return (
    <FloatingTranslateView
      open={open}
      reduceMotion={Boolean(reduceMotion)}
      text={text}
      pending={pending}
      error={error}
      result={result}
      copied={copied}
      contextPending={contextPending}
      pickedWord={pickedWord}
      activeSentence={activeSentence}
      inputRef={inputRef}
      onClose={onClose}
      onToggle={onToggle}
      onSubmit={onSubmit}
      onTextChange={onTextChange}
      onComposerKeyDown={onComposerKeyDown}
      onClear={clear}
      onSpeakEnglish={onSpeakEnglish}
      onCopyTranslation={onCopyTranslation}
      onCopyText={onCopyText}
    />
  );
}
