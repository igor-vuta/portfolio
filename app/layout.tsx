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
     taking the head script down over. On a throw the sequence simply plays. */
  var BOOT_CAP = 900;

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

  // Calibrated against real frame deltas, not guessed. At 60fps an ordinary
  // wheel scroll moves 20-60px per frame and a hard fling 150-250px, so VMAX
  // is set where a fling saturates and everything below it stays on the ramp:
  //
  //   20px/frame -> 1.18    60px/frame -> 1.54    150px/frame -> 2.20
  //
  // The first calibration used VMAX 3, which saturated at 60px/frame — the
  // field sat pinned at peak for all normal scrolling and read as a binary
  // on/off rather than a velocity readout.
  var REST = 1;      // resting gain — the value the CSS already declares
  var PEAK = 2.2;    // gain at or above VMAX
  var VMAX = 8;      // px per ms treated as full deflection
  var DECAY = 0.88;  // per-frame fall-off toward rest
  var TAIL = 200;    // ms the loop keeps running after the last scroll event

  var gain = REST, lastY = 0, lastT = 0, lastScroll = 0, raf = 0, live = false;

  function frame(now) {
    var dt = now - lastT;
    if (dt <= 0) { raf = requestAnimationFrame(frame); return; }

    var y = window.scrollY;
    var target = REST + (PEAK - REST) * Math.min(1, Math.abs(y - lastY) / dt / VMAX);
    lastY = y; lastT = now;

    // Rise immediately to the measured value, fall only at DECAY. Braking
    // hard should not snap the field off — but the fall is a fixed ratio,
    // not an easing over wall-clock time, so it stays frame-rate honest.
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
    lastScroll = performance.now();
    if (live) return;
    live = true;
    lastY = window.scrollY;
    lastT = lastScroll;
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
        <a href="#main" className="skip ctl ctl-primary">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
