'use client';

import Image from 'next/image';
import SectionHeader from './SectionHeader';
import AnimatedSection, { AnimatedSequence } from './AnimatedSection';
import { useTranslations } from 'next-intl';

export default function OurProcess() {
  const t = useTranslations('ourProcess');

  return (
    <section id="proceso" className="relative py-16 ">
      <div className="absolute inset-0">
        <Image
          src="/jpg/15.jpg"
          alt="Background"
          fill
          className="object-cover"
          quality={90}
        />
        <div className="absolute inset-0 bg-althara-dark-blue/70"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-12" animation="fadeInUp" delay={0.2}>
          <SectionHeader letter="C" title={t('title')} variant="dark" />
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={0.4}>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-light text-[#e6e2d7] leading-tight tracking-tight text-center mb-12">
            {t('heading')}
          </h2>
        </AnimatedSection>

        <AnimatedSequence
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-8"
          animation="fadeInUp"
          baseDelay={0.6}
          delayIncrement={0.15}
        >
          <div className="space-y-3 text-center">
            <div className="text-5xl sm:text-6xl font-light text-[#e6e2d7]/30 mb-3">
              01
            </div>
            <h3 className="text-2xl sm:text-3xl font-light text-[#e6e2d7]">
              {t('steps.step1.title')}
            </h3>
          </div>
          <div className="space-y-3 text-center">
            <div className="text-5xl sm:text-6xl font-light text-[#e6e2d7]/30 mb-3">
              02
            </div>
            <h3 className="text-2xl sm:text-3xl font-light text-[#e6e2d7]">
              {t('steps.step2.title')}
            </h3>
          </div>
          <div className="space-y-3 text-center">
            <div className="text-5xl sm:text-6xl font-light text-[#e6e2d7]/30 mb-3">
              03
            </div>
            <h3 className="text-2xl sm:text-3xl font-light text-[#e6e2d7]">
              {t('steps.step3.title')}
            </h3>
          </div>
          <div className="space-y-3 text-center">
            <div className="text-5xl sm:text-6xl font-light text-[#e6e2d7]/30 mb-3">
              04
            </div>
            <h3 className="text-2xl sm:text-3xl font-light text-[#e6e2d7]">
              {t('steps.step4.title')}
            </h3>
          </div>
        </AnimatedSequence>

        <AnimatedSection animation="fadeInUp" delay={1.2}>
          <p className="text-lg sm:text-xl text-[#e6e2d7]/60 font-light italic text-center">
            {t('microcopy')}
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
