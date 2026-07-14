'use client';

/** Landing 2.0 — sistema editorial con animación (referencia: caterina-portfolio). */
import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import Marquee from '@/components/landing/Marquee';
import Thesis from '@/components/landing/Thesis';
import Layers from '@/components/landing/Layers';
import Method from '@/components/landing/Method';
import Divider from '@/components/landing/Divider';
import Segments from '@/components/landing/Segments';
import Portal from '@/components/landing/Portal';
import FinalCta from '@/components/landing/FinalCta';
import Footer from '@/components/landing/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export default function Home() {
  return (
    <div className="relative overflow-x-clip bg-[#f4f2ec]">
      <Nav />
      <Hero />
      <Thesis />
      <Marquee />
      <Layers />
      <Method />
      <Divider />
      <Segments />
      <Portal />
      <FinalCta />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
