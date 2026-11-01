import type { Metadata } from "next";
import { ogImage } from "@/lib/seo";
import { projectCounts } from "@/lib/profile";
import Projects from "@/components/Projects";
import Relay from "@/components/Relay";

export const metadata: Metadata = {
  title: "Projects",
  description:
    `${projectCounts.total} projects: ${projectCounts.live} live and ready to try, from a document app and a carpooling app to a deployed optimization platform, and ${projectCounts.rest} with source or a walkthrough.`,
  alternates: { canonical: "/projects/" },
  openGraph: { url: "/projects/", images: [ogImage] },
};

export default function ProjectsPage() {
  return (
    <>
      <Projects />
      <Relay current="/projects/" title="Keep exploring" />
    </>
  );
}
