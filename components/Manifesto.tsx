import Reveal from "@/components/Reveal";
import { flagship } from "@/lib/profile";

export default function Manifesto() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-28">
        <Reveal>
          <p className="max-w-4xl font-serif text-3xl font-medium leading-snug tracking-tight text-ink sm:text-5xl">
            Not promises — <span className="text-clay">measurements.</span>{" "}
            Every metric on this page comes from a 3,600-run benchmark on
            production code, reproducible with a single command.
          </p>
          <a
            href={flagship.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block text-sm font-medium text-clay transition hover:underline"
          >
            Rerun it yourself → benchmark_evaluation.py ↗
          </a>
        </Reveal>
      </div>
    </section>
  );
}
