export function isMacOS(): boolean {
  if (typeof navigator === "undefined") return false;

  return (
    /Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
    /Mac OS X/.test(navigator.userAgent)
  );
}

export function getPasteShortcut(): string {
  return isMacOS() ? "⌘V" : "Ctrl+V";
}
