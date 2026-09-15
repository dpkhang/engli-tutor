"use client";

import { useCallback, useEffect, useRef } from "react";
import { tutorApi } from "@/features/tutor-chat/api";
import { resolveSpeechRates } from "@/features/settings";

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => /en-US/i.test(v.lang) && /neural|premium|enhanced|natural/i.test(v.name)) ||
    voices.find((v) => /en-US/i.test(v.lang) && /google|samantha|ava|jenny/i.test(v.name)) ||
    voices.find((v) => /^en(-|_|$)/i.test(v.lang)) ||
    null
  );
}

function speakBrowser(text: string, rate: number, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = rate;
  const voice = pickEnglishVoice();
  if (voice) utter.voice = voice;
  utter.onend = () => onEnd?.();
  utter.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utter);
}

function cacheKey(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

const CLIENT_CACHE_MAX = 32;
/** Session blob cache — replay Listen without hitting `/speak` again. */
const clientAudioCache = new Map<string, Blob>();

function clientCacheGet(key: string) {
  const hit = clientAudioCache.get(key);
  if (!hit) return null;
  clientAudioCache.delete(key);
  clientAudioCache.set(key, hit);
  return hit;
}

function clientCacheSet(key: string, blob: Blob) {
  if (clientAudioCache.has(key)) clientAudioCache.delete(key);
  clientAudioCache.set(key, blob);
  while (clientAudioCache.size > CLIENT_CACHE_MAX) {
    const oldest = clientAudioCache.keys().next().value;
    if (oldest === undefined) break;
    clientAudioCache.delete(oldest);
  }
}

export type AiSpeechResult = {
  source: "ai" | "browser";
  stop: () => void;
};

/**
 * Speaks English tutor / lesson lines via AI TTS (`/api/tutor/speak`),
 * with client + server content cache. Falls back to browser speechSynthesis.
 */
export function useAiSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    generationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [stop]);

  const isCurrent = useCallback((gen: number) => {
    return mountedRef.current && gen === generationRef.current;
  }, []);

  const playBlob = useCallback(
    async (
      blob: Blob,
      cleaned: string,
      gen: number,
      onEnd?: () => void,
    ): Promise<AiSpeechResult> => {
      if (!isCurrent(gen)) {
        onEnd?.();
        return { source: "ai", stop };
      }

      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audio.playbackRate = resolveSpeechRates().audio;
      audioRef.current = audio;
      audio.onended = () => {
        if (objectUrlRef.current === url) {
          URL.revokeObjectURL(url);
          objectUrlRef.current = null;
        }
        if (audioRef.current === audio) audioRef.current = null;
        if (isCurrent(gen)) onEnd?.();
      };
      audio.onerror = () => {
        if (objectUrlRef.current === url) {
          URL.revokeObjectURL(url);
          objectUrlRef.current = null;
        }
        if (audioRef.current === audio) audioRef.current = null;
        if (!isCurrent(gen)) {
          onEnd?.();
          return;
        }
        speakBrowser(cleaned, resolveSpeechRates().tts, onEnd);
      };

      try {
        await audio.play();
      } catch {
        if (!isCurrent(gen)) {
          onEnd?.();
          return { source: "ai", stop };
        }
        speakBrowser(cleaned, resolveSpeechRates().tts, onEnd);
        return { source: "browser", stop };
      }

      if (!isCurrent(gen)) {
        stop();
        onEnd?.();
        return { source: "ai", stop };
      }

      return { source: "ai", stop };
    },
    [isCurrent, stop],
  );

  const speak = useCallback(
    async (text: string, onEnd?: () => void): Promise<AiSpeechResult> => {
      const cleaned = text.trim();
      if (!cleaned) {
        onEnd?.();
        return { source: "browser", stop };
      }

      if (!mountedRef.current) {
        onEnd?.();
        return { source: "browser", stop };
      }

      stop();
      const gen = generationRef.current;
      const key = cacheKey(cleaned);
      const abort = new AbortController();
      abortRef.current = abort;

      try {
        const cached = clientCacheGet(key);
        const blob =
          cached ?? (await tutorApi.speak({ text: cleaned, signal: abort.signal }));
        if (!cached) clientCacheSet(key, blob);

        if (!isCurrent(gen)) {
          onEnd?.();
          return { source: "ai", stop };
        }

        return await playBlob(blob, cleaned, gen, onEnd);
      } catch (err) {
        if (abort.signal.aborted || !isCurrent(gen)) {
          onEnd?.();
          return { source: "ai", stop };
        }
        if (err instanceof DOMException && err.name === "AbortError") {
          onEnd?.();
          return { source: "ai", stop };
        }
        /* fall through to browser */
      }

      if (!isCurrent(gen)) {
        onEnd?.();
        return { source: "browser", stop };
      }
      speakBrowser(cleaned, resolveSpeechRates().tts, onEnd);
      return { source: "browser", stop };
    },
    [isCurrent, playBlob, stop],
  );

  return { speak, stop };
}
