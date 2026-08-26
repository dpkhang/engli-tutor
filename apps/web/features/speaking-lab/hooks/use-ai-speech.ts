"use client";

import { useCallback, useEffect, useRef } from "react";

function getApiBase() {
  if (process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true") return "";
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

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

function speakBrowser(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.94;
  const voice = pickEnglishVoice();
  if (voice) utter.voice = voice;
  utter.onend = () => onEnd?.();
  utter.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utter);
}

export type AiSpeechResult = {
  source: "ai" | "browser";
  stop: () => void;
};

/**
 * Speaks English tutor lines via AI TTS (`/api/tutor/speak`),
 * falling back to browser speechSynthesis when API is unavailable.
 */
export function useAiSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const generationRef = useRef(0);

  const stop = useCallback(() => {
    generationRef.current += 1;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  const speak = useCallback(
    async (text: string, onEnd?: () => void): Promise<AiSpeechResult> => {
      const cleaned = text.trim();
      if (!cleaned) {
        onEnd?.();
        return { source: "browser", stop };
      }

      stop();
      const gen = generationRef.current;

      try {
        const response = await fetch(`${getApiBase()}/api/tutor/speak`, {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "audio/mpeg, application/json",
            "Content-Type": "application/json",
            "X-Client": "pagecraft-workspace",
          },
          body: JSON.stringify({ text: cleaned }),
        });

        if (gen !== generationRef.current) {
          return { source: "ai", stop };
        }

        if (response.ok) {
          const blob = await response.blob();
          if (gen !== generationRef.current) {
            return { source: "ai", stop };
          }
          const url = URL.createObjectURL(blob);
          objectUrlRef.current = url;
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => {
            if (objectUrlRef.current === url) {
              URL.revokeObjectURL(url);
              objectUrlRef.current = null;
            }
            audioRef.current = null;
            onEnd?.();
          };
          audio.onerror = () => {
            speakBrowser(cleaned, onEnd);
          };
          await audio.play();
          return { source: "ai", stop };
        }
      } catch {
        /* fall through to browser */
      }

      if (gen !== generationRef.current) {
        return { source: "browser", stop };
      }
      speakBrowser(cleaned, onEnd);
      return { source: "browser", stop };
    },
    [stop],
  );

  return { speak, stop };
}
