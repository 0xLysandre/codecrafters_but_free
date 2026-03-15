"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Auto-save hook that saves code snapshots every 30 seconds.
 */
export function useAutoSave(
  stageId: string,
  language: string,
  files: Record<string, string>,
  enabled: boolean = true
) {
  const lastSavedRef = useRef<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(async () => {
    const serialized = JSON.stringify(files);
    if (serialized === lastSavedRef.current) return;

    try {
      await fetch(`/api/snapshots/${stageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, files }),
      });
      lastSavedRef.current = serialized;
    } catch {
      // Silently fail — auto-save is best-effort
    }
  }, [stageId, language, files]);

  useEffect(() => {
    if (!enabled) return;

    timerRef.current = setInterval(save, 30000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [save, enabled]);

  return { save };
}
