'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useReveal } from '@/hooks/useReveal';
import ContactModal from './ContactModal';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { animationVariants } from '@/lib/animations';

export default function FeaturedDossiers() {
  const t = useTranslations('featuredDossiers');
  const { ref, isRevealed } = useReveal({ threshold: 0.2 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const hoverTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const dossiers = useMemo(
    () => [
      {
        n: '01',
        title: t('dossier1.title'),
        year: t('dossier1.year'),
        description: t('dossier1.description'),
        image: '/jpg/35.png',
      },
      {
        n: '02',
        title: t('dossier2.title'),
        year: t('dossier2.year'),
        description: t('dossier2.description'),
        image: '/jpg/36.png',
      },
      {
        n: '03',
        title: t('dossier3.title'),
        year: t('dossier3.year'),
        description: t('dossier3.description'),
        image: '/jpg/37.png',
      },
    ],
    [t]
  );

  const current = dossiers[activeIndex];

  const bgImage = '/jpg/34.png';

  const lensPos = [
    { x: 0.18, y: 0.28 },
    { x: 0.62, y: 0.38 },
    { x: 0.42, y: 0.72 },
  ][activeIndex];

  const setActive = (index: number) => {
    setActiveIndex(index);
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = null;
  };

  return (
    <>
      <section
        ref={ref as React.RefObject<HTMLElement>}
        id="dossiers"
        className="relative py-20 md:py-24 lg:py-32 overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={bgImage}
            alt=""
            fill
            priority={false}
            className="object-cover"
          />

          <div className="absolute inset-0 bg-[#0a0a0a]/35" />

          <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_45%,rgba(10,10,10,0.18)_0%,rgba(10,10,10,0.55)_70%,rgba(10,10,10,0.72)_100%)]" />

          <div className="absolute left-0 right-0 top-0 h-px bg-[#e6e2d7]/15" />
          <div className="absolute left-0 right-0 bottom-0 h-px bg-[#e6e2d7]/15" />

          <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23n)%22 opacity=%220.55%22/%3E%3C/svg%3E')]" />
        </div>

        <div className="max-w-[1920px] mx-auto px-5 sm:px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-10 md:mb-14 lg:mb-16 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs tracking-extreme-editorial text-[#e6e2d7]/70 font-light">
                  {t('label')}
                </p>

                <p className="mt-2 text-[11px] tracking-[0.22em] text-[#e6e2d7]/45 md:hidden">
                  {t('tapToSwitch')}
                </p>
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs tracking-[0.28em] text-[#e6e2d7]/45">
                <span>/{current.n}</span>
                <span className="h-px w-10 bg-[#e6e2d7]/20" />
                <span>{current.year}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 lg:gap-16">
              <div className="order-1 lg:order-2 lg:col-span-7 lg:sticky lg:top-20 lg:self-start lg:h-[620px]">
                <div className="relative w-full h-[360px] sm:h-[420px] lg:h-full border border-[#e6e2d7]/15 bg-[#0f0f0f]/30 backdrop-blur-xl overflow-hidden">
                  <motion.div
                    className="absolute"
                    animate={{
                      left: `calc(${lensPos.x * 100}% - 140px)`,
                      top: `calc(${lensPos.y * 100}% - 95px)`,
                    }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    style={{ width: 280, height: 190 }}
                  >
                    <div className="relative w-full h-full overflow-hidden border border-[#e6e2d7]/12 bg-[#e6e2d7]/[0.04] backdrop-blur-md">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e6e2d7]/[0.10] to-transparent" />
                    </div>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      variants={animationVariants.crossfade}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="absolute inset-0"
                    >
                      <img
                        src={current.image}
                        alt={current.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/70 via-transparent to-transparent" />
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute left-5 right-5 sm:left-6 sm:right-6 bottom-5 sm:bottom-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs tracking-[0.28em] text-[#e6e2d7]/60">
                        {t('dossierTag')} /{current.n}
                      </span>
                      <span className="h-px w-10 bg-[#e6e2d7]/20" />
                      <span className="text-xs tracking-[0.18em] text-[#e6e2d7]/45">
                        {current.year}
                      </span>
                    </div>

                    <div className="text-lg md:text-xl text-[#e6e2d7]/92 font-light leading-snug">
                      {current.title}
                    </div>
                    <div className="mt-2 text-sm md:text-base text-[#e6e2d7]/65 font-light leading-relaxed max-w-2xl">
                      {current.description}
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 flex items-center gap-2">
                  {dossiers.map((_, idx) => (
                    <div
                      key={idx}
                      className={[
                        'h-px flex-1 transition-opacity',
                        idx === activeIndex
                          ? 'bg-[#e6e2d7]/30 opacity-100'
                          : 'bg-[#e6e2d7]/12 opacity-60',
                      ].join(' ')}
                    />
                  ))}
                </div>
              </div>

              <div className="order-2 lg:order-1 lg:col-span-5 lg:sticky lg:top-20 lg:self-start">
                <div className="border border-[#e6e2d7]/15 bg-[#0f0f0f]/30 backdrop-blur-xl">
                  <div className="divide-y divide-[#e6e2d7]/10">
                    {dossiers.map((dossier, index) => {
                      const isActive = index === activeIndex;

                      return (
                        <motion.button
                          key={dossier.n}
                          type="button"
                          className={[
                            'w-full text-left p-6 sm:p-7 lg:p-8 group transition-colors',
                            isActive ? 'bg-white/5' : 'bg-transparent',
                          ].join(' ')}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            setActive(index);
                          }}
                          onFocus={() => setActive(index)}
                          aria-pressed={isActive}
                          initial={{ opacity: 0, y: 8 }}
                          animate={
                            isRevealed
                              ? { opacity: 1, y: 0 }
                              : { opacity: 0, y: 8 }
                          }
                          transition={{
                            duration: 0.55,
                            delay: index * 0.08,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="flex items-start justify-between gap-5 sm:gap-6">
                            <div className="flex-1">
                              <div className="flex items-baseline gap-3 mb-2">
                                <h3
                                  className={[
                                    'font-playfair font-normal leading-snug transition-all',
                                    isActive
                                      ? 'text-[#e6e2d7] text-xl sm:text-xl md:text-xl'
                                      : 'text-[#e6e2d7]/75 text-lg sm:text-xl md:text-2xl',
                                  ].join(' ')}
                                >
                                  {dossier.title}
                                </h3>

                                <span
                                  className={[
                                    'text-sm font-light tracking-wide-editorial transition-colors',
                                    isActive
                                      ? 'text-[#e6e2d7]/55'
                                      : 'text-[#e6e2d7]/35',
                                  ].join(' ')}
                                >
                                  — {dossier.year}
                                </span>
                              </div>

                              <p
                                className={[
                                  'text-sm md:text-base font-light leading-relaxed transition-colors',
                                  isActive
                                    ? 'text-[#e6e2d7]/70'
                                    : 'text-[#e6e2d7]/45',
                                ].join(' ')}
                              >
                                {dossier.description}
                              </p>
                            </div>

                            <div className="mt-2 flex flex-col items-end gap-2">
                              <span
                                className={[
                                  'text-xs tracking-[0.28em] transition-opacity',
                                  isActive
                                    ? 'text-[#e6e2d7]/55 opacity-100'
                                    : 'text-[#e6e2d7]/30 opacity-80',
                                ].join(' ')}
                              >
                                /{dossier.n}
                              </span>
                              <span
                                className={[
                                  'h-2 w-2 rounded-full transition-colors',
                                  isActive
                                    ? 'bg-[#e6e2d7]/45'
                                    : 'bg-[#e6e2d7]/18',
                                ].join(' ')}
                              />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 md:mt-14 lg:mt-16 max-w-2xl">
              <Button
                onClick={openModal}
                className="h-12 px-8 font-light tracking-editorial text-sm bg-[#0f0f0f]/25 text-[#e6e2d7] border border-[#e6e2d7]/25 hover:bg-[#0f0f0f]/35 hover:border-[#e6e2d7]/40 transition-all duration-200 backdrop-blur-xl"
              >
                {t('cta')}
              </Button>

              <p className="mt-6 text-xs text-[#e6e2d7]/55 font-light tracking-wide-editorial">
                {t('microcopy')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
