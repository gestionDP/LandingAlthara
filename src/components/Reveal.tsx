'use client';

import Image from 'next/image';
import AnimatedSection from './AnimatedSection';
import { useTranslations } from 'next-intl';

export default function Reveal() {
  const t = useTranslations('reveal');

  return (
    <section id="reveal" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-16">
      <div className="absolute inset-0">
        <Image
          src="/jpg/12.jpg"
          alt="Background"
          fill
          className="object-cover"
          quality={95}
        />
        <div className="absolute inset-0 bg-black/65"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <AnimatedSection animation="fadeInUp" delay={0.2}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-[#e6e2d7] leading-tight text-center mb-8">
            {t('heading')}
          </h2>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={0.4}>
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-[#e6e2d7] leading-relaxed text-center max-w-4xl mx-auto">
            {t('description')}
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}

