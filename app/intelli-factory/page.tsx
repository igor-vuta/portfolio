import type { Metadata } from "next";
import { ogImage } from "@/lib/seo";
import Flagship from "@/components/Flagship";
import Manifesto from "@/components/Manifesto";
import Relay from "@/components/Relay";

// Each branch states its own canonical: the layout's "/" would otherwise be
// inherited, and every page would tell search engines it is the home page.
export const metadata: Metadata = {
  title: "Intelli-Factory case study",
  description:
    "Multi-objective supply-chain matching: an NSGA-II genetic algorithm benchmarked at +17.5% composite fitness over a greedy baseline across 3,600 runs, deployed as a three-tier system.",
  alternates: { canonical: "/intelli-factory/" },
  openGraph: { url: "/intelli-factory/", images: [ogImage] },
};

export default function IntelliFactoryPage() {
  return (
    <>
      <Flagship />
      <Manifesto />
      <Relay current="/intelli-factory/" title="Keep exploring" lede="Another branch, or back to the surface." />
    </>
  );
}
