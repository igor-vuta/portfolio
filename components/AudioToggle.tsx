"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Opt-in ambient sound toggle.
 *
 * The rules this component exists to enforce:
 *  - No AudioContext exists before the first deliberate gesture. The module
 *    code itself, though, preloads as soon as the control is eligible: iOS
 *    Safari's transient activation does not survive a chunk fetch, so
 *    importing inside the click handler meant the context was created after
 *    the gesture expired — born suspended, resume() refused, silence. With
 *    the module already resolved, `??=` skips the await and `enable()` runs
 *    inside the same activation.
 *  - Under `prefers-reduced-motion` the component renders null — no button,
 *    no listeners, no context. The width gate it once shared with the
 *    scroll-linked systems is gone by owner decision (2026-08-03): sound is
 *    not scroll-linked work, phones handle one oscillator graph without
 *    breaking a sweat, and a phone listener was the request.
 *  - The choice survives reload via sessionStorage (guarded: it throws in
 *    Safari private mode). A restored "on" cannot autoplay — browsers require
 *    a gesture — so the button shows on and the first interaction anywhere
 *    (pointer or key) actually starts the sound.
 *  - Section entries drop one soft bubble; a dragged block splashes down. The observer lives here, not in
 *    Reveal, so the audio layer stays fully detachable.
 */
const KEY = "ambient-audio";
const ASKED = "ambient-asked";
const SECTIONS = ["top", "flagship", "projects", "credentials", "contact"];

const store = (v: string) => {
  try {
    sessionStorage.setItem(KEY, v);
  } catch {}
};

export default function AudioToggle() {
  const [eligible, setEligible] = useState(false);
  const [on, setOn] = useState(false);
  const [asking, setAsking] = useState(false);
  const engine = useRef<typeof import("@/lib/audio") | null>(null);
  // Written synchronously in every handler, unlike `on`. Guards the race where
  // the restored-"on" arming gesture is itself the click that turns sound off:
  // by the time the import resolves, the wish may have changed.
  const wantOn = useRef(false);

  const start = async () => {
    engine.current ??= await import("@/lib/audio");
    if (wantOn.current) await engine.current.enable();
  };

  // Preload the engine code the moment the control can exist, so the enabling
  // tap is never spent waiting on a network fetch (see header). Creating an
  // AudioContext still waits for a gesture — this only warms the import.
  useEffect(() => {
    if (!eligible) return;
    void import("@/lib/audio").then((m) => {
      engine.current ??= m;
    });
  }, [eligible]);

  // Eligibility gate. If reduced motion is switched on mid-session, sound is
  // stopped and the control removed, not just hidden.
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      const ok = !still.matches;
      setEligible(ok);
      if (!ok) {
        wantOn.current = false;
        engine.current?.disable();
        setOn(false);
      }
    };
    sync();
    still.addEventListener("change", sync);
    return () => still.removeEventListener("change", sync);
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
    // pointerup, not pointerdown: WebKit grants user activation on the
    // release, so arming on the press could still leave resume() refused.
    window.addEventListener("pointerup", arm, { once: true });
    window.addEventListener("keydown", arm, { once: true });
    return () => {
      window.removeEventListener("pointerup", arm);
      window.removeEventListener("keydown", arm);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible]);

  // The offer. Asked exactly once per session, and timed to the moment the
  // boot terminal lifts — mid-boot the question would sit on top of the
  // arrival sequence, and later it would interrupt reading. Boot's end is
  // observed via the html class rather than a timer so skip-by-keypress and
  // the 5.4s cap both count, and via MutationObserver rather than the
  // transition's end for the same reason the preview sheet watches
  // attributes: mutation records ride microtasks and cannot be starved in a
  // throttled tab. Never asked when a choice (or an ask) already happened
  // this session, and never on ineligible viewports.
  useEffect(() => {
    if (!eligible) return;
    let stored: string | null = null;
    let asked: string | null = null;
    try {
      stored = sessionStorage.getItem(KEY);
      asked = sessionStorage.getItem(ASKED);
    } catch {}
    if (stored !== null || asked !== null) return;

    const root = document.documentElement;
    const ask = () => {
      try {
        sessionStorage.setItem(ASKED, "1");
      } catch {}
      setAsking(true);
    };

    // On a phone the offer is the first thing in view, and the headline it
    // covered is the one thing the page most needs read. There it waits until
    // the reader has scrolled half a screen past the hero.
    const narrow = window.matchMedia("(max-width: 767px)");
    const past = () => window.scrollY > window.innerHeight / 2;
    const onScroll = () => {
      if (!past()) return;
      window.removeEventListener("scroll", onScroll);
      ask();
    };
    const show = () => {
      if (!narrow.matches || past()) return ask();
      window.addEventListener("scroll", onScroll, { passive: true });
    };

    const mo = new MutationObserver(() => {
      if (!root.classList.contains("boot")) {
        mo.disconnect();
        show();
      }
    });
    if (root.classList.contains("boot")) {
      mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    } else {
      show();
    }
    return () => {
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [eligible]);

  // A block set back down on the water splashes. Buoys announces drops as a
  // window event, so neither module imports the other.
  useEffect(() => {
    if (!on) return;
    const onDrop = () => engine.current?.splash();
    // The stage tablet breaking open (Stage3D reports it) cracks and rings.
    const onStage = (e: Event) => {
      if ((e as CustomEvent<{ open: boolean }>).detail.open) engine.current?.shatter();
    };
    window.addEventListener("buoy:drop", onDrop);
    window.addEventListener("stage3d:state", onStage);
    return () => {
      window.removeEventListener("buoy:drop", onDrop);
      window.removeEventListener("stage3d:state", onStage);
    };
  }, [on]);

  // One soft drop per section entry, only while sound is on.
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

  const openOffer = (el: HTMLElement | null) => {
    if (el?.showPopover && !el.matches(":popover-open")) el.showPopover();
  };

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

  // The offer hangs below the header controls on desktop and docks to the
  // bottom of the screen on a phone (.sound-offer). It is a manual popover so
  // it renders in the top layer: the header's backdrop-filter makes it the
  // containing block for anything fixed inside it, which would pin a bottom
  // sheet to the header instead of the screen. It is mounted only while
  // asking, so without popover support it still disappears once answered. The live region sits
  // outside the popover and is always mounted: text inserted into a hidden
  // popover is not reliably announced when the popover then opens.
  return (
    <div className="relative">
      <span className="sr-only" aria-live="polite">
        {asking ? "Ambient sound is available. Enable it or say no thanks." : ""}
      </span>
      {asking && (
        <aside
          ref={openOffer}
          popover="manual"
          aria-label="Ambient sound offer"
          data-print="hide"
          className="sound-offer panel p-4"
        >
          <p className="silk-sm text-fog">Ambient sound</p>
          <p className="mt-2 text-detail text-fog">
            Generated water: a slow swell, lapping, and the odd bubble. No
            files, no tracking, one tap to silence. Enable it?
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="ctl ctl-primary ctl-sm"
              onClick={() => {
                setAsking(false);
                // The click on this button is the user gesture the autoplay
                // policy wants; toggle() routes through the same path as the
                // speaker control so there is exactly one way sound starts.
                void toggle();
              }}
            >
              Enable
            </button>
            <button
              type="button"
              className="ctl ctl-quiet ctl-sm"
              onClick={() => {
                setAsking(false);
                store("0");
              }}
            >
              No thanks
            </button>
          </div>
        </aside>
      )}

    {/* One stable name, state in aria-pressed. A label that flips with the
        state double-reports it: "Turn ambient sound off, pressed". */}
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label="Ambient sound"
      title={on ? "Ambient sound: on" : "Ambient sound: off"}
      data-print="hide"
      className="ctl ctl-icon"
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
    </div>
  );
}
