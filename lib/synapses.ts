/* ═══════════════════════════════════════════════════════════════════════════
   SYNAPSES
   A live neural layer over the water. The caustic light already reads as a
   web of neurons; this makes it answer. A sparse graph of nodes, drawn so
   faintly it disappears behind text, lights up around the pointer, and a
   signal fired into it travels outward along the links, one hop at a time.
   Where a signal reaches a node that sits under a card, the card pulses.

   Signals come from the reader: a click on open water, a card dragged and
   dropped, the project wheel turned, the stage tablet broken open. Anyone
   can fire one with a `synapse:fire` window event carrying {x, y}.

   Plain 2D canvas, no library. It draws only while something is lit or
   travelling and stops the frame loop the moment everything has faded, so
   an idle page costs nothing. Mounted by components/Synapses.tsx, never
   under reduced motion.
   ═══════════════════════════════════════════════════════════════════════════ */

type Node = { x: number; y: number; glow: number; links: number[] };
type Pulse = { from: number; to: number; start: number; strength: number };

/** Elements that answer when a signal arrives under them. */
const TARGETS = ".panel, .door, .wheel-card, .stage-card-body, .ledger-row, .divelog-entry";
const CELL = 120; // one node per cell, jittered
const LINK = 190; // longest link, px
const HOP_MS = 110; // time for a signal to cross one link
const REACH = 170; // pointer glow radius, px

export function mountSynapses(): () => void {
  const canvas = document.createElement("canvas");
  canvas.className = "synapses";
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.print = "hide";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  const css = getComputedStyle(document.documentElement);
  const line = css.getPropertyValue("--color-fog").trim() || "#8fa6ab";
  const lamp = css.getPropertyValue("--color-clay").trim() || "#e38f6c";

  let nodes: Node[] = [];
  let pulses: Pulse[] = [];
  let W = 0;
  let H = 0;
  let dpr = 1;

  // A seeded jittered grid, then each node linked to its nearest neighbours:
  // even enough to cover the page, irregular enough to read as grown.
  const build = () => {
    dpr = Math.min(devicePixelRatio, 2);
    W = innerWidth;
    H = innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    let s = 9;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    nodes = [];
    for (let y = -CELL / 2; y < H + CELL; y += CELL)
      for (let x = -CELL / 2; x < W + CELL; x += CELL)
        nodes.push({ x: x + rnd() * CELL, y: y + rnd() * CELL, glow: 0, links: [] });
    nodes.forEach((n, i) => {
      const near = nodes
        .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
        .filter((o) => o.j !== i && o.d < LINK)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      near.forEach(({ j }) => {
        if (!n.links.includes(j)) n.links.push(j);
        if (!nodes[j].links.includes(i)) nodes[j].links.push(i);
      });
    });
    pulses = [];
    wake();
  };

  const nearest = (x: number, y: number) => {
    let best = 0;
    let bd = Infinity;
    nodes.forEach((n, i) => {
      const d = (n.x - x) ** 2 + (n.y - y) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  };

  // A signal: breadth-first from the nearest node, weaker with every hop,
  // each link crossed once. Arrivals light the node and ping what is on it.
  const fire = (x: number, y: number, strength = 1) => {
    const origin = nearest(x, y);
    const now = performance.now();
    const seen = new Set([origin]);
    let frontier = [origin];
    let hop = 0;
    let power = strength;
    nodes[origin].glow = 1;
    while (frontier.length && power > 0.18 && hop < 8) {
      const next: number[] = [];
      frontier.forEach((i) =>
        nodes[i].links.forEach((j) => {
          if (seen.has(j)) return;
          seen.add(j);
          next.push(j);
          pulses.push({ from: i, to: j, start: now + hop * HOP_MS, strength: power });
        })
      );
      frontier = next;
      hop++;
      power *= 0.8;
    }
    wake();
  };

  // The card answers with a lantern edge. Web Animations rather than a class:
  // a CSS animation would replace the card's own float for the duration.
  const pinged = new WeakSet<Element>();
  const ping = (x: number, y: number) => {
    if (x < 0 || y < 0 || x > W || y > H) return;
    const card = document.elementFromPoint(x, y)?.closest(TARGETS);
    if (!card || pinged.has(card)) return;
    pinged.add(card);
    const rest = getComputedStyle(card).boxShadow;
    const lit = `0 0 0 1px ${lamp}, 0 0 1.5rem -0.25rem rgb(227 143 108 / 0.45)${rest !== "none" ? `, ${rest}` : ""}`;
    card
      .animate([{ boxShadow: rest }, { boxShadow: lit, offset: 0.3 }, { boxShadow: rest }], {
        duration: 700,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      })
      .finished.finally(() => pinged.delete(card));
  };

  // ── Input ─────────────────────────────────────────────────────────────────
  // The pointer lights nodes only on the frames it moves: at rest the glow
  // fades like a wake behind it, and the loop is free to stop.
  let px = 0;
  let py = 0;
  let moved = false;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    px = e.clientX;
    py = e.clientY;
    moved = true;
    wake();
  };
  // Open water only: a click that belongs to a control, a text selection,
  // or a canvas that handles its own pointer is not a signal.
  const onClick = (e: MouseEvent) => {
    const t = e.target as Element;
    if (t.closest("a, button, input, textarea, select, summary, label, canvas, dialog, [popover], [data-buoy]")) return;
    if (getSelection()?.toString()) return;
    fire(e.clientX, e.clientY);
  };
  // The stage tablet breaking open fires from the tablet.
  const onStage = (e: Event) => {
    if (!(e as CustomEvent<{ open: boolean }>).detail.open) return;
    const d = document.querySelector(".stage-device .device")?.getBoundingClientRect();
    if (d) fire(d.left + d.width / 2, d.top + d.height / 2, 1.2);
  };
  const onSignal = (e: Event) => {
    const d = (e as CustomEvent<{ x: number; y: number; strength?: number }>).detail;
    if (d && Number.isFinite(d.x)) fire(d.x, d.y, d.strength ?? 1);
  };
  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(build, 150);
  };

  addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("click", onClick);
  addEventListener("stage3d:state", onStage);
  addEventListener("synapse:fire", onSignal);
  addEventListener("buoy:drop", onSignal);
  addEventListener("resize", onResize);

  // ── Frame ─────────────────────────────────────────────────────────────────
  let raf = 0;
  function wake() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function frame(now: number) {
    raf = 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const hover = moved;
    moved = false;
    let active = false;

    // Glow: pointer proximity, and decay.
    nodes.forEach((n) => {
      if (hover) {
        const d = Math.hypot(n.x - px, n.y - py);
        if (d < REACH) n.glow = Math.max(n.glow, (1 - d / REACH) * 0.55);
      }
      n.glow *= 0.95;
      if (n.glow < 0.01) n.glow = 0;
      else active = true;
    });

    // Links: invisible at rest, lit by the brighter of their two ends.
    ctx.lineWidth = 1;
    ctx.strokeStyle = line;
    nodes.forEach((n, i) =>
      n.links.forEach((j) => {
        if (j < i) return;
        const g = Math.max(n.glow, nodes[j].glow);
        if (g <= 0) return;
        ctx.globalAlpha = g * 0.32;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      })
    );

    // Cell bodies.
    ctx.fillStyle = line;
    nodes.forEach((n) => {
      if (!n.glow) return;
      ctx.globalAlpha = n.glow * 0.7;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.5 + n.glow * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Signals in flight: a warm spark travelling the link.
    ctx.fillStyle = lamp;
    pulses = pulses.filter((p) => {
      const t = (now - p.start) / HOP_MS;
      if (t < 0) {
        active = true;
        return true;
      }
      const a = nodes[p.from];
      const b = nodes[p.to];
      if (t >= 1) {
        b.glow = Math.max(b.glow, p.strength * 0.9);
        ping(b.x, b.y);
        return false;
      }
      active = true;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      ctx.globalAlpha = p.strength * 0.9;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });

    ctx.globalAlpha = 1;
    if (active) raf = requestAnimationFrame(frame);
  }

  build();

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(resizeTimer);
    removeEventListener("pointermove", onMove);
    document.removeEventListener("click", onClick);
    removeEventListener("stage3d:state", onStage);
    removeEventListener("synapse:fire", onSignal);
    removeEventListener("buoy:drop", onSignal);
    removeEventListener("resize", onResize);
    canvas.remove();
  };
}
