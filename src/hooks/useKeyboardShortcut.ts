"use client";

import { useEffect } from "react";

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { ctrl?: boolean; meta?: boolean; shift?: boolean } = {}
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (options.ctrl && !e.ctrlKey) return;
      if (options.meta && !e.metaKey) return;
      if (options.shift && !e.shiftKey) return;

      if (e.key === key) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, options.ctrl, options.meta, options.shift]);
}
