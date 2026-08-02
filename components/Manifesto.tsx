import Reveal from "@/components/Reveal";
import { flagship } from "@/lib/profile";

/**
 * Interstitial statement. Deliberately the only band on the page with no
 * panel, no index, and no controls beyond a single link — it is a pause
 * between instruments, and giving it furniture would defeat that.
 */
export default function Manifesto() {
  return (
    <section aria-labelledby="manifesto" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="silk mb-8 text-fog">Standard of evidence</p>

          <p
            id="manifesto"
            className="display max-w-4xl text-display-md sm:text-display-lg"
          >
            Not promises — <span className="text-clay">measurements.</span> Every
            metric on this page comes from a 3,600-run benchmark on production
            code, reproducible with a single command.
          </p>

          <p className="mt-8">
            <a
              href={flagship.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link readout text-detail"
            >
              benchmark_evaluation.py
            </a>
            <span className="ml-3 text-detail text-fog">— rerun it yourself</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
