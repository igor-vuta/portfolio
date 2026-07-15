import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Flagship from "@/components/Flagship";
import Manifesto from "@/components/Manifesto";
import Projects from "@/components/Projects";
import Credentials from "@/components/Credentials";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import SectionRail from "@/components/SectionRail";

export default function Home() {
  return (
    <main>
      <Nav />
      <ScrollProgress />
      <SectionRail />
      <Hero />
      <Flagship />
      <Manifesto />
      <Projects />
      <Credentials />
      <Footer />
    </main>
  );
}
