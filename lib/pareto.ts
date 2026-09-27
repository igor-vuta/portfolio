/**
 * The Deep GA run's non-dominated set: delivery time (days) against cost
 * (thousand KZT), with the knee point the engine selects and the greedy
 * baseline it is measured against. Real data from the benchmark; drawn by
 * the case study's chart and by the stage tablet's broken screen.
 */
export type Point = { t: number; c: number; knee?: boolean };

/** Non-dominated solutions from the Deep GA run, cost against delivery time. */
export const front: Point[] = [
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

export const greedy = { t: 8.02, c: 21.3 };
