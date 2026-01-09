'use client';

import Image from 'next/image';
import SectionHeader from './SectionHeader';
import AnimatedSection, { AnimatedSequence } from './AnimatedSection';
import { useTranslations } from 'next-intl';

export default function OurProcess() {
  const t = useTranslations('ourProcess');

  return (
    <section id="nuestro-proceso" className="relative py-20 overflow-hidden">
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

        <div className="space-y-16">
          <AnimatedSection
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
            animation="fadeInUp"
            delay={0.4}
          >
            <AnimatedSection animation="fadeInLeft" delay={0.6}>
              <h2 className="text-5xl font-normal text-[#e6e2d7] leading-tight">
                {t('heading')}
              </h2>
            </AnimatedSection>

            <AnimatedSection
              className="space-y-4"
              animation="fadeInRight"
              delay={0.8}
            >
              <div className="text-lg font-medium text-[#e6e2d7]">
                {t('steps.step1.number')}
              </div>
              <h3 className="text-xl font-medium text-[#e6e2d7]">
                {t('steps.step1.title')}
              </h3>
              <p className="text-base font-light text-[#e6e2d7]/80 leading-relaxed">
                {t('steps.step1.description')}
              </p>
            </AnimatedSection>

            <AnimatedSection
              className="space-y-4"
              animation="fadeInRight"
              delay={1.0}
            >
              <div className="text-lg font-medium text-[#e6e2d7]">
                {t('steps.step2.number')}
              </div>
              <h3 className="text-xl font-medium text-[#e6e2d7]">
                {t('steps.step2.title')}
              </h3>
              <p className="text-base font-light text-[#e6e2d7]/80 leading-relaxed">
                {t('steps.step2.description')}
              </p>
            </AnimatedSection>
          </AnimatedSection>

          <AnimatedSequence
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            animation="fadeInScale"
            baseDelay={1.2}
            delayIncrement={0.2}
          >
            <div className="space-y-4">
              <div className="text-lg font-medium text-[#e6e2d7]">
                {t('steps.step3.number')}
              </div>
              <h3 className="text-xl font-medium text-[#e6e2d7]">
                {t('steps.step3.title')}
              </h3>
              <p className="text-base font-light text-[#e6e2d7]/80 leading-relaxed">
                {t('steps.step3.description')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-lg font-medium text-[#e6e2d7]">
                {t('steps.step4.number')}
              </div>
              <h3 className="text-xl font-medium text-[#e6e2d7]">
                {t('steps.step4.title')}
              </h3>
              <p className="text-base font-light text-[#e6e2d7]/80 leading-relaxed">
                {t('steps.step4.description')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-lg font-medium text-[#e6e2d7]">
                {t('steps.step5.number')}
              </div>
              <h3 className="text-xl font-medium text-[#e6e2d7]">
                {t('steps.step5.title')}
              </h3>
              <p className="text-base font-light text-[#e6e2d7]/80 leading-relaxed">
                {t('steps.step5.description')}
              </p>
            </div>
          </AnimatedSequence>
        </div>
      </div>
    </section>
  );
}
