'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import EditorialCollage from '@/components/EditorialCollage';
import PositionSection from '@/components/PositionSection';
import ManifestoStatement from '@/components/ManifestoStatement';
import FeaturedDossiers from '@/components/FeaturedDossiers';
import MethodPhases from '@/components/MethodPhases';
import SelectedEnvironments from '@/components/SelectedEnvironments';
import FinalCta from '@/components/FinalCta';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export default function Home() {
  return (
    <div className=" relative bg-[#102027] overflow-x-hidden">
      <Navbar />

      <Hero />

      <PositionSection />

      <ManifestoStatement />

      <FeaturedDossiers />

      <EditorialCollage />

      <MethodPhases />

      <SelectedEnvironments />

      <FinalCta />

      <Footer />

      <ScrollToTop />
    </div>
  );
}
