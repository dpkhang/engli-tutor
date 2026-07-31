import type {
  CreateLandingPageInput,
  LandingPage,
  LandingPageDetail,
  UpdateLandingPageInput,
} from "../model/types";

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
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

export async function getLandingPages(): Promise<LandingPage[]> {
  const response = await fetch(`${apiBase()}/api/landing-pages`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<LandingPage[]>;
}

export async function getLandingPage(id: string): Promise<LandingPageDetail> {
  const response = await fetch(`${apiBase()}/api/landing-pages/${id}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<LandingPageDetail>;
}

export async function createLandingPage(input: CreateLandingPageInput): Promise<LandingPage> {
  const response = await fetch(`${apiBase()}/api/landing-pages`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
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
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<LandingPageDetail>;
}

export async function deleteLandingPage(id: string): Promise<void> {
  const response = await fetch(`${apiBase()}/api/landing-pages/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(await parseError(response));
  }
}
