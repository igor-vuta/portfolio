"use client";

import { useEffect } from "react";

/**
 * Drag any floating block with the mouse; throw it and it glides on across
 * the water, then drifts slowly back to where it belongs. Styling and the
 * ripple live in BUOYS in globals.css; this only moves things.
 *
 * Delegated, like LivePreview: one listener on the document, and blocks opt
 * in with `data-buoy`, so there is no per-block hydration and a block added
 * later needs nothing wired.
 *
 * Guard rails, in the order they matter:
 *
 *  - Mouse only. On touch and pen a vertical swipe is a scroll; claiming it
 *    would trap the reader inside whichever block they touched first.
 *  - Never from a control. A press that starts on a link, button, or field
 *    belongs to that control, and after a real drag the click that follows
 *    is swallowed so a dragged card never also opens its link.
 *  - A 5px dead zone before anything moves, so an ordinary click (or a
 *    double-click to select a word) stays exactly that.
 *  - A long, loose tether. The first 360px follow the hand exactly; past
 *    that the offset eases toward a further 520px, so an ordinary drag is
 *    completely free and only a hard fling across the page feels the line.
 *    A block can go almost anywhere on screen, but never off it.
 *  - Per frame it writes two properties on one element: `translate` and
 *    `rotate`. Nothing inherited, nothing on the root, no layout read.
 *  - Interruptible. Grab a block while it is still gliding or drifting home
 *    and the hand takes over from where the block actually is, not from
 *    where it started.
 *  - Escape cancels mid-drag and lets the block drift home.
 *
 * The release is one Web Animations call with two segments: a decelerating
 * glide along the throw, then a slow ease back to its place, the way
 * something set down on water keeps going before the current returns it.
 *
 * A drop announces itself as a `buoy:drop` window event. The audio layer
 * listens for it; this component does not know sound exists.
 */
const DEAD = 5; // px before a press becomes a drag
const FREE = 360; // px that follow the hand exactly
const REACH = 520; // how much further the tether lets it go past FREE
const THROW = 260; // ms of glide a release velocity is projected over
const HOME = 2200; // ms for the drift back

function tether(d: number) {
  const m = Math.abs(d);
  if (m <= FREE) return d;
  return Math.sign(d) * (FREE + REACH * (1 - Math.exp(-(m - FREE) / REACH)));
}

/** The block's live offset, including one mid-animation. */
function offsetOf(el: HTMLElement): [number, number, number] {
  const cs = getComputedStyle(el);
  const [x = "0", y = "0"] = cs.translate === "none" ? [] : cs.translate.split(" ");
  const r = cs.rotate === "none" ? 0 : parseFloat(cs.rotate) || 0;
  return [parseFloat(x) || 0, parseFloat(y) || 0, r];
}

export default function Buoys() {
  useEffect(() => {
    const root = document.documentElement;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let el: HTMLElement | null = null;
    let id = -1;
    let x0 = 0;
    let y0 = 0;
    let bx = 0; // where the block already was when grabbed
    let by = 0;
    let tx = 0;
    let ty = 0;
    let tilt = 0;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let vx = 0; // px/ms, smoothed
    let vy = 0;
    let dragging = false;
    let raf = 0;

    const paint = () => {
      raf = 0;
      if (!el) return;
      el.style.translate = `${tx.toFixed(1)}px ${ty.toFixed(1)}px`;
      el.style.rotate = `${tilt.toFixed(2)}deg`;
    };

    const ripple = (target: HTMLElement) => {
      // The waterline: bottom centre of the block, where it meets the water.
      const r = target.getBoundingClientRect();
      const ring = document.createElement("span");
      ring.className = "ripple";
      ring.setAttribute("aria-hidden", "true");
      ring.style.left = `${r.left + r.width / 2}px`;
      ring.style.top = `${Math.min(r.bottom, innerHeight - 24)}px`;
      ring.addEventListener("animationend", () => ring.remove(), { once: true });
      document.body.appendChild(ring);
    };

    const driftHome = (target: HTMLElement, throwX: number, throwY: number) => {
      const from = `${tx.toFixed(1)}px ${ty.toFixed(1)}px`;
      const glide = `${tether(throwX).toFixed(1)}px ${tether(throwY).toFixed(1)}px`;
      const fast = still.matches;
      const anim = target.animate(
        fast
          ? [{ translate: from, rotate: `${tilt}deg` }, { translate: "0px 0px", rotate: "0deg" }]
          : [
              { translate: from, rotate: `${tilt}deg`, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)" },
              { translate: glide, rotate: `${tilt * -0.4}deg`, offset: (THROW * 1.6) / (THROW * 1.6 + HOME), easing: "cubic-bezier(0.45, 0, 0.25, 1)" },
              { translate: "0px 0px", rotate: "0deg" },
            ],
        { duration: fast ? 200 : THROW * 1.6 + HOME }
      );
      // Hand the final state back to the stylesheet: no inline residue.
      target.style.removeProperty("translate");
      target.style.removeProperty("rotate");
      target.classList.add("is-returning");
      anim.addEventListener("finish", () => target.classList.remove("is-returning"));
    };

    const release = (cancelled: boolean) => {
      const target = el;
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onCancel);
      removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      raf = 0;
      el = null;
      if (!target || !dragging) return;
      dragging = false;
      root.classList.remove("buoy-drag");
      target.inert = false;
      target.classList.remove("is-dragging");

      // Project the release velocity forward, so a flick carries. A block
      // let go at rest simply drifts home from where it is.
      const k = cancelled || performance.now() - lastT > 80 ? 0 : THROW;
      driftHome(target, tx + vx * k, ty + vy * k);

      if (!cancelled) {
        ripple(target);
        window.dispatchEvent(new CustomEvent("buoy:drop"));
        // The click the browser fires after this pointerup belongs to the
        // drag, not to whatever the pointer happens to be over. It arrives
        // in the same task as the pointerup; if it never comes (released
        // outside the window), the guard disarms itself rather than eating
        // the reader's next genuine click.
        const swallow = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
        };
        addEventListener("click", swallow, { capture: true, once: true });
        setTimeout(() => removeEventListener("click", swallow, true), 0);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!el || e.pointerId !== id) return;
      const dx = e.clientX - x0;
      const dy = e.clientY - y0;
      if (!dragging) {
        if (Math.hypot(dx, dy) < DEAD) return;
        dragging = true;
        // Take over from wherever the block is right now, glide included.
        [bx, by, tilt] = offsetOf(el);
        // Only our own release animation: the CSS bob also shows up in
        // getAnimations(), and cancelling a CSSAnimation removes it for good.
        el.getAnimations()
          .filter((a) => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
          .forEach((a) => a.cancel());
        el.classList.remove("is-returning");
        root.classList.add("buoy-drag");
        el.classList.add("is-dragging");
        // Inert while held: links and hover states inside the block stand
        // down, so the drag never lights up a control it passes over.
        el.inert = true;
        window.getSelection()?.removeAllRanges();
      }
      tx = tether(bx + dx);
      ty = tether(by + dy);

      const now = performance.now();
      const dt = Math.max(8, now - lastT);
      vx = vx * 0.6 + ((e.clientX - lastX) / dt) * 0.4;
      vy = vy * 0.6 + ((e.clientY - lastY) / dt) * 0.4;
      // Lean into the direction of travel, smoothed so it swings rather than
      // snaps, and capped so text never goes past a gentle list.
      tilt = tilt * 0.8 + Math.max(-6, Math.min(6, (e.clientX - lastX) * 0.35)) * 0.2;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
      if (!raf) raf = requestAnimationFrame(paint);
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId === id) release(false);
    };
    const onCancel = (e: PointerEvent) => {
      if (e.pointerId === id) release(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") release(true);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || el) return;
      const t = e.target as Element | null;
      if (!t?.closest) return;
      if (t.closest("a, button, input, textarea, select, summary, label, [role='button']")) return;
      const block = t.closest<HTMLElement>("[data-buoy]");
      if (!block) return;
      el = block;
      id = e.pointerId;
      x0 = lastX = e.clientX;
      y0 = lastY = e.clientY;
      lastT = performance.now();
      vx = vy = 0;
      addEventListener("pointermove", onMove);
      addEventListener("pointerup", onUp);
      addEventListener("pointercancel", onCancel);
      addEventListener("keydown", onKey);
    };

    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      release(true);
    };
  }, []);

  return null;
}
