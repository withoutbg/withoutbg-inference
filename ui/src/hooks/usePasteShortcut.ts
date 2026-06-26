"use client";

import { useEffect, useState } from "react";
import { getPasteShortcut } from "@/lib/platform";

export function usePasteShortcut(): string {
  const [shortcut, setShortcut] = useState("Ctrl+V");

  useEffect(() => {
    setShortcut(getPasteShortcut());
  }, []);

  return shortcut;
}
