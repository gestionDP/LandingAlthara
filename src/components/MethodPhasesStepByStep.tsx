'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import ContactModal from './ContactModal';
import { Button } from '@/components/ui/button';
import {
  StaggerContainer,
  StaggerItem,
  FadeIn,
} from '@/motion/components';

const PHASES = ['phase1', 'phase2', 'phase3', 'phase4', 'phase5'] as const;

export default function MethodPhasesStepByStep() {
  const t = useTranslations('method');
  const tNav = useTranslations('navbar');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <section
        id="method"
        className="relative bg-[#0a0a0a] overflow-hidden py-20 md:py-28"
      >
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            {/* Columna izquierda: pasos */}
            <StaggerContainer className="space-y-12 md:space-y-14">
              <StaggerItem variant="fadeIn" className="shrink-0">
                <p className="text-xs tracking-extreme-editorial text-[#e6e2d7]/60 font-light">
                  {t('label')}
                </p>
              </StaggerItem>

              <div className="space-y-10 md:space-y-12">
                {PHASES.map((phaseKey, index) => {
                  const number = String(index + 1).padStart(2, '0');
                  const title = t(`${phaseKey}.title`);
                  const bullet1 = t(`${phaseKey}.bullet1`);
                  const bullet2 = t(`${phaseKey}.bullet2`);
                  return (
                    <StaggerItem key={phaseKey} variant="slideUp" className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                      <div className="shrink-0 flex items-baseline gap-3">
                        <span className="text-xs tracking-[0.28em] text-[#e6e2d7]/40 font-light">
                          {number}
                        </span>
                        <span className="h-px w-8 bg-[#e6e2d7]/20" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-playfair text-xl md:text-2xl lg:text-3xl text-[#e6e2d7] font-normal leading-tight mb-3">
                          {title}
                        </h3>
                        <ul className="space-y-2 text-sm md:text-base text-[#e6e2d7]/75 font-light leading-relaxed">
                          <li className="flex gap-2">
                            <span className="text-[#e6e2d7]/35">—</span>
                            <span>{bullet1}</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#e6e2d7]/35">—</span>
                            <span>{bullet2}</span>
                          </li>
                        </ul>
                      </div>
                    </StaggerItem>
                  );
                })}
              </div>
            </StaggerContainer>

            {/* Columna derecha: cita + CTA (desktop); en mobile va debajo */}
            <FadeIn className="lg:sticky lg:top-24 lg:self-start pt-10 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#e6e2d7]/10 lg:pl-12 xl:pl-16">
              <p className="text-xl md:text-2xl lg:text-3xl text-[#e6e2d7]/90 font-light italic leading-relaxed mb-8 max-w-md">
                {t('finalLine')}
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="h-12 px-8 font-light tracking-editorial text-sm bg-transparent text-[#e6e2d7] border border-[#e6e2d7]/30 hover:bg-[#e6e2d7]/10 hover:border-[#e6e2d7]/50 transition-colors duration-200"
              >
                {tNav('requestAccess')}
              </Button>
            </FadeIn>
          </div>
        </div>
      </section>

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
