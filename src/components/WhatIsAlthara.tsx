'use client';

import Image from 'next/image';
import AnimatedSection from './AnimatedSection';
import { useTranslations } from 'next-intl';

export default function WhatIsAlthara() {
  const t = useTranslations('whatIsAlthara');

  return (
    <section
      id="sistema"
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-16"
    >
      <div className="absolute inset-0">
        <Image
          src="/jpg/2.jpg"
          alt="Background"
          fill
          className="object-cover"
          quality={95}
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <AnimatedSection animation="fadeInUp" delay={0.2}>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-light text-[#e6e2d7] leading-tight tracking-tight text-center mb-8">
            {t('heading')
              .split('\n')
              .map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
          </h2>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={0.6}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mt-12">
            <div className="text-2xl sm:text-3xl md:text-4xl font-light text-[#e6e2d7] text-center">
              {t('stack.line1')}
            </div>
            <div className="hidden md:block w-px h-12 bg-[#e6e2d7]/30"></div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-light text-[#e6e2d7] text-center">
              {t('stack.line2')}
            </div>
            <div className="hidden md:block w-px h-12 bg-[#e6e2d7]/30"></div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-light text-[#e6e2d7] text-center">
              {t('stack.line3')}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
