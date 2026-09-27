"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Plate } from "@/components/ui/Section";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type RingProject = {
  name: string;
  shot: string;
  phone?: string;
  liveUrl: string;
};

/**
 * The current: the live projects on a wheel you turn by hand.
 *
 * A CSS 3D wheel rather than a second WebGL scene: the cards stay real
 * elements, so their text is crisp, focus works, and a screen reader gets a
 * list, not a canvas. Drag turns it with momentum and it settles on the
 * nearest card; the arrows, the arrow keys and the names under it turn it
 * too. Only the facing card is in the tab order; clicking a side card turns
 * the wheel to it.
 *
 * Opening the facing card breaks its capture into shards (the stage tablet's
 * gesture, at card scale) and then opens the live preview through the card's
 * own preview link, which LivePreview handles by delegation.
 *
 * The facing project's name, text and links render below the wheel from
 * `details`, one per project, passed in from the server so this stays a thin
 * client shell around server-rendered content.
 */
export default function ProjectRing({
  title,
  projects,
  details,
}: {
  title: string;
  projects: RingProject[];
  details: ReactNode[];
}) {
  const n = projects.length;
  const step = 360 / n;
  const [active, setActive] = useState(0);
  const track = useRef<HTMLUListElement>(null);
  const angle = useRef(0); // degrees, continuous: never wraps, so no spin-back
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Write the wheel's turn straight to the DOM: a drag is sixty updates a
  // second, and none of them needs React.
  const paint = useCallback(
    (deg: number, settle: boolean) => {
      const el = track.current;
      if (!el) return;
      el.style.transition =
        settle && !reduced.current ? "transform 700ms var(--ease-entrance)" : "none";
      el.style.setProperty("--turn", `${-deg}deg`);
      [...el.children].forEach((li, i) => {
        const d = Math.abs((((i * step - deg) % 360) + 540) % 360 - 180);
        (li as HTMLElement).style.setProperty("--facing", String(Math.max(0, 1 - d / 90)));
      });
    },
    [step]
  );

  const goTo = useCallback(
    (i: number) => {
      // Shortest way round from where the wheel is now.
      const current = Math.round(angle.current / step);
      const delta = ((((i - current) % n) + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);
      angle.current = (current + delta) * step;
      paint(angle.current, true);
      setActive(((i % n) + n) % n);
      signal();
    },
    [n, paint, step]
  );

  useEffect(() => paint(0, false), [paint]);

  // A turn sends a signal into the synapse layer from the wheel's centre.
  const signal = useCallback(() => {
    const r = track.current?.getBoundingClientRect();
    if (r) window.dispatchEvent(new CustomEvent("synapse:fire", { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2 } }));
  }, []);

  // Drag, with a throw.
  useEffect(() => {
    const el = track.current?.parentElement;
    if (!el) return;
    let down = false;
    let moved = 0;
    let lastX = 0;
    let v = 0;
    const perPx = () => step / (el.clientWidth * 0.45);

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      down = true;
      moved = 0;
      lastX = e.clientX;
      v = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      // Below the threshold it is a click, and a click must not nudge the
      // wheel off its card.
      if (moved <= 4) return;
      if (!el.hasPointerCapture(e.pointerId)) el.setPointerCapture(e.pointerId);
      v = -dx * perPx();
      angle.current += v;
      paint(angle.current, false);
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (moved <= 4) return;
      const target = Math.round((angle.current + v * 8) / step);
      angle.current = target * step;
      paint(angle.current, true);
      setActive(((target % n) + n) % n);
      signal();
      // The click that ends a drag must not also open the card.
      const swallow = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => removeEventListener("click", swallow, true), 0);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [n, paint, step]);

  const open = (e: React.MouseEvent<HTMLAnchorElement>, i: number) => {
    if (i !== active) {
      e.preventDefault();
      goTo(i);
      return;
    }
    if (reduced.current || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const link = e.currentTarget;
    shatter(link.querySelector(".wheel-shot") as HTMLElement, () => {
      // Re-dispatch as a plain click: LivePreview takes it from here.
      link.dataset.shattered = "";
      link.click();
    });
  };

  return (
    <section className="wheel" aria-roledescription="carousel" aria-label="Live projects">
      <div className="wheel-head">
        <h3 className="text-display-md font-semibold text-ink">{title}</h3>
        <div className="flex shrink-0 gap-2">
          <button type="button" className="ctl ctl-sm" aria-label="Previous project" onClick={() => goTo(active - 1)}>
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" className="ctl ctl-sm" aria-label="Next project" onClick={() => goTo(active + 1)}>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {/* Behind the cards only, sized to the stage and faded out before the
          names and the description below, so it never sits under text. */}
      <Plate name="systems" />
      <div
        className="wheel-stage"
        tabIndex={0}
        aria-label="Live projects, use the arrow keys to turn"
        onKeyDown={(e) => {
          const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!dir) return;
          e.preventDefault();
          const next = (((active + dir) % n) + n) % n;
          goTo(next);
          // If a card had focus, focus follows the wheel: the old card is now
          // out of the tab order and hidden from assistive tech.
          if (e.target !== e.currentTarget) {
            requestAnimationFrame(() =>
              track.current?.children[next]?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true })
            );
          }
        }}
      >
        <ul ref={track} className="wheel-track">
          {projects.map((p, i) => (
            <li
              key={p.name}
              className="wheel-item"
              style={{ "--i": i, "--step": `${step}deg` } as React.CSSProperties}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}: ${p.name}`}
              aria-hidden={i !== active || undefined}
            >
              <a
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="wheel-card"
                data-preview=""
                data-preview-label={p.name}
                // Side cards stay clickable (a click turns the wheel to them)
                // but out of the tab order; the names below reach them.
                tabIndex={i === active ? 0 : -1}
                onClick={(e) => {
                  if (e.currentTarget.dataset.shattered !== undefined) {
                    delete e.currentTarget.dataset.shattered;
                    return;
                  }
                  open(e, i);
                }}
              >
                <span className="wheel-shot">
                  <img src={`${base}${p.shot}`} alt="" width={800} height={500} loading="lazy" decoding="async" />
                </span>
                {p.phone && (
                  <span className="wheel-phone">
                    <img src={`${base}${p.phone}`} alt="" width={390} height={844} loading="lazy" decoding="async" />
                  </span>
                )}
                <span className="sr-only">{p.name}, open a live preview</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="wheel-names" aria-label="Projects on the wheel">
        {projects.map((p, i) => (
          <button
            key={p.name}
            type="button"
            className="wheel-name"
            aria-current={i === active ? "true" : undefined}
            onClick={() => goTo(i)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="wheel-detail" aria-live="polite">
        {details[active]}
      </div>
    </section>
  );
}

/* A capture breaking into shards. Clip-path pieces of the same image, each
   thrown outward and turned with the Web Animations API, over the capture
   itself; the pieces are removed when they land. Transform and opacity
   only, so it stays on the compositor. */
function shatter(host: HTMLElement | null, done: () => void) {
  const img = host?.querySelector("img");
  if (!host || !img) return done();
  const layer = document.createElement("span");
  layer.className = "wheel-shards";
  const cols = 4;
  const rows = 3;
  // A jittered grid, each interior point shared by the pieces around it, so
  // the pieces tile the capture exactly before they move.
  const wobble = () => (Math.random() - 0.5) * 0.5;
  const pts = Array.from({ length: rows + 1 }, (_, r) =>
    Array.from({ length: cols + 1 }, (_, c) => [
      ((c + (c % cols ? wobble() : 0)) / cols) * 100,
      ((r + (r % rows ? wobble() : 0)) / rows) * 100,
    ])
  );
  let finished = 0;
  const total = rows * cols;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const poly = [pts[r][c], pts[r][c + 1], pts[r + 1][c + 1], pts[r + 1][c]];
      const cx = poly.reduce((s, p) => s + p[0], 0) / 4 - 50;
      const cy = poly.reduce((s, p) => s + p[1], 0) / 4 - 50;
      const piece = document.createElement("span");
      piece.className = "wheel-shard";
      piece.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
      piece.style.clipPath = `polygon(${poly.map(([x, y]) => `${x}% ${y}%`).join(",")})`;
      layer.appendChild(piece);
      piece
        .animate(
          [
            { transform: "none", opacity: 1 },
            {
              transform: `translate3d(${cx * 3.2}%, ${cy * 3.2 - 20}%, ${120 + Math.random() * 160}px) rotate3d(${Math.random()}, ${Math.random()}, ${Math.random() - 0.5}, ${40 + Math.random() * 80}deg)`,
              opacity: 0,
            },
          ],
          { duration: 620, easing: "cubic-bezier(0.16, 1, 0.3, 1)", delay: Math.hypot(cx, cy) * 1.6, fill: "forwards" }
        )
        .finished.then(() => {
          if (++finished === total) {
            layer.remove();
            host.classList.remove("is-broken");
          }
        });
    }
  host.classList.add("is-broken");
  host.appendChild(layer);
  setTimeout(done, 380);
}
