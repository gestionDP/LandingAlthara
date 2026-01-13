'use client';

import Image from 'next/image';
import AnimatedSection from './AnimatedSection';

export default function Hero() {
  return (
    <section className="relative h-[100vh] w-full overflow-hidden">
      {/* Video de fondo */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Contenido: Logo centrado y párrafo abajo */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between py-8 md:py-12">
        <div className="flex-1 flex items-center justify-center">
          {/* Logo grande centrado */}
          <AnimatedSection animation="fadeInUp" delay={0.3} autoAnimate={true}>
            <Image
              src="/png/Logo-02.png"
              alt="Althara Logo"
              width={1000}
              height={100}
              className="w-full max-w-[1000px] md:max-w-[1000px] h-auto"
              priority
            />
          </AnimatedSection>
        </div>

        {/* Párrafo en la parte inferior */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
          <AnimatedSection animation="fadeInUp" delay={0.5} autoAnimate={true}>
            <p className="text-center text-base sm:text-lg md:text-xl lg:text-2xl text-[#e6e2d7] font-light leading-relaxed">
              Una puerta. No un catálogo.
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
