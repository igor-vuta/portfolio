import Reveal from "@/components/Reveal";
import { flagship } from "@/lib/profile";

/**
 * Interstitial statement. Deliberately the only band on the page with no
 * panel and no controls beyond a single link: it is a pause between the
 * floating blocks, open water, and giving it furniture would defeat that.
 *
 * Set the way Apple sets its summary paragraphs: the sentence runs in the
 * muted tone and only the claims that carry the argument are lit, so a
 * skim reads the highlights alone and still gets the point.
 */
export default function Manifesto() {
  return (
    <section aria-labelledby="manifesto">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <Reveal>
          <p className="text-body-lg font-medium text-fog">
            Standard of evidence
          </p>

          <h2
            id="manifesto"
            className="display mt-3 text-display-lg text-ink sm:text-display-xl"
          >
            Not promises. Measurements.
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-display-md font-medium text-fog">
            <span className="text-ink">
              Every metric on this page comes from a 3,600-run benchmark
            </span>{" "}
            on production code, and it is{" "}
            <span className="text-ink">reproducible with a single command</span>.
          </p>

          <p className="mt-10">
            <a
              href={flagship.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link readout text-detail"
              translate="no"
            >
              benchmark_evaluation.py
            </a>
            <span className="ml-3 text-detail text-fog">Rerun it yourself.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
