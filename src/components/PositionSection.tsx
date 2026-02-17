'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '@/motion/components';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Pillar = {
  key: string;
  title: string;
  items: string[];
};

export default function PositionSection() {
  const t = useTranslations('position');

  const pillars: Pillar[] = [
    {
      key: 'signals',
      title: t('tab1_title'),
      items: [t('tab1_item1'), t('tab1_item2'), t('tab1_item3')],
    },
    {
      key: 'routes',
      title: t('tab2_title'),
      items: [t('tab2_item1'), t('tab2_item2'), t('tab2_item3')],
    },
    {
      key: 'edge',
      title: t('tab3_title'),
      items: [t('tab3_item1'), t('tab3_item2'), t('tab3_item3')],
    },
  ];

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden py-20 md:py-24 lg:py-28">
      <div className="relative z-10 max-w-[1920px] mx-auto px-6 lg:px-12">
        <StaggerContainer className="space-y-8 md:space-y-10">
          <StaggerItem variant="fadeIn">
            <p className="text-xs tracking-extreme-editorial text-[#e6e2d7]/55 font-light">
              {t('label')}
            </p>
          </StaggerItem>

          <StaggerItem variant="slideUp">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-montserrat text-[#e6e2d7] leading-tight max-w-3xl">
              {t('title')}
            </h2>
          </StaggerItem>

          <StaggerItem variant="fadeIn">
            <p className="text-lg md:text-xl text-[#e6e2d7]/80 font-light leading-relaxed max-w-2xl">
              {t('statement')}
            </p>
          </StaggerItem>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-4">
            {pillars.map((pillar, idx) => (
              <StaggerItem key={pillar.key} variant="slideUp">
                <motion.div
                  className="h-full border border-[#e6e2d7]/10 bg-[#0f0f0f]/40 backdrop-blur-sm p-6 md:p-7"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  <h3 className="text-xl md:text-2xl font-medium font-montserrat text-[#e6e2d7] mb-4">
                    {pillar.title}
                  </h3>
                  <ul className="space-y-2">
                    {pillar.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm md:text-base text-[#e6e2d7]/75 font-light leading-relaxed"
                      >
                        <span className="text-[#e6e2d7]/40 shrink-0">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </StaggerItem>
            ))}
          </div>

          <StaggerItem variant="fadeIn" className="pt-8 md:pt-10 border-t border-[#e6e2d7]/10">
            <h3 className="text-sm font-medium tracking-wider text-[#e6e2d7]/70 uppercase mb-3">
              {t('inPracticeTitle')}
            </h3>
            <p className="text-base md:text-lg text-[#e6e2d7]/80 font-light leading-relaxed max-w-2xl">
              {t('inPracticeExample')}
            </p>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
