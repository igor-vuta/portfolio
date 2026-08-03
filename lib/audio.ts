/* Generative ambient layer — owns every Web Audio object; the UI only calls
   enable()/disable()/pluck(). No AudioContext until a user gesture. */
let ctx: AudioContext | null = null;
let master: GainNode, filter: BiquadFilterNode;
let timer: number | undefined, suspendTimer: number | undefined; // interval / deferred-suspend ids
let nextTime = 0, step = 0, seed = 0x9a4c;

/* Seeded LCG — randomness in feel, reproducible in fact: piece is deterministic. */
const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const gain = (c: AudioContext, v: number) => new GainNode(c, { gain: v });

/* A minor pentatonic, A3–E5, ~44 BPM feel; the fixed sequence (null = rest) loops seamlessly. */
const SCALE = [0, 3, 5, 7, 10, 12, 15, 17, 19].map((s) => 220 * 2 ** (s / 12));
const SEQ = [0, 2, 4, null, 5, 4, 7, null, 3, 5, 8, null, 7, 5, 2, null], STEP = 1.35;

/* Convolver impulse response: 2.5s of exponentially decaying noise. */
function impulse(c: AudioContext): AudioBuffer {
  const buf = c.createBuffer(2, Math.floor(c.sampleRate * 2.5), c.sampleRate);
  for (let ch = 0; ch < 2; ch++)
    buf.getChannelData(ch).forEach((_, i, d) => (d[i] = (rand() * 2 - 1) * (1 - i / d.length) ** 3));
  return buf;
}

/* voices → lowpass → (dry + convolver) → master → out */
function build(): AudioContext {
  const c = new AudioContext();
  master = gain(c, 0);
  filter = new BiquadFilterNode(c, { type: "lowpass", frequency: 1800, Q: 0.4 });
  const verb = new ConvolverNode(c, { buffer: impulse(c) });
  filter.connect(gain(c, 0.5)).connect(master); // dry
  filter.connect(verb).connect(gain(c, 0.55)).connect(master); // wet
  master.connect(c.destination);
  const lfo = new OscillatorNode(c, { frequency: 0.02 }); // slow cutoff drift
  lfo.connect(gain(c, 160)).connect(filter.frequency); // ±160 Hz around the base
  lfo.start();
  return c;
}

function voice(c: AudioContext, freq: number, t: number, peak: number, hold: number) {
  const o = new OscillatorNode(c, { type: "triangle", frequency: freq });
  const g = gain(c, 0);
  g.gain.setValueAtTime(0, t); // anchor, so the ramp starts here, not at 0s
  g.gain.linearRampToValueAtTime(peak, t + 0.45); // slow attack
  g.gain.setTargetAtTime(0, t + hold, 1.1); // long release
  o.connect(g).connect(filter);
  o.start(t);
  o.stop(t + hold + 6); // source nodes free themselves after stop
}

/* Lookahead scheduler: ~1.2s booked on the audio clock — no dropouts, no seam. */
function tick() {
  if (!ctx) return;
  for (; nextTime < ctx.currentTime + 1.2; step += 1, nextTime += STEP) {
    const i = SEQ[step % SEQ.length];
    if (i !== null) voice(ctx, SCALE[i], nextTime + (rand() - 0.5) * 0.04, 0.14, 2.4);
  }
}

/* Deeper page = darker: cutoff eases 2200 Hz → 500 Hz down the document. */
function onScroll() {
  if (!ctx) return;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const p = Math.min(1, Math.max(0, scrollY / max)); // 0 at top → 1 at footer
  filter.frequency.setTargetAtTime(2200 - 1700 * p, ctx.currentTime, 0.6);
}

/* Tab hidden → suspend; visible again → resume (only while enabled). */
const onVisibility = () =>
  void (ctx && (document.hidden ? ctx.suspend() : timer !== undefined && ctx.resume()));

export async function enable(): Promise<void> {
  ctx ??= build(); // reached only from a user-gesture handler
  clearTimeout(suspendTimer);
  await ctx.resume();
  nextTime = Math.max(nextTime, ctx.currentTime + 0.2);
  if (timer === undefined) {
    timer = window.setInterval(tick, 250);
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
  }
  onScroll(); // seat the cutoff before sound arrives
  tick();
  master.gain.setTargetAtTime(0.5, ctx.currentTime, 0.4); // ramp in, never a hard start
}

export function disable(): void {
  if (!ctx || timer === undefined) return;
  clearInterval(timer); timer = undefined;
  removeEventListener("scroll", onScroll);
  document.removeEventListener("visibilitychange", onVisibility);
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.25); // ramp out, never a hard stop…
  suspendTimer = window.setTimeout(() => void ctx?.suspend(), 1600); // …suspend past the tail
}

export function pluck(): void {
  // one soft high note on section entry — punctuation, not melody
  if (!ctx || timer === undefined || document.hidden) return;
  voice(ctx, SCALE[5 + (step % 3)], ctx.currentTime + 0.05, 0.07, 1.2);
}
