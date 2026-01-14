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
  useSnapWheel({ enabled: true });

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#102027]">
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
