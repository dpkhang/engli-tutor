import type {
  LearningExercise,
  LearningIntegratedLesson,
  LearningLevel,
  LearningMeta,
  LearningSkill,
} from "./types";

function getApiBase() {
  if (process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true") return "";
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

/**
 * Soft JSON GET that does not force login redirect on 401.
 * Skills pages keep a local catalog fallback when the API is unavailable.
 */
async function softGet<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${getApiBase()}${path}`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-Client": "pagecraft-workspace",
      },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function toQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const learningApi = {
  meta: () => softGet<LearningMeta>("/api/learning/meta"),

  listExercises: (filters?: { skill?: LearningSkill; level?: LearningLevel }) =>
    softGet<{ data: LearningExercise[]; total: number }>(
      `/api/learning/exercises${toQuery({
        skill: filters?.skill,
        level: filters?.level,
      })}`,
    ),

  getExercise: (id: string) => softGet<LearningExercise>(`/api/learning/exercises/${id}`),

  listIntegratedLessons: () =>
    softGet<{ data: LearningIntegratedLesson[]; total: number }>(
      "/api/learning/integrated-lessons",
    ),

  getIntegratedLesson: (id: string) =>
    softGet<LearningIntegratedLesson>(`/api/learning/integrated-lessons/${id}`),
};
