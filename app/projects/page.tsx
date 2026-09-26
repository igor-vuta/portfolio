import type { Metadata } from "next";
import { ogImage } from "@/lib/seo";
import Projects from "@/components/Projects";
import Relay from "@/components/Relay";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Thirteen projects: seven live and ready to try, from a deployed optimization platform to a Vue component library and a Telegram bot, and six with source or a walkthrough.",
  alternates: { canonical: "/projects/" },
  openGraph: { url: "/projects/", images: [ogImage] },
};

export default function ProjectsPage() {
  return (
    <>
      <Projects />
      <Relay current="/projects/" title="Keep exploring" lede="Another branch, or back to the surface." />
    </>
  );
}
