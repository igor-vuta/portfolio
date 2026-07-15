import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Flagship from "@/components/Flagship";
import Projects from "@/components/Projects";
import Credentials from "@/components/Credentials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Flagship />
      <Projects />
      <Credentials />
      <Footer />
    </main>
  );
}
