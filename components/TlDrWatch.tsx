"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Offers the TL;DR to a reader who races to the bottom of a page.
 *
 * "Too fast" is measured as distance, not as sections passed: a jump with
 * End or a dragged scrollbar skips everything in between without any of it
 * ever intersecting, so counting crossings would miss exactly the fastest
 * readers. Instead a passive scroll listener keeps a short ring of
 * (time, position) samples. It writes nothing to the DOM and renders
 * nothing; it only records. When the contact block comes into view, the
 * offer is made if the last 1.5 seconds covered three or more screen
 * heights.
 *
 * Guards against the false positives that matter:
 *  - Nothing counts until the reader has touched the page (wheel, key,
 *    touch, pointer). A browser restoring scroll position on reload is a
 *    jump the reader did not make.
 *  - A deliberate trip to contact is not a skim: following a #contact link
 *    suppresses the offer for a moment.
 *  - Never over the boot sequence, never if the card is already open, and
 *    offered at most once per session; after that, the footer's TL;DR line
 *    is the way to it.
 *
 * The listener detaches for good once the offer is made or the session has
 * already had it.
 */
const KEY = "tldr-offered";
const WINDOW = 1500; // ms of history that counts as "just now"
const SCREENS = 3; // viewport heights within WINDOW that count as racing

export default function TlDrWatch() {
  const path = usePathname();

  // The card links to other pages, and the layout (card included) persists
  // across client-side navigation: close it when the page changes.
  useEffect(() => {
    const pop = document.getElementById("tldr");
    if (pop?.matches(":popover-open")) pop.hidePopover();
  }, [path]);

  // Why it opened is only true for that opening: clear the mark on close, so
  // a later open from the footer does not claim the reader was racing.
  useEffect(() => {
    const pop = document.getElementById("tldr");
    if (!pop) return;
    const onToggle = (e: Event) => {
      if ((e as ToggleEvent).newState === "closed") delete pop.dataset.reason;
    };
    pop.addEventListener("toggle", onToggle);
    return () => pop.removeEventListener("toggle", onToggle);
  }, []);

  useEffect(() => {
    const pop = document.getElementById("tldr");
    const foot = document.getElementById("contact");
    if (!pop || !foot || typeof pop.showPopover !== "function") return;
    try {
      if (sessionStorage.getItem(KEY)) return;
    } catch {}

    const root = document.documentElement;
    const samples: [number, number][] = [];
    let engaged = false;
    let quietUntil = 0;

    const onScroll = () => {
      if (!engaged) return;
      const now = performance.now();
      samples.push([now, scrollY]);
      while (samples.length && now - samples[0][0] > WINDOW) samples.shift();
    };
    const engage = () => {
      engaged = true;
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href$="#contact"]');
      if (a) quietUntil = performance.now() + 2500;
    };

    const offer = () => {
      const now = performance.now();
      if (now < quietUntil || root.classList.contains("boot")) return;
      if (pop.matches(":popover-open")) return;
      const recent = samples.filter(([t]) => now - t <= WINDOW);
      if (recent.length < 2) return;
      const ys = recent.map(([, y]) => y);
      const travelled = Math.max(...ys) - Math.min(...ys);
      if (travelled < innerHeight * SCREENS) return;
      pop.dataset.reason = "fast";
      pop.showPopover();
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      stop();
    };

    const io = new IntersectionObserver(
      ([e]) => {
        // Give the scroll a beat to settle so the whole run is counted.
        if (e.isIntersecting) setTimeout(offer, 120);
      },
      { threshold: 0.15 }
    );

    const inputs = ["wheel", "keydown", "touchstart", "pointerdown"] as const;
    const stop = () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("click", onClick, true);
      inputs.forEach((t) => removeEventListener(t, engage));
    };

    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("click", onClick, true);
    inputs.forEach((t) => addEventListener(t, engage, { passive: true }));
    io.observe(foot);
    return stop;
  }, []);

  return null;
}
