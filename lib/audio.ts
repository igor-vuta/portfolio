/* Generative water layer: owns every Web Audio object; the UI only calls
   enable()/disable()/pluck()/splash(). No AudioContext until a user gesture,
   no audio files: everything is synthesised from one looped noise buffer and
   a few sine blips.

   Three voices, matching what is on screen:
     swell    brown noise, low-passed, its level rolled by two slow LFOs:
              open water breathing under the page.
     lap      the same noise through a band-pass, in irregular soft bursts:
              water against the floating blocks.
     bubble   a sine that sweeps UP in pitch as it dies away. That rising
              blip is the sound a small bubble makes as it collapses, and
              it is what makes the bed read as water rather than wind. */
let ctx: AudioContext | null = null;
let master: GainNode, depth: BiquadFilterNode, wet: ConvolverNode, noise: AudioBuffer;
let timer: number | undefined, suspendTimer: number | undefined; // interval / deferred-suspend ids
let nextLap = 0, nextBubble = 0, seed = 0x9a4c;

/* Seeded LCG: randomness in feel, reproducible in fact. */
const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const between = (a: number, b: number) => a + (b - a) * rand();
const gain = (c: AudioContext, v: number) => new GainNode(c, { gain: v });

/* 4s of stereo brown noise: integrated white noise with a leak, so it has
   the weight of water rather than the hiss of white noise. Looped, the seam
   is inaudible because noise has no phase to break. */
function brown(c: AudioContext): AudioBuffer {
  const buf = c.createBuffer(2, c.sampleRate * 4, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      last = (last + 0.02 * (rand() * 2 - 1)) / 1.02;
      d[i] = last * 3.5;
    }
  }
  return buf;
}

/* Convolver impulse response: 2.5s of exponentially decaying noise, the
   space the bubbles and laps ring in. */
function impulse(c: AudioContext): AudioBuffer {
  const buf = c.createBuffer(2, Math.floor(c.sampleRate * 2.5), c.sampleRate);
  for (let ch = 0; ch < 2; ch++)
    buf.getChannelData(ch).forEach((_, i, d) => (d[i] = (rand() * 2 - 1) * (1 - i / d.length) ** 3));
  return buf;
}

function loop(c: AudioContext) {
  const src = new AudioBufferSourceNode(c, { buffer: noise, loop: true });
  src.start(0, rand() * 4);
  return src;
}

/* swell → depth lowpass → master;  laps, bubbles → depth + verb → master */
function build(): AudioContext {
  const c = new AudioContext();
  noise = brown(c);
  master = gain(c, 0);
  master.connect(c.destination);

  depth = new BiquadFilterNode(c, { type: "lowpass", frequency: 1400, Q: 0.3 });
  depth.connect(master);
  wet = new ConvolverNode(c, { buffer: impulse(c) });
  wet.connect(gain(c, 0.45)).connect(master);

  // The swell: two noise sheets, panned apart, each breathing on its own
  // slow LFO so the sea never inhales in step with itself.
  for (const [pan, rate] of [[-0.6, 0.071], [0.6, 0.113]] as const) {
    const lvl = gain(c, 0.22);
    const lfo = new OscillatorNode(c, { frequency: rate });
    lfo.connect(gain(c, 0.14)).connect(lvl.gain);
    lfo.start();
    loop(c)
      .connect(new BiquadFilterNode(c, { type: "lowpass", frequency: 480 }))
      .connect(lvl)
      .connect(new StereoPannerNode(c, { pan }))
      .connect(depth);
  }
  return c;
}

/* One lap: a soft band-passed rise and fall, placed somewhere in the field. */
function lap(c: AudioContext, t: number) {
  const g = gain(c, 0);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(between(0.05, 0.11), t + between(0.25, 0.5));
  g.gain.setTargetAtTime(0, t + 0.6, 0.45);
  const src = loop(c);
  src
    .connect(new BiquadFilterNode(c, { type: "bandpass", frequency: between(650, 1100), Q: 0.9 }))
    .connect(g)
    .connect(new StereoPannerNode(c, { pan: between(-0.8, 0.8) }))
    .connect(depth);
  g.connect(wet);
  src.stop(t + 4);
}

/* One bubble: a short sine whose pitch climbs as it fades. */
function bubble(c: AudioContext, t: number, f0: number, peak: number) {
  const o = new OscillatorNode(c, { frequency: f0 });
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f0 * 2.3, t + 0.09);
  const g = gain(c, 0);
  g.gain.setValueAtTime(0, t); // anchor, so the ramp starts here, not at 0s
  g.gain.linearRampToValueAtTime(peak, t + 0.006);
  g.gain.setTargetAtTime(0, t + 0.01, 0.035);
  const p = new StereoPannerNode(c, { pan: between(-0.7, 0.7) });
  o.connect(g).connect(p);
  p.connect(depth);
  p.connect(wet);
  o.start(t);
  o.stop(t + 0.4); // source nodes free themselves after stop
}

/* Lookahead scheduler: ~1.2s booked on the audio clock, no dropouts. Laps
   and bubble clusters arrive at irregular intervals, never on a grid. */
function tick() {
  if (!ctx) return;
  const horizon = ctx.currentTime + 1.2;
  for (; nextLap < horizon; nextLap += between(2.2, 5.5)) lap(ctx, nextLap);
  for (; nextBubble < horizon; nextBubble += between(2.5, 8)) {
    const n = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++)
      bubble(ctx, nextBubble + i * between(0.06, 0.2), between(520, 1150), 0.045);
  }
}

/* Deeper page = deeper water: the whole field darkens 1400 Hz → 380 Hz down
   the document, as if the reader were sinking. Writes an audio parameter
   only; nothing in the DOM is touched. */
function onScroll() {
  if (!ctx) return;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const p = Math.min(1, Math.max(0, scrollY / max)); // 0 at top → 1 at footer
  depth.frequency.setTargetAtTime(1400 - 1020 * p, ctx.currentTime, 0.6);
}

/* Tab hidden → suspend; visible again → resume (only while enabled). */
const onVisibility = () =>
  void (ctx && (document.hidden ? ctx.suspend() : timer !== undefined && ctx.resume()));

export async function enable(): Promise<void> {
  /* iOS routes Web Audio through the "ambient" session, which the hardware
     ringer switch mutes; opting into "playback" (Safari/iOS 16.4+) lifts
     that. Elsewhere navigator.audioSession is absent and this is a no-op. */
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  if (nav.audioSession) nav.audioSession.type = "playback";
  ctx ??= build(); // reached only from a user-gesture handler
  clearTimeout(suspendTimer);
  await ctx.resume();
  nextLap = Math.max(nextLap, ctx.currentTime + 0.4);
  nextBubble = Math.max(nextBubble, ctx.currentTime + 1.5);
  if (timer === undefined) {
    timer = window.setInterval(tick, 250);
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
  }
  onScroll(); // seat the depth before sound arrives
  tick();
  master.gain.setTargetAtTime(0.55, ctx.currentTime, 0.8); // the tide comes in, never a hard start
}

export function disable(): void {
  if (!ctx || timer === undefined) return;
  clearInterval(timer); timer = undefined;
  removeEventListener("scroll", onScroll);
  document.removeEventListener("visibilitychange", onVisibility);
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.25); // ramp out, never a hard stop…
  suspendTimer = window.setTimeout(() => void ctx?.suspend(), 1600); // …suspend past the tail
}

const live = () => ctx && timer !== undefined && !document.hidden;

/** One deeper drop on section entry: punctuation, not melody. */
export function pluck(): void {
  if (!live()) return;
  bubble(ctx!, ctx!.currentTime + 0.03, between(300, 420), 0.07);
}

/** A block set back down on the water: a lap and a pair of bubbles. */
export function splash(): void {
  if (!live()) return;
  const t = ctx!.currentTime + 0.02;
  lap(ctx!, t);
  bubble(ctx!, t + 0.05, between(380, 520), 0.06);
  bubble(ctx!, t + 0.16, between(700, 950), 0.035);
}
