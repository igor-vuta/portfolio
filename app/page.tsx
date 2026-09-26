import Hero from "@/components/Hero";
import Relay from "@/components/Relay";
import { ExperienceTeaser, FlagshipTeaser, ProjectsTeaser } from "@/components/Teasers";
import DepthGauge from "@/components/DepthGauge";

/**
 * The surface: the dive, condensed. The stage, then the relay where the
 * reader picks a route, then one short chapter per branch, each ending in a
 * link to its full page. Header, water, contact and the rest of the chrome
 * come from the layout and are shared by every page.
 */
export default function Home() {
  return (
    <>
      <DepthGauge />
      <Hero />
      <Relay />
      <FlagshipTeaser />
      <ProjectsTeaser />
      <ExperienceTeaser />
    </>
  );
}
