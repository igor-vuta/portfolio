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
          Sets `.js` on <html> before first paint. Everything that hides content
          for animation is gated behind this class, so if the bundle fails to
          load, is blocked, or scripting is disabled, the page renders in full
          rather than blank. Inline and synchronous by design — deferring it
          would reintroduce the flash it exists to prevent.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
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
