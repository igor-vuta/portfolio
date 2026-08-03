import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Flagship from "@/components/Flagship";
import Manifesto from "@/components/Manifesto";
import Projects from "@/components/Projects";
import Credentials from "@/components/Credentials";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import SectionRail from "@/components/SectionRail";
import LivePreview from "@/components/LivePreview";
import AudioToggle from "@/components/AudioToggle";

export default function Home() {
  return (
    <>
      {/* Chrome sits outside <main> so the skip link genuinely skips it —
          landing inside a <main> that still contained the nav would defeat
          the purpose of the link. */}
      <Nav />
      <ScrollProgress />
      <SectionRail />
      <AudioToggle />

      <main id="main" tabIndex={-1}>
        <Hero />
        <Flagship />
        <Manifesto />
        <Projects />
        <Credentials />
      </main>

      {/* Outside <main> deliberately: a <footer> nested inside <main> does not
          expose the contentinfo landmark, so screen-reader users lose the
          standard jump to contact details. */}
      <Footer />

      {/* In-page browser for data-preview links. Chrome, not content — it
          lives outside <main> with the rest of the interface furniture. */}
      <LivePreview />
    </>
  );
}
