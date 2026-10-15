import type { LessonProgressState } from "../model/lesson-progress";

function getApiBase() {
  if (process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true") return "";
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

async function request(path: string, init?: RequestInit): Promise<LessonProgressState | null> {
  try {
    const response = await fetch(`${getApiBase()}${path}`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-Client": "englitutor-workspace",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
      ...init,
    });
    if (!response.ok) return null;
    return (await response.json()) as LessonProgressState;
  } catch {
    return null;
  }
}

export const lessonProgressApi = {
  get: () => request("/api/learning/progress"),
  put: (state: LessonProgressState) =>
    request("/api/learning/progress", {
      method: "PUT",
      body: JSON.stringify(state),
    }),
};
