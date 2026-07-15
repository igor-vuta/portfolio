type Point = { t: number; c: number; knee?: boolean };

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
const H = 340;
const PAD = { l: 56, r: 20, t: 20, b: 46 };

const tMin = 2.5;
const tMax = 9;
const cMin = 15;
const cMax = 65;

const x = (t: number) => PAD.l + ((t - tMin) / (tMax - tMin)) * (W - PAD.l - PAD.r);
const y = (c: number) => H - PAD.b - ((c - cMin) / (cMax - cMin)) * (H - PAD.t - PAD.b);

export default function ParetoChart() {
  const path = front.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t)},${y(p.c)}`).join(" ");
  const knee = front.find((p) => p.knee)!;

  return (
    <figure className="rounded-2xl border border-line bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Pareto front: delivery time versus cost, Deep GA solutions versus greedy baseline" className="w-full">
        {[20, 30, 40, 50, 60].map((c) => (
          <g key={c}>
            <line x1={PAD.l} y1={y(c)} x2={W - PAD.r} y2={y(c)} stroke="#202a3a" strokeWidth="1" />
            <text x={PAD.l - 8} y={y(c) + 4} textAnchor="end" fontSize="11" fill="#8b95a7">
              {c}k
            </text>
          </g>
        ))}
        {[3, 4, 5, 6, 7, 8, 9].map((t) => (
          <text key={t} x={x(t)} y={H - PAD.b + 18} textAnchor="middle" fontSize="11" fill="#8b95a7">
            {t}d
          </text>
        ))}

        <text x={(PAD.l + W - PAD.r) / 2} y={H - 8} textAnchor="middle" fontSize="12" fill="#8b95a7">
          Delivery time (days)
        </text>
        <text x={14} y={(PAD.t + H - PAD.b) / 2} textAnchor="middle" fontSize="12" fill="#8b95a7" transform={`rotate(-90 14 ${(PAD.t + H - PAD.b) / 2})`}>
          Cost (KZT, thousands)
        </text>

        <path d={path} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="1 0" opacity="0.85" />

        {front.map((p) => (
          <circle key={p.t} cx={x(p.t)} cy={y(p.c)} r={p.knee ? 7 : 4.5} fill={p.knee ? "#f97316" : "#fdba74"} opacity={p.knee ? 1 : 0.85} />
        ))}
        <circle cx={x(knee.t)} cy={y(knee.c)} r="12" fill="none" stroke="#f97316" strokeWidth="1.5" opacity="0.6" />
        <text x={x(knee.t) + 16} y={y(knee.c) - 10} fontSize="12" fill="#e9edf4">
          knee point — selected match
        </text>

        <circle cx={x(greedy.t)} cy={y(greedy.c)} r="6" fill="#8b95a7" />
        <text x={x(greedy.t) - 10} y={y(greedy.c) - 12} textAnchor="end" fontSize="12" fill="#8b95a7">
          greedy baseline (cheapest, slowest)
        </text>
      </svg>
      <figcaption className="mt-3 text-xs leading-relaxed text-fog">
        Illustrative Pareto front from the Deep GA (NSGA-II-style) strategy — each point is a
        non-dominated manufacturer–logistics pairing trading cost against delivery time. Benchmark
        figures shown elsewhere on this page come from the real 3,600-run evaluation.
      </figcaption>
    </figure>
  );
}
