import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import Relay from "@/components/Relay";
import Section from "@/components/ui/Section";
import { PageLink } from "@/components/ui/Control";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * Exported as 404.html, which GitHub Pages serves for any missing path under
 * /portfolio. It keeps the water, header and contact block from the layout,
 * so a mistyped link still lands somewhere on the dive, with every route out.
 */
export default function NotFound() {
  return (
    <>
      <Section
        id="not-found"
        eyebrow="404"
        title="Nothing at this depth."
        lede="The page you followed doesn't exist, or it moved when the site split into branches."
      >
        <Reveal>
          <div className="mt-10">
            <PageLink href="/" variant="primary">
              Back to the surface
            </PageLink>
          </div>
        </Reveal>
      </Section>
      <Relay title="Or pick a route" lede="Every branch of the dive, from here." />
    </>
  );
}
