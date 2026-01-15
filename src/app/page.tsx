'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import EditorialCollage from '@/components/EditorialCollage';
import PositionSection from '@/components/PositionSection';
import TrackRecord from '@/components/TrackRecord';
import ManifestoStatement from '@/components/ManifestoStatement';
import FeaturedDossiers from '@/components/FeaturedDossiers';
import MethodPhases from '@/components/MethodPhases';
import SelectedEnvironments from '@/components/SelectedEnvironments';
import Extracts from '@/components/Extracts';
import BriefingNote from '@/components/BriefingNote';
import FinalCta from '@/components/FinalCta';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useSnapWheel } from '@/hooks/useSnapWheel';

export default function Home() {
  useSnapWheel({
    enabled: true,
    containerId: 'snapRoot',
    lockMs: 900,
    triggerDelta: 12,
  });

  return (
    <div
      id="snapRoot"
      className="snapRoot relative bg-[#102027] overflow-x-hidden"
    >
      <Navbar />

      <section className="snapSection">
        <Hero />
      </section>

      <section className="snapSection">
        <PositionSection />
      </section>

      <section className="snapSection">
        <ManifestoStatement />
      </section>

      <section className="snapSection">
        <FeaturedDossiers />
      </section>

      <section className="snapSection">
        <EditorialCollage />
      </section>

      <section className="snapSection">
        <MethodPhases />
      </section>

      <section className="snapSection">
        <SelectedEnvironments />
      </section>

      <section className="snapSection">
        <FinalCta />
      </section>

      {/* <Footer /> */}

      <ScrollToTop />
    </div>
  );
}
