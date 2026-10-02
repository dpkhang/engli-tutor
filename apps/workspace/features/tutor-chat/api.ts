import { workspaceApiClient } from "@/lib/workspace-api-client";

export type TutorScenario = "interview" | "standup" | "smalltalk" | "email" | "free";
export type TutorMode = "chat" | "speaking";
export type TutorLevel = "A2" | "B1" | "TOEIC" | "IELTS";
export type TutorExplanationLocale = "en" | "vi";

export type TutorChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type TutorChatResponse = {
  reply: string;
  demo: boolean;
};

function getApiBase() {
  if (process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true") return "";
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

export const tutorApi = {
  chat: (input: {
    messages: TutorChatMessage[];
    scenario: TutorScenario;
    mode?: TutorMode;
    level?: TutorLevel;
    explanationLocale?: TutorExplanationLocale;
  }) => workspaceApiClient.post<TutorChatResponse>("/api/tutor/chat", input),

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
      headers: { Accept: "text/event-stream", "Content-Type": "application/json", "X-Client": "pagecraft-workspace" },
      body: JSON.stringify({
        messages: input.messages,
        scenario: input.scenario,
        mode: input.mode,
        level: input.level,
        explanationLocale: input.explanationLocale,
      }),
    });
    if (!response.ok) throw new Error(`Chat request failed (${response.status})`);
    if (!response.body) throw new Error("Chat response stream unavailable");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let result: TutorChatResponse | null = null;
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";
      for (const event of events) {
        const data = event.split("\n").find((line) => line.startsWith("data: "))?.slice(6);
        if (!data) continue;
        const payload = JSON.parse(data) as { text?: string; reply?: string; demo?: boolean; message?: string };
        if (event.startsWith("event: chunk")) input.onChunk(payload.text ?? "");
        if (event.startsWith("event: done")) result = { reply: payload.reply ?? "", demo: payload.demo ?? false };
        if (event.startsWith("event: error")) throw new Error(payload.message ?? "Unable to chat with AI");
      }
      if (done) break;
    }
    if (!result) throw new Error("Chat stream ended without a result");
    return result;
  },

  /** Returns MPEG audio when TTS is configured; throws on non-OK responses. */
  speak: async (input: {
    text: string;
    voice?: string;
    signal?: AbortSignal;
  }): Promise<Blob> => {
    const response = await fetch(`${getApiBase()}/api/tutor/speak`, {
      method: "POST",
      credentials: "include",
      signal: input.signal,
      headers: {
        Accept: "audio/mpeg, application/json",
        "Content-Type": "application/json",
        "X-Client": "pagecraft-workspace",
      },
      body: JSON.stringify({ text: input.text, voice: input.voice }),
    });

    if (!response.ok) {
      throw new Error(`TTS request failed (${response.status})`);
    }

    return response.blob();
  },
};
