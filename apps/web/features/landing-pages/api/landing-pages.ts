import type {
  CreateLandingPageInput,
  LandingPage,
  LandingPageDetail,
  UpdateLandingPageInput,
} from "../model/types";

function apiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is missing. Check apps/web/.env.local and restart next.");
  }
  return url;
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    if (body.message) return body.message;
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`;
}

const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
} as const;

export async function getLandingPages(): Promise<LandingPage[]> {
  const response = await fetch(`${apiBase()}/api/landing-pages`, {
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<LandingPage[]>;
}

export async function getLandingPage(id: string): Promise<LandingPageDetail> {
  const response = await fetch(`${apiBase()}/api/landing-pages/${id}`, {
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<LandingPageDetail>;
}

export async function createLandingPage(input: CreateLandingPageInput): Promise<LandingPage> {
  const response = await fetch(`${apiBase()}/api/landing-pages`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<LandingPage>;
}

export async function updateLandingPage(
  id: string,
  input: UpdateLandingPageInput,
): Promise<LandingPageDetail> {
  const response = await fetch(`${apiBase()}/api/landing-pages/${id}`, {
    method: "PATCH",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<LandingPageDetail>;
}

export async function deleteLandingPage(id: string): Promise<void> {
  const response = await fetch(`${apiBase()}/api/landing-pages/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(await parseError(response));
  }
}
