"use client";

import { useEffect, useRef } from "react";

/**
 * Mounts the WebGL tablet (lib/stage3d) over the CSS stage, as an
 * enhancement. The HTML tablet and orbit cards stay in the page and remain
 * the design wherever this does not run: reduced motion, no WebGL, no JS, and
 * print. Nothing here renders on the server.
 *
 * Once the scene is up it sets `stage-3d-on` on <html>. CSS then hides the
 * HTML device (it keeps its layout box, which the scene reads) and the orbit
 * cards, which are made inert: the same projects are one section below, as
 * real links. The scene talks to the caption by window events, the way the
 * sound and buoy modules do, so neither imports the other:
 *
 *   stage3d:ready   the scene is up; the caption shows its open control
 *   stage3d:toggle  the caption asks the scene to open or close
 *   stage3d:state   the scene reports whether it is open
 *   stage3d:live    the caption switched the real site on or off
 *
 * three.js is imported here, on demand, after the page is interactive, so it
 * never counts toward the first load.
 */
export default function Stage3D() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let destroy: (() => void) | undefined;
    const html = document.documentElement;
    const orbit = el.closest(".stage")?.querySelector(".stage-orbit");

    const start = async () => {
      const { mountStage } = await import("@/lib/stage3d");
      if (cancelled) return;
      const stage = await mountStage(el);
      if (!stage || cancelled) {
        stage?.destroy();
        return;
      }
      html.classList.add("stage-3d-on");
      orbit?.setAttribute("inert", "");
      // The scroll-snap stop just after the pieces land (see .stage-3d-snap).
      const snap = document.createElement("span");
      snap.className = "stage-3d-snap";
      snap.setAttribute("aria-hidden", "true");
      el.closest(".stage")?.appendChild(snap);

      const onToggle = (e: Event) => stage.setOpen((e as CustomEvent<boolean>).detail);
      const onLive = (e: Event) => {
        const live = (e as CustomEvent<boolean>).detail;
        stage.setLive(live);
        html.classList.toggle("stage-3d-live", live);
      };
      window.addEventListener("stage3d:toggle", onToggle);
      window.addEventListener("stage3d:live", onLive);
      window.dispatchEvent(new Event("stage3d:ready"));

      destroy = () => {
        window.removeEventListener("stage3d:toggle", onToggle);
        window.removeEventListener("stage3d:live", onLive);
        html.classList.remove("stage-3d-on", "stage-3d-live");
        orbit?.removeAttribute("inert");
        snap.remove();
        stage.destroy();
      };
    };

    // After the page is idle: the boot sequence and first paint come first.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    idle(() => {
      start().catch(() => {
        /* The HTML stage stays the design. */
      });
    });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return <div ref={root} className="stage-3d" aria-hidden="true" data-print="hide" />;
}
