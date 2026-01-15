'use client';

import Image from 'next/image';
import AnimatedSection, { AnimatedSequence } from './AnimatedSection';
import { useTranslations } from 'next-intl';

export default function HowItWorks() {
  const t = useTranslations('howItWorks');

  return (
    <section
      id="acceso"
      className="relative min-h-[70vh] flex items-center justify-center  py-16"
    >
      <div className="absolute inset-0">
        <Image
          src="/jpg/3.jpg"
          alt="Background"
          fill
          className="object-cover"
          quality={95}
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <AnimatedSection animation="fadeInUp" delay={0.2}>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-light text-[#e6e2d7] leading-tight tracking-tight text-center mb-8">
            {t('heading')}
          </h2>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={0.4}>
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-[#e6e2d7]/90 leading-relaxed text-center max-w-3xl mx-auto mb-12">
            {t('description')}
          </p>
        </AnimatedSection>

        <AnimatedSequence
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10"
          animation="fadeInUp"
          baseDelay={0.6}
          delayIncrement={0.15}
        >
          <div className="space-y-3 text-center">
            <h3 className="text-3xl sm:text-4xl font-light text-[#e6e2d7] mb-3">
              {t('pillars.filter.title')}
            </h3>
            <p className="text-lg sm:text-xl font-light text-[#e6e2d7]/80 leading-relaxed">
              {t('pillars.filter.description')}
            </p>
          </div>
          <div className="space-y-3 text-center">
            <h3 className="text-3xl sm:text-4xl font-light text-[#e6e2d7] mb-3">
              {t('pillars.verification.title')}
            </h3>
            <p className="text-lg sm:text-xl font-light text-[#e6e2d7]/80 leading-relaxed">
              {t('pillars.verification.description')}
            </p>
          </div>
          <div className="space-y-3 text-center">
            <h3 className="text-3xl sm:text-4xl font-light text-[#e6e2d7] mb-3">
              {t('pillars.signal.title')}
            </h3>
            <p className="text-lg sm:text-xl font-light text-[#e6e2d7]/80 leading-relaxed">
              {t('pillars.signal.description')}
            </p>
          </div>
          <div className="space-y-3 text-center">
            <h3 className="text-3xl sm:text-4xl font-light text-[#e6e2d7] mb-3">
              {t('pillars.closure.title')}
            </h3>
            <p className="text-lg sm:text-xl font-light text-[#e6e2d7]/80 leading-relaxed">
              {t('pillars.closure.description')}
            </p>
          </div>
        </AnimatedSequence>
      </div>
    </section>
  );
}
