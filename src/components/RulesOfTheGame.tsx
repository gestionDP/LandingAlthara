'use client';

import Image from 'next/image';
import AnimatedSection, { AnimatedSequence } from './AnimatedSection';
import { useTranslations } from 'next-intl';

export default function RulesOfTheGame() {
  const t = useTranslations('rulesOfTheGame');

  return (
    <section id="reglas" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-16">
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <AnimatedSection animation="fadeInUp" delay={0.2}>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-light text-[#e6e2d7] leading-tight tracking-tight text-center mb-12">
            {t('heading')}
          </h2>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 mb-12">
          <AnimatedSequence
            className="space-y-5"
            animation="fadeInUp"
            baseDelay={0.4}
            delayIncrement={0.1}
          >
            <div className="relative pl-8 md:pl-12 border-l-2 border-[#e6e2d7]/20 hover:border-[#e6e2d7]/40 transition-colors duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#e6e2d7]/40 -ml-[2px]"></div>
              <p className="text-xl sm:text-2xl md:text-3xl font-light text-[#e6e2d7]/80 leading-relaxed">
                {t('rules.rule1')}
              </p>
            </div>
            <div className="relative pl-8 md:pl-12 border-l-2 border-[#e6e2d7]/20 hover:border-[#e6e2d7]/40 transition-colors duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#e6e2d7]/40 -ml-[2px]"></div>
              <p className="text-xl sm:text-2xl md:text-3xl font-light text-[#e6e2d7]/80 leading-relaxed">
                {t('rules.rule2')}
              </p>
            </div>
            <div className="relative pl-8 md:pl-12 border-l-2 border-[#e6e2d7]/20 hover:border-[#e6e2d7]/40 transition-colors duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#e6e2d7]/40 -ml-[2px]"></div>
              <p className="text-xl sm:text-2xl md:text-3xl font-light text-[#e6e2d7]/80 leading-relaxed">
                {t('rules.rule3')}
              </p>
            </div>
          </AnimatedSequence>

          <div className="pt-6 md:pt-8 border-t border-[#e6e2d7]/20">
            <AnimatedSection animation="fadeInUp" delay={0.7}>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl md:text-5xl font-light text-[#e6e2d7] leading-tight">
                  {t('rules.rule4')}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>

        <AnimatedSection animation="fadeInUp" delay={0.9}>
          <div className="text-center">
            <p className="text-base sm:text-lg md:text-xl text-[#e6e2d7]/50 font-light italic tracking-wide">
              {t('microcopy')}
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

