import type { Metadata } from "next";
import { ogImage } from "@/lib/seo";
import Credentials from "@/components/Credentials";
import Relay from "@/components/Relay";

export const metadata: Metadata = {
  title: "Experience and credentials",
  description:
    "Commercial Python development, operations, and internships at Kaspi Bank and Kazakhfilm, with verified certificates and the full skills matrix.",
  alternates: { canonical: "/experience/" },
  openGraph: { url: "/experience/", images: [ogImage] },
};

export default function ExperiencePage() {
  return (
    <>
      <Credentials />
      <Relay current="/experience/" title="Keep exploring" />
    </>
  );
}
