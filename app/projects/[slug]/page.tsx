import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ogImage } from "@/lib/seo";
import { projects } from "@/lib/profile";
import { Links, Stack } from "@/components/Projects";
import Relay from "@/components/Relay";
import Reveal from "@/components/Reveal";
import Section from "@/components/ui/Section";
import { PageLink } from "@/components/ui/Control";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Params = { params: Promise<{ slug: string }> };

const bySlug = (slug: string) => projects.find((p) => p.slug === slug);

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.filter((p) => p.slug).map((p) => ({ slug: p.slug! }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = bySlug((await params).slug);
  if (!p) return {};
  const url = `/projects/${p.slug}/`;
  return {
    title: p.name,
    description: p.blurb,
    alternates: { canonical: url },
    openGraph: { url, images: [ogImage] },
  };
}

/**
 * A project's own page. These apps forbid framing, so the in-page preview would
 * open blank: real captures stand in for it, and Live opens a tab.
 */
export default async function ProjectPage({ params }: Params) {
  const p = bySlug((await params).slug);
  if (!p) notFound();

  return (
    <>
      <Section id="project" eyebrow={p.eyebrow ?? "Project"} title={p.name} lede={p.blurb}>
        <Reveal>
          <div className="mt-14 flex flex-col items-center gap-6 lg:flex-row lg:items-start">
            <figure className="panel min-w-0 flex-1 overflow-hidden">
              <img
                src={`${base}${p.shot}`}
                alt={p.shotAlt ?? `${p.name} on a desktop screen`}
                width={1600}
                height={958}
                fetchPriority="high"
                decoding="async"
                className="h-auto w-full"
              />
            </figure>
            {p.phone && (
              <figure className="panel w-52 shrink-0 overflow-hidden">
                <img
                  src={`${base}${p.phone}`}
                  alt={`${p.name} on a phone`}
                  width={390}
                  height={844}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full"
                />
              </figure>
            )}
          </div>
        </Reveal>

        {p.credit && <p className="mt-3 text-micro text-fog">{p.credit}</p>}

        <Reveal>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <h3 className="text-display-md font-semibold text-ink">What it does</h3>
              <ul className="mt-5 list-disc space-y-3 pl-5 text-detail text-fog">
                {p.highlights?.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
            <aside className="panel p-6">
              <Stack items={p.stack} className="" />
              {p.note && <p className="mt-5 text-detail text-fog">{p.note}</p>}
              <Links project={p} detail={false} />
              <div className="mt-4">
                <PageLink href="/projects/" size="sm" variant="quiet">
                  All projects
                </PageLink>
              </div>
            </aside>
          </div>
        </Reveal>
      </Section>
      <Relay current="/projects/" title="Keep exploring" />
    </>
  );
}
