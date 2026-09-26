"use client";

import { useState } from "react";
import { ExternalLink } from "@/components/ui/Control";

/**
 * The stage tablet's screen and caption, with a switch between the capture
 * and the real site running inside the device.
 *
 * The iframe is not in the page until asked for: the deployed frontend
 * weighs far more than the screenshot, and most visitors never switch. When
 * it is asked for, the capture stays underneath as the loading state and the
 * frame fades in over it on load, so the tablet never goes blank.
 *
 * Screen and caption share one component because they share one piece of
 * state; the figure around them, and the stage's motion, stay server-side.
 */
export default function LiveDevice({
  name,
  tagline,
  shot,
  alt,
  liveUrl,
}: {
  name: string;
  tagline: string;
  shot: string;
  alt: string;
  liveUrl: string;
}) {
  const [live, setLive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <span className="device">
        <span className="device-screen">
          <img
            src={shot}
            alt={alt}
            width={1366}
            height={1024}
            fetchPriority="high"
            decoding="async"
          />
          {live && (
            <iframe
              src={liveUrl}
              title={`${name}, live`}
              loading="eager"
              referrerPolicy="no-referrer"
              className={loaded ? "is-loaded" : ""}
              onLoad={() => setLoaded(true)}
            />
          )}
        </span>
      </span>

      <figcaption className="stage-caption">
        <p className="text-body-lg font-semibold text-cream">{name}</p>
        <p className="mt-1 text-detail text-fog">
          {tagline}. Deployed on Vercel, Render and Aiven.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className="ctl ctl-primary ctl-sm"
            aria-pressed={live}
            onClick={() => {
              setLive((v) => !v);
              setLoaded(false);
            }}
          >
            {live ? "Show the screenshot" : "Run it on the tablet"}
          </button>
          <ExternalLink href={liveUrl} size="sm" preview previewLabel={name}>
            Full screen
          </ExternalLink>
        </div>
        {/* Announced, because the change happens away from the button. */}
        <p className="sr-only" aria-live="polite">
          {live ? (loaded ? `${name} is running on the tablet.` : `Loading ${name}…`) : ""}
        </p>
      </figcaption>
    </>
  );
}
