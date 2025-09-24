import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WhatIsAlthara from "@/components/WhatIsAlthara";
import OurProcess from "@/components/OurProcess";
import WhoIsItFor from "@/components/WhoIsItFor";
import WhyTrustUs from "@/components/WhyTrustUs";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
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

      <div className="py-20">
        <WhyTrustUs />
      </div>

      <Footer />
    </div>
  );
}
