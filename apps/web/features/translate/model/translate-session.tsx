"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type TranslateActivePick = {
  instanceId: string;
  start: number;
  end: number;
  wordIndex?: number | null;
  sentence?: string | null;
  sentenceStart?: number;
  sentenceEnd?: number;
};

type TranslateSessionValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  pickedWord: string | null;
  pickNonce: number;
  activePick: TranslateActivePick | null;
  activeSentence: string | null;
  pushWord: (word: string, pick?: TranslateActivePick | null) => void;
};

const TranslateSessionContext = createContext<TranslateSessionValue | null>(null);

export function TranslateSessionProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const [pickedWord, setPickedWord] = useState<string | null>(null);
  const [pickNonce, setPickNonce] = useState(0);
  const [activePick, setActivePick] = useState<TranslateActivePick | null>(null);
  const [activeSentence, setActiveSentence] = useState<string | null>(null);

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    if (!next) {
      setActivePick(null);
      setActiveSentence(null);
    }
  }, []);

  const pushWord = useCallback((word: string, pick?: TranslateActivePick | null) => {
    const next = word.trim();
    if (!next) return;
    setPickedWord(next);
    setActivePick(pick ?? null);
    setActiveSentence(pick?.sentence?.trim() || null);
    setPickNonce((value) => value + 1);
  }, []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      pickedWord,
      pickNonce,
      activePick,
      activeSentence,
      pushWord,
    }),
    [open, pickedWord, pickNonce, activePick, activeSentence, pushWord],
  );

  return <TranslateSessionContext.Provider value={value}>{children}</TranslateSessionContext.Provider>;
}

export function useTranslateSession() {
  const context = useContext(TranslateSessionContext);
  if (!context) {
    throw new Error("useTranslateSession must be used within TranslateSessionProvider");
  }
  return context;
}
