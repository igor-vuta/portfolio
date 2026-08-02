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
