"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionResultLike = {
  readonly isFinal: boolean;
  readonly 0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type VoiceInputState = {
  supported: boolean;
  recording: boolean;
  transcript: string;
  interim: string;
  audioUrl: string | null;
  error: string | null;
  speechSupported: boolean;
};

export function useVoiceInput(onTranscript?: (text: string) => void) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [mediaSupported, setMediaSupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const baseTranscriptRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    setSpeechSupported(Boolean(getSpeechRecognitionCtor()));
    setMediaSupported(
      typeof window !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== "undefined",
    );
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      mediaRecorderRef.current?.state === "recording" && mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup on unmount only
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
      setRecording(false);
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setInterim("");
    baseTranscriptRef.current = "";
    setTranscript("");

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser does not support recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setStream(stream);
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : undefined;

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
        mediaRecorderRef.current = null;
        setRecording(false);

        const finalText = (baseTranscriptRef.current || "").trim();
        if (finalText) onTranscriptRef.current?.(finalText);
      };

      recorder.start();
      setRecording(true);

      const Recognition = getSpeechRecognitionCtor();
      if (Recognition) {
        const recognition = new Recognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event) => {
          let finalChunk = "";
          let interimChunk = "";
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (result.isFinal) finalChunk += result[0].transcript;
            else interimChunk += result[0].transcript;
          }
          if (finalChunk) {
            baseTranscriptRef.current = `${baseTranscriptRef.current} ${finalChunk}`.trim();
            setTranscript(baseTranscriptRef.current);
            onTranscriptRef.current?.(baseTranscriptRef.current);
          }
          setInterim(interimChunk);
        };
        recognition.onerror = (event) => {
          if (event.error === "aborted" || event.error === "no-speech") return;
          if (event.error === "not-allowed") {
            setError("Microphone permission denied. Allow access in your browser.");
          }
        };
        recognition.onend = () => {
          // Keep recording audio if user is still holding; restart recognition while recording
          if (mediaRecorderRef.current?.state === "recording") {
            try {
              recognition.start();
            } catch {
              /* already started */
            }
          }
        };
        recognitionRef.current = recognition;
        recognition.start();
      }
    } catch {
      setError("Couldn't open the microphone. Check browser permissions and try again.");
      setRecording(false);
    }
  }, [audioUrl]);

  const toggle = useCallback(async () => {
    if (recording) stop();
    else await start();
  }, [recording, start, stop]);

  const clearAudio = useCallback(
    (options?: { revoke?: boolean }) => {
      const shouldRevoke = options?.revoke !== false;
      if (shouldRevoke && audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setAudioBlob(null);
    },
    [audioUrl],
  );

  return {
    supported: mediaSupported,
    speechSupported,
    recording,
    transcript,
    interim,
    audioUrl,
    audioBlob,
    stream,
    error,
    start,
    stop,
    toggle,
    clearAudio,
  };
}
