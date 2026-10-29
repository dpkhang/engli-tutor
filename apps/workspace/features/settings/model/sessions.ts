export type SessionLike = {
  id: string;
  updatedAt?: Date | string | number | null;
};

export type UserAgentInfo = { browser: string | null; os: string | null };

/** Best-effort browser/OS detection from a user-agent string. */
export function describeUserAgent(ua: string | null | undefined): UserAgentInfo {
  if (!ua) return { browser: null, os: null };

  let browser: string | null = null;
  if (/Edg(e|A|iOS)?\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/SamsungBrowser\//.test(ua)) browser = "Samsung Internet";
  else if (/Firefox\/|FxiOS\//.test(ua)) browser = "Firefox";
  else if (/Chrome\/|CriOS\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua)) browser = "Safari";

  let os: string | null = null;
  if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/CrOS/.test(ua)) os = "ChromeOS";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
  else if (/Linux|X11/.test(ua)) os = "Linux";

  return { browser, os };
}

function toTime(value: SessionLike["updatedAt"]): number {
  if (value == null) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/** Current session first, then most recently active first. Does not mutate. */
export function sortSessions<T extends SessionLike>(
  sessions: readonly T[],
  currentId: string | null | undefined,
): T[] {
  return [...sessions].sort((a, b) => {
    if (a.id === currentId && b.id !== currentId) return -1;
    if (b.id === currentId && a.id !== currentId) return 1;
    return toTime(b.updatedAt) - toTime(a.updatedAt);
  });
}
