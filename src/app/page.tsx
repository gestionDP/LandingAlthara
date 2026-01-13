import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WhatIsAlthara from '@/components/WhatIsAlthara';
import VideoSection from '@/components/VideoSection';
import HowItWorks from '@/components/HowItWorks';
import RulesOfTheGame from '@/components/RulesOfTheGame';
import OurProcess from '@/components/OurProcess';
import Reveal from '@/components/Reveal';
import WhoIsItFor from '@/components/WhoIsItFor';
import FinalCta from '@/components/FinalCta';
import SuccessCases from '@/components/SuccessCases';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-althara-dark-blue">
      <Navbar />

      {/* Hero con video de fondo */}
      <Hero />

      {/* Sección con texto sobre imagen */}
      <WhatIsAlthara />

      {/* Sección solo video */}
      <VideoSection
        videoSrc="/videos/2.mp4"
        overlay={true}
        overlayOpacity={0.5}
        className="h-[60vh]"
      />

      {/* Sección con texto sobre imagen */}
      <HowItWorks />

      {/* Sección con texto sobre video */}
      <RulesOfTheGame />

      {/* Sección con texto sobre imagen */}
      <OurProcess />

      {/* Sección solo video */}
      <VideoSection
        videoSrc="/videos/3.mp4"
        overlay={true}
        overlayOpacity={0.4}
        className="h-[60vh]"
      />

      {/* Sección solo video */}
      <VideoSection
        videoSrc="/videos/4.mp4"
        overlay={true}
        overlayOpacity={0.5}
        className="h-[60vh]"
      />

      {/* Sección con texto sobre imagen */}
      <Reveal />

      {/* Sección con imágenes de perfiles */}
      <WhoIsItFor />

      {/* Sección con texto sobre imagen */}
      <FinalCta />

      {/* Sección con casos de éxito */}
      <SuccessCases />

      <Footer />
      <ScrollToTop />
    </div>
  );
}
