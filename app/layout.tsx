import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/**
 * Two cuts of one family, self-hosted at build time.
 *
 * The previous build pulled these from fonts.googleapis.com via <link>, which
 * costs a render-blocking stylesheet plus two DNS/TLS round-trips before any
 * text can paint. next/font inlines the @font-face rules and serves the files
 * from our own origin, and `display: swap` guarantees text is readable during
 * the swap rather than invisible.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-sans",
  // Cyrillic appears in no copy on the page; omitting it keeps the payload down.
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

const SITE = "https://igor-vuta.github.io/portfolio";

/**
 * Head script. Runs synchronously before first paint, and does two jobs.
 *
 * 1. Sets `.js`, the gate every content-hiding rule is behind.
 * 2. Drives --grid-gain from scroll velocity.
 *
 * The grid loop lives here rather than in a client component for three
 * reasons, in order of weight:
 *
 *  - It must be reading scroll before hydration. A component mounted after
 *    the bundle parses would miss the first flick of the wheel, which on a
 *    long page is exactly when the field should respond.
 *  - It touches one custom property on one element and never reads the DOM.
 *    Wrapping that in React would mean an effect, a ref, and a re-render
 *    budget for something that must not re-render at all.
 *  - Inline bytes are HTML, not a bundle chunk. The whole loop costs nothing
 *    against First Load JS, and the page has 3 kB of headroom.
 *
 * The gain function is deterministic — gain is a pure function of the scroll
 * delta, the frame delta, and four fixed constants. The same scroll produces
 * the same field on every load. No randomness, no time-of-day term, no state
 * carried across sessions.
 */
const HEAD_SCRIPT = `
document.documentElement.classList.add('js');
(function () {
  var root = document.documentElement;
  var wide = matchMedia('(min-width: 768px)');
  var still = matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Boot ─────────────────────────────────────────────────────────────
     Once per session, capped at 900ms, abandoned on any input.

     Three properties this has to hold, in order of how badly they fail:

      1. It can never withhold content. The markup is complete before this
         runs and every boot rule hangs off a class only this function adds,
         so a thrown exception, a blocked bundle, or scripting being off all
         land on the finished page rather than a blank one.
      2. It must end. The cap is a timeout set in the same breath as the
         class, not a completion callback from an animation that might never
         fire — if any single stage stalls, 900ms still clears it.
      3. It must not fight the reveal observer. On the way out it freezes
         whatever the observer has already marked, so dropping the class
         cannot restart an entrance animation on content already on screen.

     sessionStorage access is wrapped: it throws outright in Safari's private
     mode and under some embedded webviews, and a boot sequence is not worth
     taking the head script down over. On a throw the sequence simply plays.

     The cap is 5400ms because the terminal runs to 4900 and the page's own
     arrival stages finish at 5210. It is a backstop, not the schedule: the
     CSS lifts the overlay on its own, and this only guarantees an end if a
     stage never runs at all. Any key, tap, or wheel ends it immediately, and
     the hint on screen says so — five seconds is a long time to hold someone
     who came to read a CV. */
  var BOOT_CAP = 5400;

  function endBoot() {
    if (!root.classList.contains('boot')) return;
    var seen = document.querySelectorAll('.reveal.is-in');
    for (var i = 0; i < seen.length; i++) seen[i].classList.add('reveal-settled');
    root.classList.remove('boot');
  }

  function startBoot() {
    if (still.matches) return;
    try {
      if (sessionStorage.getItem('booted')) return;
      sessionStorage.setItem('booted', '1');
    } catch (e) {}

    root.classList.add('boot');
    setTimeout(endBoot, BOOT_CAP);

    var skips = ['keydown', 'pointerdown', 'wheel', 'touchstart'];
    function skip() {
      for (var i = 0; i < skips.length; i++) removeEventListener(skips[i], skip);
      endBoot();
    }
    for (var i = 0; i < skips.length; i++) {
      addEventListener(skips[i], skip, { passive: true, once: true });
    }
  }

  startBoot();

  // Velocity is measured between scroll events, not between animation frames.
  //
  // Measuring in the frame loop does not work: the scroll event fires after
  // the position has already moved, so seeding from window.scrollY there
  // makes the first frame's delta always zero. The field then decayed from a
  // resting value it had never left and parked — it only ever responded when
  // scrolling happened to continue across several frames, and a discrete jump
  // (keyboard, scrollbar drag, instant-scroll mouse) produced nothing at all.
  //
  // The event pair carries the real signal. dt is clamped at both ends: a
  // floor because two events can land in the same frame and divide out to a
  // spike, and a ceiling so the first scroll after a long pause is read as a
  // movement rather than washed out by the idle time preceding it.
  //
  // Calibrated against real deltas. During continuous scrolling events fire
  // about once a frame, so these are still per-frame figures:
  //
  //   20px -> 1.18    60px -> 1.54    150px -> 2.20
  //
  // An earlier calibration used VMAX 3, which saturated at 60px and pinned
  // the field at peak for all ordinary scrolling.
  var REST = 1;      // resting gain — the value the CSS already declares
  var PEAK = 2.2;    // gain at or above VMAX
  var VMAX = 8;      // px per ms treated as full deflection
  var DECAY = 0.88;  // per-frame fall-off toward rest
  var TAIL = 200;    // ms the loop keeps running after the last scroll event
  var DT_MIN = 8;    // ms floor — two events in one frame must not spike
  var DT_MAX = 100;  // ms ceiling — a resumed scroll is movement, not idle

  var gain = REST, pending = 0;
  var lastY = 0, lastEventT = 0, lastScroll = 0, raf = 0, live = false;

  function frame(now) {
    // Rise immediately to whatever the events measured since the last frame,
    // fall only at DECAY. Braking hard should not snap the field off — and
    // the fall is a fixed per-frame ratio rather than an easing over
    // wall-clock time, so it stays frame-rate honest.
    var target = REST + (PEAK - REST) * pending;
    pending = 0;

    gain = Math.max(target, REST + (gain - REST) * DECAY);
    root.style.setProperty('--grid-gain', gain.toFixed(3));

    if (gain - REST > 0.004 || now - lastScroll < TAIL) {
      raf = requestAnimationFrame(frame);
    } else {
      live = false;
      root.style.removeProperty('--grid-gain');
    }
  }

  function onScroll() {
    var now = performance.now();
    var y = window.scrollY;

    if (lastEventT) {
      var dt = Math.min(Math.max(now - lastEventT, DT_MIN), DT_MAX);
      var n = Math.min(1, Math.abs(y - lastY) / dt / VMAX);
      // Frames can span several events; the loop should see the fastest of
      // them rather than whichever happened to land last.
      if (n > pending) pending = n;
    }

    lastY = y;
    lastEventT = now;
    lastScroll = now;

    if (live) return;
    live = true;
    raf = requestAnimationFrame(frame);
  }

  var on = false;
  function sync() {
    var want = wide.matches && !still.matches;
    if (want === on) return;
    on = want;
    if (want) {
      addEventListener('scroll', onScroll, { passive: true });
    } else {
      removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      live = false;
      gain = REST;
      // Drop the measurement baseline too. Kept, it would pair a position
      // from before the viewport changed with a timestamp from after it, and
      // the first event on re-attach would measure a jump that never
      // happened — a bright flash on crossing the breakpoint.
      pending = 0;
      lastEventT = 0;
      // Back to the declared resting value, not a stale bright frame.
      root.style.removeProperty('--grid-gain');
    }
  }

  sync();
  wide.addEventListener('change', sync);
  still.addEventListener('change', sync);

  /* ── Dust ─────────────────────────────────────────────────────────────
     Ambient motes drifting behind the content — the one place the design
     rules explicitly permit randomness ("ambient background drift, never
     in anything the user clicks"), so every load scatters differently.

     28 two-pixel squares, each walking its own four-waypoint loop as one
     CSS animation. All motion is transform on composited layers: after
     spawn, no JS runs again, ever. The negative delay starts each mote
     mid-loop, so the field never breathes in unison. Spawned from here
     rather than a component because it costs the bundle nothing and needs
     nothing from React — it is weather, not interface.

     Phones get the field too, by owner decision (2026-08-03) — it is
     composited transforms on 28 tiny layers, not scroll-linked work, and
     it was invisible on exactly the screens most visitors bring. Reduced
     motion still gets nothing, and print and forced colours hide it in
     CSS. During boot the field is held at zero opacity and fades up as
     the terminal lifts. (rnd is declared once, in the trail section below
     — function declarations hoist to this scope.)

     Each mote is a wrapper + inner pair on purpose: the inner element owns
     the CSS wander (compositor, no JS ever), the wrapper owns a second
     transform the pointer loop writes into. One element cannot carry both
     — the animation and the loop would fight over the transform property.

     The interaction has three verbs (owner spec, 2026-08-03): motes near
     the pointer COLLECT — within 130px they are captured and glide to a
     personal orbit point around the cursor, each mote keeping its own
     angle and distance so the cluster reads as a swarm, never a stack.
     Captured motes FOLLOW the pointer through an eased chase. And they
     FALL OFF when outrun: the chase is deliberately slower than a fast
     hand, so when the gap to a mote's orbit point grows too large — or
     the pointer jerks fast enough — the grip breaks. A shed mote does not
     walk home: its home rebases to wherever it was dropped and the wander
     resumes from there, so every interaction permanently rearranges the
     field. Motes outside capture range still get the gentle lean, which
     is elastic — the lean does return, because it never left.

     The loop parks when nothing is still converging: a resting cluster
     around a resting cursor costs nothing, exactly like an empty field.

     Touch is deliberately the smaller gesture (owner spec, 2026-08-03):
     a tap pulses the field — nearby motes lean toward the touch point and
     take their excited colour for a moment, then ease back — but a finger
     never collects. Capture is a cursor behaviour: a cursor is present
     between gestures, so a swarm can follow it; a finger exists only
     during the gesture, and a cluster glued to wherever it last lifted
     reads as debris. pointerdown is listened to alongside pointermove
     because a clean tap barely moves at all. */
  var motes = [];

  /* Every mote takes two colours from the system palette at spawn: --c is
     its resting voice, --ce the one it shifts to as the pointer nears. The
     crossfade itself is CSS (color-mix driven by --p); the loop only eases
     the proximity number. Distribution leans coloured on purpose — at rest
     the field read as one or two visible specks, which is not weather. */
  var PAL = ['#1f1e1d', '#a34928', '#2a7153', '#d99a80'];

  function dust() {
    if (still.matches) return;
    if (document.getElementById('dust')) return;
    var host = document.createElement('div');
    host.id = 'dust';
    host.className = 'dust';
    host.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 28; i++) {
      var wrap = document.createElement('span');
      wrap.className = 'mote-w';
      var lx = rnd(0, 100), ly = rnd(0, 100);
      wrap.style.left = lx.toFixed(2) + '%';
      wrap.style.top = ly.toFixed(2) + '%';
      var m = document.createElement('i');
      m.className = 'mote';
      var s = m.style;
      for (var w = 1; w <= 3; w++) {
        s.setProperty('--dx' + w, rnd(-110, 110).toFixed(0) + 'px');
        s.setProperty('--dy' + w, rnd(-110, 110).toFixed(0) + 'px');
      }
      s.setProperty('--dur', rnd(16, 44).toFixed(1) + 's');
      s.setProperty('--delay', (-rnd(0, 44)).toFixed(1) + 's');
      s.setProperty('--o', rnd(0.16, 0.4).toFixed(3));
      s.setProperty('--s', (2 + Math.floor(rnd(0, 3))) + 'px');
      var ci = Math.random() < 0.45 ? 0 : 1 + Math.floor(rnd(0, 3));
      var ei = (ci + 1 + Math.floor(rnd(0, PAL.length - 1))) % PAL.length;
      s.setProperty('--c', PAL[ci]);
      s.setProperty('--ce', PAL[ei]);
      wrap.appendChild(m);
      host.appendChild(wrap);
      // Personal orbit point: where this mote sits relative to the cursor
      // once caught. A swarm, never a stack.
      var oa = rnd(0, 6.283), or_ = rnd(20, 70);
      motes.push({
        el: wrap, lx: lx / 100, ly: ly / 100,
        ox: 0, oy: 0, p: 0,
        obx: Math.cos(oa) * or_, oby: Math.sin(oa) * or_,
        cap: false, cool: 0
      });
    }
    document.body.appendChild(host);
  }

  var D_R = 260, D_PULL = 22, D_EASE = 0.07, D_IDLE = 2000;
  // Retuned looser after the first hands-on pass read as "too sticky"
  // (owner, 2026-08-03): capture reaches less far, the grip breaks at a
  // shorter gap and a slower flick, the chase lags more, the orbit ring is
  // wider, and the cooldown is longer so a shed stays shed.
  var CAP_R = 100, DROP_R = 170, D_VMAX = 1.8, FOLLOW = 0.09, COOL = 800;
  var dpx = -1e4, dpy = -1e4, dLast = -1e4, dRaf = 0, dLive = false;
  var dTouch = false; // last input was a finger: pulse, never collect

  /* Strafe, don't return. A shed mote keeps the ground it gained: its home
     rebases to wherever it was released — clamped just inside the viewport
     so the field cannot bleed off screen — the offset zeroes against the
     new home in the same write, and the wander simply resumes from there.
     Nothing walks back to a spawn coordinate; the field is permanently
     rearranged by every interaction, which is what makes it dust rather
     than a spring system. */
  function shed(m, now) {
    var nx = Math.min(0.98, Math.max(0.02, m.lx + m.ox / innerWidth));
    var ny = Math.min(0.98, Math.max(0.02, m.ly + m.oy / innerHeight));
    m.lx = nx;
    m.ly = ny;
    m.el.style.left = (nx * 100).toFixed(2) + '%';
    m.el.style.top = (ny * 100).toFixed(2) + '%';
    m.ox = 0;
    m.oy = 0;
    m.el.style.transform = 'translate3d(0,0,0)';
    m.cap = false;
    m.cool = now + COOL;
  }

  function releaseAll(now) {
    for (var i = 0; i < motes.length; i++) {
      if (motes[i].cap) shed(motes[i], now);
    }
  }

  function dustFrame(now) {
    var active = now - dLast < D_IDLE;
    var settling = false;
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      var bx = m.lx * innerWidth, by = m.ly * innerHeight;
      var tx = 0, ty = 0, tp = 0, ease = D_EASE;

      if (m.cap) {
        // Falls off when outrun: the chase lags a fast hand by design, and
        // once the orbit point is more than DROP_R ahead the grip breaks.
        var gx = dpx + m.obx - (bx + m.ox), gy = dpy + m.oby - (by + m.oy);
        if (Math.sqrt(gx * gx + gy * gy) > DROP_R) {
          shed(m, now);
          bx = m.lx * innerWidth;
          by = m.ly * innerHeight;
        }
      } else if (active && !dTouch && now > m.cool) {
        var cx = dpx - (bx + m.ox), cy = dpy - (by + m.oy);
        if (Math.sqrt(cx * cx + cy * cy) < CAP_R) m.cap = true;
      }

      if (m.cap) {
        // Captured: chase the orbit point. Holds through pointer rest —
        // collected dust stays collected until flicked off or outrun.
        tx = dpx + m.obx - bx;
        ty = dpy + m.oby - by;
        tp = 1;
        ease = FOLLOW;
      } else if (active) {
        // Free: the original gentle lean, one proximity number driving
        // pull here and colour/glow in CSS via --p.
        var dx = dpx - bx, dy = dpy - by;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > 1 && d < D_R) {
          tp = (1 - d / D_R) * (1 - d / D_R);
          tx = dx / d * tp * D_PULL;
          ty = dy / d * tp * D_PULL;
        }
      }

      m.ox += (tx - m.ox) * ease;
      m.oy += (ty - m.oy) * ease;
      m.p += (tp - m.p) * 0.1;
      // Still converging on something — offset or colour — keeps the loop
      // alive; a settled cluster around a resting cursor parks it, exactly
      // like an empty field.
      if (
        Math.abs(tx - m.ox) > 0.3 ||
        Math.abs(ty - m.oy) > 0.3 ||
        Math.abs(tp - m.p) > 0.01
      ) {
        settling = true;
      }
      m.el.style.transform =
        'translate3d(' + m.ox.toFixed(1) + 'px,' + m.oy.toFixed(1) + 'px,0)';
      m.el.style.setProperty('--p', m.p.toFixed(3));
    }
    if (active || settling) {
      dRaf = requestAnimationFrame(dustFrame);
    } else {
      dLive = false;
    }
  }

  function onPointer(e) {
    var now = performance.now();
    dTouch = e.pointerType === 'touch';
    // A finger sheds anything a mouse collected earlier on a hybrid
    // device — a cluster cannot follow an input that is about to vanish.
    if (dTouch) releaseAll(now);
    // A violent flick sheds the whole cluster at once, whatever the
    // per-mote distances say.
    if (dLast > 0) {
      var dt = Math.max(8, now - dLast);
      var v = Math.sqrt(
        (e.clientX - dpx) * (e.clientX - dpx) +
        (e.clientY - dpy) * (e.clientY - dpy)
      ) / dt;
      if (v > D_VMAX) releaseAll(now);
    }
    dpx = e.clientX;
    dpy = e.clientY;
    dLast = now;
    if (!dLive && motes.length) {
      dLive = true;
      dRaf = requestAnimationFrame(dustFrame);
    }
  }

  function dustStart() {
    dust();
    if (!still.matches) {
      addEventListener('pointermove', onPointer, { passive: true });
      // A clean tap barely moves; without this, phones would only ever
      // reach the field through an accidental drag.
      addEventListener('pointerdown', onPointer, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    addEventListener('DOMContentLoaded', dustStart);
  } else {
    dustStart();
  }

  /* ── Trail ────────────────────────────────────────────────────────────
     Press a control anywhere in the body and a copy of it lifts off,
     shrinks, and flies a serpentine path to the top of the page — the
     macOS save-to-Dock gesture, pointed at the chrome. In-page jumps wait
     for the flight; nothing else does.

     What flies is a clone of the actual element, carrying its own classes,
     so the ghost is pixel-identical to the control that was pressed — a
     primary button flies as a primary button, a detent as a detent. The
     original dims while its copy is in the air and recovers when the copy
     lands, which is what sells "taken" rather than "duplicated".

     Header controls are exempt. They already live at the top edge; a copy
     flying two pixels up its own faceplate reads as a glitch, not a
     gesture. Their native navigation is untouched.

     The flight is random, per press, at the owner's explicit direction
     (2026-08-03) — a released balloon, not an instrument gesture. This
     consciously overrides the project rule that nothing the user clicks
     may be random; the rule stands everywhere else, this one animation is
     the sanctioned exception. Duration 1.2-1.9s, drift, sway, jitter, and
     rotation are all drawn fresh each time, so no two releases match.

     The wander is structural, not cosmetic. The first balloon overlaid a
     ±90px sway on a straight climb, and at viewport scale that still read
     as a straight shot. Now the path itself is random: 3-5 waypoints drawn
     from the full width of the viewport, threaded with a Catmull-Rom
     spline so the excursions are swings rather than corners. Waypoint
     heights are jiggled hard enough that they occasionally invert — the
     balloon dips before climbing again, a gust rather than a glitch. The
     ghost banks into its turns: rotation is derived from horizontal
     velocity, so it leans the way it is swinging, like the card hanging
     under the balloon. A small fast jitter roughens the spline on top.
     All of it is sampled into 48 keyframes and handed to the Web
     Animations API, so the compositor runs the flight and no JS executes
     per frame — random in shape, still zero-cost in motion.

     External links hold their tab until three quarters of the flight has
     played, then open. Immediate navigation put the whole animation in a
     tab the user had just left; holding to the very end of a 1.9s flight
     punishes the click. Blocker risk is bounded — browsers honour
     window.open for several seconds of transient activation — and if one
     eats it anyway the fallback navigates in place. */
  var T_TOP = 24;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  // Catmull-Rom, one axis. b and c are the segment; a and d shape the
  // tangents, which is what turns a chain of waypoints into one swing.
  function cr(a, b, c, d, t) {
    var t2 = t * t, t3 = t2 * t;
    return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2
      + (3 * b - 3 * c + d - a) * t3);
  }

  function trail(el) {
    var r = el.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;

    var dur = rnd(1000, 2000);
    var span = cy - T_TOP;

    // The route: release point, 3-5 waypoints anywhere across the width,
    // exit anywhere across the top. Heights are jiggled hard enough that
    // consecutive waypoints occasionally invert, which reads as the balloon
    // dipping in a gust before it climbs again.
    var pts = [[cx, cy]];
    var n = 3 + Math.floor(rnd(0, 3));
    for (var i = 1; i <= n; i++) {
      var u = Math.max(0.06, Math.min(0.94, i / (n + 1) + rnd(-0.14, 0.14)));
      pts.push([innerWidth * rnd(0.08, 0.92), cy - span * u]);
    }
    pts.push([innerWidth * rnd(0.08, 0.92), T_TOP]);

    var jitAmp = rnd(5, 12), jitHz = rnd(2.8, 4.8), jitPh = rnd(0, 6.283);

    var ghost = el.cloneNode(true);
    ghost.removeAttribute('id');
    ghost.removeAttribute('href');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.className += ' trail-ghost';
    // Lock the box: out of the layout, the clone would otherwise size to
    // its content and visibly differ from the control it copies.
    ghost.style.left = r.left + 'px';
    ghost.style.top = r.top + 'px';
    ghost.style.width = r.width + 'px';
    ghost.style.height = r.height + 'px';
    document.body.appendChild(ghost);

    var frames = [], STEPS = 48, segs = pts.length - 1, prevX = cx, rot = 0;
    for (var s = 0; s <= STEPS; s++) {
      var t = s / STEPS;
      var g = t * segs;
      var seg = Math.min(Math.floor(g), segs - 1), u = g - seg;
      var p0 = pts[Math.max(0, seg - 1)], p1 = pts[seg],
          p2 = pts[seg + 1], p3 = pts[Math.min(segs, seg + 2)];
      var x = cr(p0[0], p1[0], p2[0], p3[0], u)
        + Math.sin(t * jitHz * 6.283 + jitPh) * jitAmp;
      var y = cr(p0[1], p1[1], p2[1], p3[1], u);
      var sc = 1 - 0.85 * t;
      // Bank into the turn: lean follows horizontal velocity, smoothed so
      // it swings rather than snaps. The card under the balloon, not a
      // tumble.
      rot = rot * 0.7 + Math.max(-16, Math.min(16, (x - prevX) * 0.45)) * 0.3;
      prevX = x;
      frames.push({
        transform: 'translate3d(' + (x - cx).toFixed(1) + 'px,' + (y - cy).toFixed(1) + 'px,0)'
          + ' rotate(' + rot.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')',
        // Full presence for most of the flight, gone in the last stretch —
        // it escapes past the page edge rather than resting on it.
        opacity: t < 0.85 ? 1 : (1 - t) / 0.15
      });
    }

    // Linear timing: the physics is baked into the sampled path itself, and
    // an easing on top would bend the balloon's rise a second time.
    ghost.animate(frames, { duration: dur, easing: 'linear', fill: 'forwards' });

    el.style.opacity = '0.35';
    setTimeout(function () {
      ghost.remove();
      el.style.opacity = '';
    }, dur + 120);

    return dur;
  }

  document.addEventListener('click', function (e) {
    // Every early return here is a case where the browser must be left to do
    // its own thing: reduced motion, a modified click the user expects to
    // open a tab, a middle click, something already handled, or the boot
    // sequence still holding the screen.
    if (still.matches || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (root.classList.contains('boot')) return;

    var el = e.target && e.target.closest ? e.target.closest('a, button') : null;
    if (!el || el.classList.contains('skip')) return;
    // Header controls sit on the top edge already; a copy flying two pixels
    // up its own faceplate reads as a glitch. They navigate natively.
    if (el.closest('header')) return;

    // Preview links belong to the LivePreview sheet, whose slide is its own
    // arrival gesture. Flying a balloon AND opening a sheet is noise, and
    // this handler's deferred window.open would punch a second, real tab
    // through the preview. Before hydration the attribute still exists and
    // this still returns — the link is then a plain new-tab link, which is
    // the correct degraded behaviour, not a gap.
    if (el.hasAttribute('data-preview')) return;

    var href = el.getAttribute('href') || '';
    var anchor = href.charAt(0) === '#' && href.length > 1;
    var target = anchor ? document.getElementById(href.slice(1)) : null;

    if (!target) {
      var dur = trail(el);
      // Only http(s) links into a new tab are held for the flight. mailto
      // and plain buttons keep their own timing — delaying a mail client or
      // an in-place action buys nothing and can only break them.
      if (/^https?:/i.test(href) && el.getAttribute('target') === '_blank') {
        e.preventDefault();
        setTimeout(function () {
          // Never pass 'noopener' in the features string here: it makes
          // window.open return null BY SPEC even on success, which turned
          // the popup-blocked fallback below into "also navigate this tab,
          // every time" — one click, two pages. Severing the opener by hand
          // keeps the return value meaningful.
          var w = window.open(href, '_blank');
          if (w) { try { w.opener = null; } catch (err) {} }
          else location.assign(href);
        }, dur * 0.75);
      }
      return;
    }

    // Ours to time. scrollIntoView rather than assigning location.hash: the
    // hash does nothing when it already matches, so a second press of the
    // same link would play the trail and then sit still. The scroll starts
    // 450ms in rather than after the flight — a 1.9s wait would read as a
    // broken link, and the balloon is position:fixed, so it keeps floating
    // serenely over the page scrolling away beneath it.
    e.preventDefault();
    trail(el);
    setTimeout(function () {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', href);
    }, 450);
  });
})();
`;

export const metadata: Metadata = {
  // Without metadataBase, Next emits relative OG/Twitter URLs, which every
  // scraper resolves against the wrong origin — so link previews silently
  // render with no image and a broken canonical.
  metadataBase: new URL(SITE),
  title: {
    default: "Igor Vuta — Software Developer",
    template: "%s — Igor Vuta",
  },
  description:
    "Software developer in Leicester, UK. Python · TypeScript · FastAPI · Next.js. Builder of Intelli-Factory, a deployed multi-objective supply-chain optimization platform.",
  applicationName: "Igor Vuta — Portfolio",
  authors: [{ name: "Igor Vuta", url: SITE }],
  creator: "Igor Vuta",
  keywords: [
    "software developer",
    "Python",
    "TypeScript",
    "FastAPI",
    "Next.js",
    "multi-objective optimization",
    "NSGA-II",
    "Leicester",
    "graduate developer",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Igor Vuta",
    locale: "en_GB",
    title: "Igor Vuta — Software Developer",
    description:
      "Python · TypeScript · FastAPI · Next.js. Builder of Intelli-Factory — a deployed, benchmarked multi-objective optimization platform.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Igor Vuta — Software Developer",
    description:
      "Python · TypeScript · FastAPI · Next.js. Builder of Intelli-Factory — a deployed, benchmarked multi-objective optimization platform.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  // Matches --color-ground so mobile browser chrome blends with the page
  // instead of drawing a seam above it.
  themeColor: "#eceadf",
  colorScheme: "light",
};

/**
 * Boot terminal.
 *
 * Server-rendered into the document rather than mounted by a component, and
 * hidden by CSS unless `html.boot` is present. Two consequences worth stating:
 * it is on screen at first paint rather than one hydration late, and if the
 * bundle never arrives the class is never set and the overlay is simply never
 * displayed — the page behind it is already complete.
 *
 * Every timing is a fixed offset from the same origin, so the sequence is
 * identical on every load. Nothing here is measured, sampled, or randomised.
 *
 * The figures are real: 107 kB is the actual first-load budget this repo
 * builds to. A boot screen that lies about the thing it is booting would be a
 * strange choice on a portfolio whose whole argument is measurement.
 */
const BOOT_COMMAND = "deploy --target=production";

const BOOT_LINES = [
  { at: 1900, key: "compile", val: "next 15 · typescript · tailwind" },
  { at: 2350, key: "bundle", val: "107 kB first load js" },
  { at: 2800, key: "export", val: "static · prerendered" },
  { at: 3250, key: "upload", val: "github pages" },
  { at: 3700, key: "verify", val: "aa contrast · reduced-motion paths" },
];

function BootTerminal() {
  return (
    // aria-hidden because none of this is content: a screen reader should get
    // the page, not a dramatisation of a deploy. It is never focusable, so it
    // cannot trap keyboard navigation while it is up.
    <div className="boot-term" aria-hidden="true" data-print="hide">
      <div className="boot-term-body">
        <p className="boot-prompt">
          <span className="boot-sigil">$</span>{" "}
          <span
            className="boot-cmd"
            style={{
              // Both derived from the string, so the character count and the
              // step count cannot drift apart when the command is edited.
              ["--cmd-len" as string]: BOOT_COMMAND.length,
              animationTimingFunction: `steps(${BOOT_COMMAND.length}, end)`,
            }}
          >
            {BOOT_COMMAND}
          </span>
          <span className="boot-caret" />
        </p>

        <dl className="boot-out">
          {BOOT_LINES.map((l) => (
            <div
              key={l.key}
              className="boot-line"
              style={{ animationDelay: `${l.at}ms` }}
            >
              <dt className="boot-key">{l.key}</dt>
              <dd className="boot-val">{l.val}</dd>
              <dd className="boot-ok">ok</dd>
            </div>
          ))}
        </dl>

        <p className="boot-line boot-ready" style={{ animationDelay: "4150ms" }}>
          <span className="boot-tick">✓</span> ready — igor-vuta.github.io/portfolio
        </p>

        <p className="boot-skip">press any key to skip</p>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning is scoped to this element's own attributes and
    // does not extend to its children. It is required because the inline script
    // below adds `js` to this className before React hydrates, so the server
    // markup and the live DOM legitimately differ on this one attribute.
    <html
      lang="en-GB"
      className={`${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Inline and synchronous by design — see HEAD_SCRIPT above. Deferring
          it would reintroduce the flash the `.js` gate exists to prevent, and
          would leave the grid field blind for the first scroll of the page.
        */}
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body>
        <BootTerminal />
        <a href="#main" className="skip ctl ctl-primary">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
