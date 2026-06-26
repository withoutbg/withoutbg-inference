"use client";

import { usePasteShortcut } from "@/hooks/usePasteShortcut";

export default function PasteShortcutKbd() {
  const shortcut = usePasteShortcut();

  return (
    <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-1 font-mono text-[10px]">
      {shortcut}
    </kbd>
  );
}
