"use client";

import Image from "next/image";
import AnimatedSection from "./AnimatedSection";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/png/Hero1.png"
          alt="Hero Background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20">
          <AnimatedSection
            className="mb-3"
            animation="fadeInUp"
            delay={0.2}
            autoAnimate={true}
          >
            <span className="text-white text-sm font-regular tracking-wider">
              #ACCESO EXCLUSIVO
            </span>
          </AnimatedSection>

          <AnimatedSection animation="fadeInUp" delay={0.4} autoAnimate={true}>
            <h1 className="text-5xl sm:text-6xl font-normal text-white mb-4 leading-tight">
              ¿Dónde Están las
              <br />
              Verdaderas Oportunidades?
            </h1>
          </AnimatedSection>

          <AnimatedSection
            className="space-y-1 mb-6 flex items-start"
            animation="fadeInUp"
            delay={0.6}
            autoAnimate={true}
          >
            <div className="w-px h-16 bg-white mr-4 mt-1"></div>
            <div className="flex-1">
              <p className="text-base text-white font-light">
                Encuentra las mejores oportunidades de
              </p>
              <p className="text-base text-white font-light">
                inversión que no están en el mercado público.
              </p>
              <p className="text-base text-white font-light">
                Matching inteligente para activos off-market
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
