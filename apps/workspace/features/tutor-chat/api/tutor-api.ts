import { ApiError } from "@engli-tutor/api-client";
import { workspaceApiClient } from "@/lib/workspace-api-client";

export type TutorScenario = "interview" | "standup" | "smalltalk" | "email" | "free";
export type TutorMode = "chat" | "speaking";
export type TutorLevel = "A2" | "B1" | "TOEIC" | "IELTS";
export type TutorExplanationLocale = "en" | "vi";

export type TutorChatMessage = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

export type TutorChatResponse = {
  reply: string;
  demo: boolean;
};

function getApiBase() {
  if (process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true") return "";
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

/** AI completions can take well over the default 30s. */
const AI_TIMEOUT_MS = 90_000;

export const tutorApi = {
  chat: (input: {
    messages: TutorChatMessage[];
    scenario: TutorScenario;
    mode?: TutorMode;
    level?: TutorLevel;
    explanationLocale?: TutorExplanationLocale;
  }) => workspaceApiClient.post<TutorChatResponse>("/api/tutor/chat", input, { timeoutMs: AI_TIMEOUT_MS }),

  chatStream: async (input: {
    messages: TutorChatMessage[];
    scenario: TutorScenario;
    mode?: TutorMode;
    level?: TutorLevel;
    explanationLocale?: TutorExplanationLocale;
    onChunk: (text: string) => void;
    signal?: AbortSignal;
  }): Promise<TutorChatResponse> => {
    const response = await fetch(`${getApiBase()}/api/tutor/chat`, {
      method: "POST",
      credentials: "include",
      signal: input.signal,
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        "X-Client": "englitutor-workspace",
      },
      body: JSON.stringify({
        messages: input.messages,
        scenario: input.scenario,
        mode: input.mode,
        level: input.level,
        explanationLocale: input.explanationLocale,
      }),
    });
    if (!response.ok) throw await ApiError.fromResponse(response);

    // Demo/fallback mode still returns the legacy JSON response.
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/event-stream")) {
      const payload = (await response.json()) as TutorChatResponse & { message?: string };
      if (payload.message && !payload.reply) throw new Error(payload.message);
      if (payload.reply) input.onChunk(payload.reply);
      return { reply: payload.reply ?? "", demo: payload.demo ?? false };
    }

    if (!response.body) throw new Error("Chat response stream unavailable");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let result: TutorChatResponse | null = null;
    const consumeEvent = (event: string) => {
      const lines = event.split(/\r?\n/);
      const eventName = lines.find((line) => line.startsWith("event:"))?.slice(6).trim();
      const data = lines.find((line) => line.startsWith("data:"))?.slice(5).trim();
      if (!data) return;
      const payload = JSON.parse(data) as {
        text?: string;
        reply?: string;
        demo?: boolean;
        message?: string;
      };
      if (eventName === "chunk") input.onChunk(payload.text ?? "");
      if (eventName === "done") result = { reply: payload.reply ?? "", demo: payload.demo ?? false };
      if (eventName === "error") throw new Error(payload.message ?? "Unable to chat with AI");
    };
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      for (const event of events) consumeEvent(event);
      if (done) {
        if (buffer.trim()) consumeEvent(buffer);
        break;
      }
    }
    if (!result) throw new Error("Chat stream ended without a result");
    return result;
  },

  /** Server-side speech-to-text for a recorded turn (webm/opus or mp4). */
  transcribe: async (input: { audio: Blob; signal?: AbortSignal }): Promise<{ text: string }> => {
    const form = new FormData();
    const extension = input.audio.type.includes("mp4") ? "m4a" : "webm";
    form.append("audio", input.audio, `speech.${extension}`);
    const response = await fetch(`${getApiBase()}/api/tutor/transcribe`, {
      method: "POST",
      credentials: "include",
      signal: input.signal,
      headers: { "X-Client": "englitutor-workspace" },
      body: form,
    });
    if (!response.ok) throw await ApiError.fromResponse(response);
    return response.json() as Promise<{ text: string }>;
  },

  /** Returns MPEG audio when TTS is configured; throws on non-OK responses. */
  speak: async (input: { text: string; voice?: string; signal?: AbortSignal }): Promise<Blob> => {
    const response = await fetch(`${getApiBase()}/api/tutor/speak`, {
      method: "POST",
      credentials: "include",
      signal: input.signal,
      headers: {
        Accept: "audio/mpeg, application/json",
        "Content-Type": "application/json",
        "X-Client": "englitutor-workspace",
      },
      body: JSON.stringify({ text: input.text, voice: input.voice }),
    });

    if (!response.ok) {
      throw new Error(`TTS request failed (${response.status})`);
    }

    return response.blob();
  },
};
