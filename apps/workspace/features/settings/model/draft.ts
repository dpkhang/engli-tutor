/** Shallow comparison of a settings draft against its saved value. */
export function isDraftDirty<T extends Record<string, unknown>>(
  draft: T | null | undefined,
  saved: T | null | undefined,
): boolean {
  if (!draft || !saved) return false;
  const keys = new Set([...Object.keys(draft), ...Object.keys(saved)]);
  for (const key of keys) {
    if (!Object.is(draft[key], saved[key])) return true;
  }
  return false;
}
