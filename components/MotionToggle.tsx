"use client";

import { useEffect, useState } from "react";

/**
 * Pause the ambient motion: the water, the bubbles, and the bobbing blocks.
 *
 * WCAG 2.2.2 asks for a way to pause anything that moves on its own for
 * more than five seconds alongside content, and reduced motion alone does
 * not meet it: plenty of readers want the motion off without changing an
 * OS-wide setting, or only for this page.
 *
 * It sets one class on <html>; CSS pauses the loops in place with
 * animation-play-state, so nothing jumps back to a start frame. The pinned
 * stage is deliberately not included: it only moves when the reader
 * scrolls, which is the reader's own input.
 *
 * Renders nothing under prefers-reduced-motion, where those loops are
 * already off. The choice survives reload for the session, guarded because
 * sessionStorage throws in Safari private mode.
 */
const KEY = "ambient-motion";

export default function MotionToggle() {
  const [eligible, setEligible] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEligible(!still.matches);
    sync();
    still.addEventListener("change", sync);
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(KEY);
    } catch {}
    if (stored === "paused") setPaused(true);
    return () => still.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("motion-paused", paused);
    try {
      sessionStorage.setItem(KEY, paused ? "paused" : "running");
    } catch {}
  }, [paused]);

  if (!eligible) return null;

  return (
    <button
      type="button"
      onClick={() => setPaused((p) => !p)}
      aria-pressed={paused}
      aria-label={paused ? "Resume background motion" : "Pause background motion"}
      title={paused ? "Background motion: paused" : "Background motion: on"}
      data-print="hide"
      data-no-trail=""
      className={`flex h-9 w-9 items-center justify-center rounded-[2px] border transition-colors duration-200 ${
        paused
          ? "border-clay bg-clay-wash text-clay"
          : "border-line bg-panel text-fog hover:border-line-2 hover:text-ink"
      }`}
    >
      {/* Drawn from boxes rather than an icon path: two bars for pause, a
          border triangle for play. Decorative; the label carries meaning. */}
      {paused ? (
        <span
          aria-hidden="true"
          className="ml-0.5 h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-current"
        />
      ) : (
        <span aria-hidden="true" className="flex gap-[3px]">
          <span className="h-3 w-[3px] bg-current" />
          <span className="h-3 w-[3px] bg-current" />
        </span>
      )}
    </button>
  );
}
