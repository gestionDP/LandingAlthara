import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import WhatIsAlthara from '@/components/WhatIsAlthara';
import OurProcess from '@/components/OurProcess';
import WhoIsItFor from '@/components/WhoIsItFor';
import WhyTrustUs from '@/components/WhyTrustUs';
import SuccessCases from '@/components/SuccessCases';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-althara-dark-blue">
      <Navbar />

      <Hero />
      <div className="py-20">
        <HowItWorks />
      </div>

      <WhatIsAlthara />

      <div className="py-20">
        <OurProcess />
      </div>

      <WhoIsItFor />

      {/* <div className="py-20">
        <WhyTrustUs />
      </div> */}

      <SuccessCases />

      <Footer />
      <ScrollToTop />
    </div>
  );
}
