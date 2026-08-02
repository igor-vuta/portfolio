"use client";

import { useEffect, useRef, useState } from "react";

type Point = { t: number; c: number; knee?: boolean };

/** Non-dominated solutions from the Deep GA run, cost against delivery time. */
const front: Point[] = [
  { t: 3.2, c: 60.2 },
  { t: 3.7, c: 57.4 },
  { t: 4.1, c: 54.6 },
  { t: 4.67, c: 51.6, knee: true },
  { t: 5.4, c: 45.8 },
  { t: 6.1, c: 39.9 },
  { t: 7.0, c: 33.2 },
  { t: 7.8, c: 26.4 },
  { t: 8.4, c: 22.9 },
];

const greedy = { t: 8.02, c: 21.3 };

const W = 560;
const H = 360;
const PAD = { l: 58, r: 96, t: 22, b: 52 };

const tMin = 2.5;
const tMax = 9;
const cMin = 15;
const cMax = 65;

const x = (t: number) => PAD.l + ((t - tMin) / (tMax - tMin)) * (W - PAD.l - PAD.r);
const y = (c: number) => H - PAD.b - ((c - cMin) / (cMax - cMin)) * (H - PAD.t - PAD.b);

const yTicks = [20, 30, 40, 50, 60];
const xTicks = [3, 4, 5, 6, 7, 8, 9];

/**
 * Pareto front plot.
 *
 * Accessibility note: the previous version was a bare <svg> with an aria-label,
 * which tells a screen-reader user that a chart exists but nothing about what
 * it shows — the nine solutions and the baseline comparison were unreachable
 * without sight. The SVG is now marked decorative and the same data is exposed
 * as a real table, visually hidden but fully navigable with table commands.
 * The figures are identical because both render from the same array.
 */
export default function ParetoChart() {
  const ref = useRef<HTMLElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDrawn(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setDrawn(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);

    // The plot must never be left undrawn on a viewport that can't reach 30%.
    const timer = window.setTimeout(() => setDrawn(true), 4000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const path = front.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t)},${y(p.c)}`).join(" ");
  const knee = front.find((p) => p.knee)!;

  return (
    <figure ref={ref} className="panel overflow-hidden">
      <div className="border-b border-line px-6 py-3">
        <p className="silk text-fog">Pareto front — Deep GA</p>
      </div>

      <div className="p-4 sm:p-6">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="presentation"
          aria-hidden="true"
          focusable="false"
        >
          {/* Graticule — horizontal rules with tick stubs on the axis. */}
          {yTicks.map((c) => (
            <g key={c}>
              <line
                x1={PAD.l}
                y1={y(c)}
                x2={W - PAD.r}
                y2={y(c)}
                stroke="var(--color-line)"
                strokeWidth="1"
              />
              <line
                x1={PAD.l - 5}
                y1={y(c)}
                x2={PAD.l}
                y2={y(c)}
                stroke="var(--color-line-2)"
                strokeWidth="1"
              />
              <text
                x={PAD.l - 10}
                y={y(c) + 3.5}
                textAnchor="end"
                className="readout"
                fontSize="10"
                fill="var(--color-fog)"
              >
                {c}k
              </text>
            </g>
          ))}

          {xTicks.map((t) => (
            <g key={t}>
              <line
                x1={x(t)}
                y1={H - PAD.b}
                x2={x(t)}
                y2={H - PAD.b + 5}
                stroke="var(--color-line-2)"
                strokeWidth="1"
              />
              <text
                x={x(t)}
                y={H - PAD.b + 18}
                textAnchor="middle"
                className="readout"
                fontSize="10"
                fill="var(--color-fog)"
              >
                {t}d
              </text>
            </g>
          ))}

          {/* Axis spines */}
          <line
            x1={PAD.l}
            y1={PAD.t}
            x2={PAD.l}
            y2={H - PAD.b}
            stroke="var(--color-line-2)"
            strokeWidth="1"
          />
          <line
            x1={PAD.l}
            y1={H - PAD.b}
            x2={W - PAD.r}
            y2={H - PAD.b}
            stroke="var(--color-line-2)"
            strokeWidth="1"
          />

          {/* Axis names, in the silkscreen vocabulary */}
          <text
            x={(PAD.l + W - PAD.r) / 2}
            y={H - 10}
            textAnchor="middle"
            fontSize="9"
            letterSpacing="1.4"
            fill="var(--color-fog)"
            style={{ textTransform: "uppercase" }}
          >
            DELIVERY TIME (DAYS)
          </text>
          <text
            x={13}
            y={(PAD.t + H - PAD.b) / 2}
            textAnchor="middle"
            fontSize="9"
            letterSpacing="1.4"
            fill="var(--color-fog)"
            transform={`rotate(-90 13 ${(PAD.t + H - PAD.b) / 2})`}
          >
            COST (KZT, THOUSANDS)
          </text>

          {/* The front */}
          <path
            d={path}
            fill="none"
            stroke="var(--color-clay)"
            strokeWidth="1.75"
            pathLength={1}
            className={drawn ? "trace trace-drawn" : "trace"}
          />

          {front.map((p, i) => (
            <rect
              key={p.t}
              x={x(p.t) - (p.knee ? 4.5 : 3)}
              y={y(p.c) - (p.knee ? 4.5 : 3)}
              width={p.knee ? 9 : 6}
              height={p.knee ? 9 : 6}
              fill={p.knee ? "var(--color-clay)" : "var(--color-clay-soft)"}
              className={drawn ? "plot-dot plot-dot-in" : "plot-dot"}
              style={{ transitionDelay: `${0.45 + i * 0.08}s` }}
            />
          ))}

          {/* Knee callout — leader line out to the right margin, so the label
              never overlaps the trace at any width. */}
          <circle
            cx={x(knee.t)}
            cy={y(knee.c)}
            r="11"
            fill="none"
            stroke="var(--color-clay)"
            strokeWidth="1"
            className={drawn ? "knee-ring" : "plot-dot"}
          />
          <line
            x1={x(knee.t) + 12}
            y1={y(knee.c)}
            x2={W - PAD.r + 12}
            y2={y(knee.c)}
            stroke="var(--color-line-2)"
            strokeWidth="1"
            strokeDasharray="2 2"
            className={drawn ? "plot-dot plot-dot-in" : "plot-dot"}
            style={{ transitionDelay: "1.3s" }}
          />
          <text
            x={W - PAD.r + 16}
            y={y(knee.c) - 3}
            fontSize="9.5"
            letterSpacing="0.8"
            fill="var(--color-ink)"
            className={drawn ? "plot-dot plot-dot-in" : "plot-dot"}
            style={{ transitionDelay: "1.35s" }}
          >
            KNEE POINT
          </text>
          <text
            x={W - PAD.r + 16}
            y={y(knee.c) + 10}
            fontSize="9.5"
            fill="var(--color-fog)"
            className={`readout ${drawn ? "plot-dot plot-dot-in" : "plot-dot"}`}
            style={{ transitionDelay: "1.4s" }}
          >
            4.67d · 51.6k
          </text>

          {/* Greedy baseline */}
          <path
            d={`M${x(greedy.t) - 4},${y(greedy.c) - 4} L${x(greedy.t) + 4},${y(greedy.c) + 4} M${x(greedy.t) - 4},${y(greedy.c) + 4} L${x(greedy.t) + 4},${y(greedy.c) - 4}`}
            stroke="var(--color-fog)"
            strokeWidth="1.5"
            className={drawn ? "plot-dot plot-dot-in" : "plot-dot"}
            style={{ transitionDelay: "1.5s" }}
          />
          <text
            x={x(greedy.t) - 8}
            y={y(greedy.c) - 9}
            textAnchor="end"
            fontSize="9.5"
            letterSpacing="0.8"
            fill="var(--color-fog)"
            className={drawn ? "plot-dot plot-dot-in" : "plot-dot"}
            style={{ transitionDelay: "1.55s" }}
          >
            GREEDY BASELINE
          </text>
        </svg>

        {/* Legend — stated, not left to be inferred from the shapes. */}
        <ul className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3">
          <li className="silk-sm flex items-center gap-2 text-fog">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 bg-clay-soft"
            />
            Non-dominated solution
          </li>
          <li className="silk-sm flex items-center gap-2 text-fog">
            <span aria-hidden="true" className="h-2 w-2 bg-clay" />
            Knee point — selected
          </li>
          <li className="silk-sm flex items-center gap-2 text-fog">
            <span aria-hidden="true" className="text-[0.85rem] leading-none">
              ✕
            </span>
            Greedy baseline
          </li>
        </ul>
      </div>

      {/* Text alternative: the same numbers, navigable as a table. */}
      <table className="absolute h-px w-px overflow-hidden whitespace-nowrap [clip:rect(0,0,0,0)]">
        <caption>
          Pareto front computed by the Deep GA: cost in thousands of KZT against
          delivery time in days, with the greedy baseline for comparison.
        </caption>
        <thead>
          <tr>
            <th scope="col">Solution</th>
            <th scope="col">Delivery time (days)</th>
            <th scope="col">Cost (thousand KZT)</th>
          </tr>
        </thead>
        <tbody>
          {front.map((p, i) => (
            <tr key={p.t}>
              <th scope="row">
                {p.knee ? `Solution ${i + 1} — knee point, selected` : `Solution ${i + 1}`}
              </th>
              <td>{p.t}</td>
              <td>{p.c}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Greedy baseline</th>
            <td>{greedy.t}</td>
            <td>{greedy.c}</td>
          </tr>
        </tbody>
      </table>

      <figcaption className="border-t border-line px-6 py-4 text-micro text-fog">
        The Deep GA (NSGA-II-style) Pareto front, drawn as the engine computes
        it — each mark is a non-dominated manufacturer–logistics pairing trading
        cost against delivery time. Benchmark figures on this page come from the
        real 3,600-run evaluation.
      </figcaption>
    </figure>
  );
}
