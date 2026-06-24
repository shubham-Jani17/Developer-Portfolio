import IntroAnimation from "./Components/IntroAnimation";
import BackgroundFx from "./Components/ParticlesBackground";
import useLiteMode from "./hooks/useLiteMode";
import Navbar from "./Components/Navbar";
import SocialSidebar from "./Components/SocialSidebar";
import BackToTop from "./Components/BackToTop";
import Hero from "./Sections/Hero";
import About from "./Sections/About";
import Skills from "./Sections/Skills";
import Projects from "./Sections/Projects";
import Experience from "./Sections/Experience";
import ResumeCallout from "./Sections/ResumeCallout";
import Contact from "./Sections/Contact";
import Blogs from "./Sections/Blogs";
import Footer from "./Components/Footer";
import { usePortfolio } from "./context/PortfolioContext";
import useRecordVisit from "./hooks/useRecordVisit";

export default function PublicApp() {
  useLiteMode();
  useRecordVisit();
  const { portfolio } = usePortfolio();
  const { sections } = portfolio;

  return (
    <>
      <IntroAnimation />
      <BackgroundFx />
      <Navbar />
      <SocialSidebar />
      <main className="relative w-full overflow-x-clip xl:pl-16">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <ResumeCallout />
        {sections?.blogs && <Blogs />}
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
