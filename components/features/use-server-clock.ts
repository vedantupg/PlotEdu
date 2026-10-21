"use client";

import { useEffect, useState } from "react";

/**
 * Ticks every second using an offset from the server clock. Resyncs the offset
 * when the tab regains focus or visibility, so a woken phone never shows a stale clock.
 */
export function useServerClock(serverNowMs: number): number {
  const [offset, setOffset] = useState<number>(() => serverNowMs - Date.now());
  const [now, setNow] = useState<number>(serverNowMs);

  useEffect(() => {
    let cancelled = false;
    const tick = (): void => setNow(Date.now() + offset);
    tick();
    const id = window.setInterval(tick, 1000);

    async function resync(): Promise<void> {
      if (document.visibilityState !== "visible") return;
      try {
        const sentAt = Date.now();
        const res = await fetch("/api/time", { cache: "no-store" });
        const { now: server } = (await res.json()) as { now: number };
        const rtt = Date.now() - sentAt;
        if (!cancelled) setOffset(server + rtt / 2 - Date.now());
      } catch {
        // Offline: keep the last known offset.
      }
    }
    document.addEventListener("visibilitychange", resync);
    window.addEventListener("focus", resync);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", resync);
      window.removeEventListener("focus", resync);
    };
  }, [offset]);

  return now;
}
