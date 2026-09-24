export function isLessonTranslatePath(pathname: string) {
  return /^\/skills\/[^/]+\/[^/]+/.test(pathname) || /^\/games\/[^/]+$/.test(pathname);
}

export function isTranslateHotkey(event: KeyboardEvent) {
  if (event.isComposing) return false;
  if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey || event.repeat) {
    return false;
  }
  return event.key.toLowerCase() === "e";
}
