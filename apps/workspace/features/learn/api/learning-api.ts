import type {
  LearningExercise,
  LearningGame,
  LearningGameSummary,
  LearningIntegratedLesson,
  LearningLevel,
  LearningMeta,
  LearningSkill,
} from "./types";
import type { LessonPack } from "../model/curriculum";

function getApiBase() {
  if (process.env.NEXT_PUBLIC_AUTH_SAME_ORIGIN === "true") return "";
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

/**
 * Soft JSON GET that does not force login redirect on 401.
 * Skills pages keep a local catalog fallback when the API is unavailable.
 */
async function softGet<T>(path: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const response = await fetch(`${getApiBase()}${path}`, {
      method: "GET",
      credentials: "include",
      signal,
      headers: {
        Accept: "application/json",
        "X-Client": "englitutor-workspace",
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
  meta: (signal?: AbortSignal) => softGet<LearningMeta>("/api/learning/meta", signal),

  listExercises: (filters?: { skill?: LearningSkill; level?: LearningLevel }, signal?: AbortSignal) =>
    softGet<{ data: LearningExercise[]; total: number }>(
      `/api/learning/exercises${toQuery({
        skill: filters?.skill,
        level: filters?.level,
      })}`,
      signal,
    ),

  getExercise: (id: string, signal?: AbortSignal) =>
    softGet<LearningExercise>(`/api/learning/exercises/${id}`, signal),

  listIntegratedLessons: (signal?: AbortSignal) =>
    softGet<{ data: LearningIntegratedLesson[]; total: number }>(
      "/api/learning/integrated-lessons",
      signal,
    ),

  getIntegratedLesson: (id: string, signal?: AbortSignal) =>
    softGet<LearningIntegratedLesson>(`/api/learning/integrated-lessons/${id}`, signal),

  listLessons: (signal?: AbortSignal) =>
    softGet<{ data: LessonPack[]; total: number }>("/api/learning/lessons", signal),

  listGames: (signal?: AbortSignal) =>
    softGet<{ data: LearningGameSummary[]; total: number }>("/api/learning/games", signal),

  getGame: (id: string, lesson?: string, signal?: AbortSignal) =>
    softGet<LearningGame>(`/api/learning/games/${id}${toQuery({ lesson })}`, signal),
};
