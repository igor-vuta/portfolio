"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Opt-in ambient sound toggle.
 *
 * The rules this component exists to enforce:
 *  - Nothing loads until asked. The audio module (`lib/audio`) is dynamically
 *    imported inside the click handler, so neither the code nor an
 *    AudioContext exists before the first deliberate gesture.
 *  - Ineligible environments get nothing: under `prefers-reduced-motion` or
 *    below 768px the component renders null — no button, no listeners, no
 *    context. Same gate pattern as ScrollProgress.
 *  - The choice survives reload via sessionStorage (guarded: it throws in
 *    Safari private mode). A restored "on" cannot autoplay — browsers require
 *    a gesture — so the button shows on and the first interaction anywhere
 *    (pointer or key) actually starts the sound.
 *  - Section entries pluck one soft note. The observer lives here, not in
 *    Reveal, so the audio layer stays fully detachable.
 */
const KEY = "ambient-audio";
const SECTIONS = ["top", "flagship", "projects", "credentials", "contact"];

const store = (v: string) => {
  try {
    sessionStorage.setItem(KEY, v);
  } catch {}
};

export default function AudioToggle() {
  const [eligible, setEligible] = useState(false);
  const [on, setOn] = useState(false);
  const engine = useRef<typeof import("@/lib/audio") | null>(null);
  // Written synchronously in every handler, unlike `on`. Guards the race where
  // the restored-"on" arming gesture is itself the click that turns sound off:
  // by the time the import resolves, the wish may have changed.
  const wantOn = useRef(false);

  const start = async () => {
    engine.current ??= await import("@/lib/audio");
    if (wantOn.current) await engine.current.enable();
  };

  // Eligibility gate. If the viewport narrows or reduced motion is switched on
  // mid-session, sound is stopped and the control removed, not just hidden.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      const ok = wide.matches && !still.matches;
      setEligible(ok);
      if (!ok) {
        wantOn.current = false;
        engine.current?.disable();
        setOn(false);
      }
    };
    sync();
    wide.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  // Restore a persisted "on": show the state now, start sound on the first
  // gesture anywhere (autoplay policy forbids starting without one).
  useEffect(() => {
    if (!eligible) return;
    let stored = null;
    try {
      stored = sessionStorage.getItem(KEY);
    } catch {}
    if (stored !== "1") return;
    wantOn.current = true;
    setOn(true);
    const arm = () => void start();
    window.addEventListener("pointerdown", arm, { once: true });
    window.addEventListener("keydown", arm, { once: true });
    return () => {
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible]);

  // One soft note per section entry, only while sound is on.
  useEffect(() => {
    if (!on || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) engine.current?.pluck();
      },
      { threshold: 0.25 }
    );
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [on]);

  if (!eligible) return null;

  const toggle = async () => {
    if (on) {
      wantOn.current = false;
      engine.current?.disable();
      setOn(false);
      store("0");
    } else {
      wantOn.current = true;
      setOn(true); // optimistic: the ramp-in makes latency inaudible anyway
      store("1");
      await start();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn ambient sound off" : "Turn ambient sound on"}
      title={on ? "Ambient sound: on" : "Ambient sound: off"}
      data-print="hide"
      className={`fixed bottom-5 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 ${
        on
          ? "border-clay bg-clay-wash text-clay"
          : "border-line bg-panel text-fog hover:border-line-2 hover:text-ink"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Speaker body — shared by both states. */}
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor" stroke="none" />
        {on ? (
          <>
            {/* Sound waves: unmistakably "on". */}
            <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
            <path d="M18 7a7 7 0 0 1 0 10" />
          </>
        ) : (
          /* Strike-through: unmistakably "off". */
          <path d="M15 9.5l5 5M20 9.5l-5 5" />
        )}
      </svg>
    </button>
  );
}
