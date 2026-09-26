"use client";

import { useEffect } from "react";

/**
 * The cursor's wake: faint rings spread on the water behind the pointer.
 *
 * Rings are painted at z-index -1, on the water and under every block, so
 * they only show where the pointer is over open water. That is the effect,
 * and it needs no hit-testing: the blocks simply cover the rings under them.
 *
 * Cost is bounded by construction:
 *  - one ring per 70px of pointer travel, never more than one per 90ms;
 *  - at most 10 alive at once, the oldest removed early if needed;
 *  - each ring animates scale and opacity only, and removes itself;
 *  - pointermove is passive and does no layout reads.
 *
 * Mouse only (a finger's path is a scroll, not a wake), and off under
 * reduced motion or when the reader has paused background motion.
 */
const STEP = 70; // px of travel per ring
const GAP = 90; // ms minimum between rings
const MAX = 10;

export default function Wake() {
  useEffect(() => {
    const root = document.documentElement;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const rings: HTMLElement[] = [];
    let lx = -1e4;
    let ly = -1e4;
    let lt = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || still.matches) return;
      if (root.classList.contains("motion-paused") || root.classList.contains("buoy-drag")) return;
      const now = performance.now();
      if (Math.hypot(e.clientX - lx, e.clientY - ly) < STEP || now - lt < GAP) return;
      lx = e.clientX;
      ly = e.clientY;
      lt = now;

      if (rings.length >= MAX) rings.shift()?.remove();
      const ring = document.createElement("span");
      ring.className = "wake";
      ring.setAttribute("aria-hidden", "true");
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      ring.addEventListener(
        "animationend",
        () => {
          ring.remove();
          const i = rings.indexOf(ring);
          if (i >= 0) rings.splice(i, 1);
        },
        { once: true }
      );
      rings.push(ring);
      document.body.appendChild(ring);
    };

    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      removeEventListener("pointermove", onMove);
      rings.forEach((r) => r.remove());
    };
  }, []);

  return null;
}
