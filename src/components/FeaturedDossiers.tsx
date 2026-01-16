'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import ContactModal from './ContactModal';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Dossier = {
  n: string;
  title: string;
  year: string;
  description: string;
  image: string;
};

export default function FeaturedDossiers() {
  const t = useTranslations('featuredDossiers');
  const prefersReducedMotion = useReducedMotion();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const dossiers = useMemo<Dossier[]>(
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

  // Lens positions (normalizadas)
  const lensPos = [
    { x: 0.18, y: 0.28 },
    { x: 0.62, y: 0.38 },
    { x: 0.42, y: 0.72 },
  ][activeIndex];

  // Spotlight positions for the global background (sync with activeIndex)
  const spotPos = [
    { x: 0.22, y: 0.35 },
    { x: 0.62, y: 0.42 },
    { x: 0.48, y: 0.68 },
  ][activeIndex];

  return (
    <>
      <section id="dossiers" className="relative py-20 md:py-24 lg:py-32 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[#070707]" />

          <div className="absolute inset-0 opacity-[0.22]">
            <Image src={bgImage} alt="" fill priority={false} className="object-cover" />
          </div>

          <div className="absolute inset-0 bg-[#070707]/45" />

          <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_50%_45%,rgba(230,226,215,0.10)_0%,rgba(10,10,10,0.35)_62%,rgba(10,10,10,0.55)_100%)]" />

          {!prefersReducedMotion && (
            <motion.div
              aria-hidden
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: `radial-gradient(900px 520px at ${Math.round(
                    spotPos.x * 100
                  )}% ${Math.round(spotPos.y * 100)}%,
                  rgba(230,226,215,0.16),
                  rgba(10,10,10,0) 60%)`,
                  opacity: [0.55, 0.8, 0.6],
                }}
                transition={{
                  background: { duration: 0.7, ease: EASE },
                  opacity: { duration: 3.2, ease: EASE, repeat: Infinity },
                }}
                style={{ mixBlendMode: 'screen' }}
              />
            </motion.div>
          )}

          {!prefersReducedMotion ? (
            <motion.div
              aria-hidden
              className="absolute inset-0 mix-blend-overlay [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23n)%22 opacity=%220.55%22/%3E%3C/svg%3E')]"
              initial={{ opacity: 0.06 }}
              animate={{ opacity: [0.05, 0.085, 0.06] }}
              transition={{ duration: 2.8, ease: EASE, repeat: Infinity }}
            />
          ) : (
            <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23n)%22 opacity=%220.55%22/%3E%3C/svg%3E')]" />
          )}

          <div className="absolute left-0 right-0 top-0 h-px bg-[#e6e2d7]/12" />
          <div className="absolute left-0 right-0 bottom-0 h-px bg-[#e6e2d7]/12" />
        </div>

        <div className="max-w-[1920px] mx-auto px-5 sm:px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="mb-10 md:mb-14 lg:mb-16 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs tracking-extreme-editorial text-[#e6e2d7]/70 font-light">
                  {t('label')}
                </p>
                <p className="mt-2 text-[11px] tracking-[0.22em] text-[#e6e2d7]/40 md:hidden">
                  {t('tapToSwitch')}
                </p>
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs tracking-[0.28em] text-[#e6e2d7]/40">
                <span>/{current.n}</span>
                <span className="h-px w-10 bg-[#e6e2d7]/16" />
                <span>{current.year}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.85, ease: EASE, delay: 0.06 }}
                className="order-1 lg:order-2 lg:col-span-7 lg:sticky lg:top-20 lg:self-start lg:h-[620px]"
              >
                <div className="relative w-full h-[360px] sm:h-[420px] lg:h-full border border-[#e6e2d7]/14 bg-[#0b0b0b]/40 backdrop-blur-xl overflow-hidden">
                  <motion.div
                    className="absolute"
                    animate={{
                      left: `calc(${lensPos.x * 100}% - 140px)`,
                      top: `calc(${lensPos.y * 100}% - 95px)`,
                      scale: [1, 1.02, 1],
                      opacity: [0.65, 0.92, 0.72],
                    }}
                    transition={{
                      left: { duration: 0.75, ease: EASE },
                      top: { duration: 0.75, ease: EASE },
                      scale: { duration: 1.2, ease: EASE },
                      opacity: { duration: 1.2, ease: EASE },
                    }}
                    style={{ width: 280, height: 190 }}
                  >
                    <div className="relative w-full h-full border border-[#e6e2d7]/12 bg-[#e6e2d7]/[0.03] backdrop-blur-md">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e6e2d7]/[0.10] to-transparent" />
                    </div>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.01 }}
                      transition={{ duration: 0.7, ease: EASE }}
                      className="absolute inset-0"
                    >
                      <img
                        src={current.image}
                        alt={current.title}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-[#070707]/18" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070707]/45 via-transparent to-[#070707]/12" />
                    </motion.div>
                  </AnimatePresence>

                  <motion.div
                    key={`meta-${activeIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
                    className="absolute left-5 right-5 sm:left-6 sm:right-6 bottom-5 sm:bottom-6"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs tracking-[0.28em] text-[#e6e2d7]/55">
                        {t('dossierTag')} /{current.n}
                      </span>
                      <span className="h-px w-10 bg-[#e6e2d7]/16" />
                      <span className="text-xs tracking-[0.18em] text-[#e6e2d7]/40">
                        {current.year}
                      </span>
                    </div>

                    <div className="text-lg md:text-xl text-[#e6e2d7]/92 font-light leading-snug">
                      {current.title}
                    </div>
                    <div className="mt-2 text-sm md:text-base text-[#e6e2d7]/62 font-light leading-relaxed max-w-2xl">
                      {current.description}
                    </div>

                    <div className="mt-4">
                      <Button
                        onClick={openModal}
                        className="h-11 px-6 text-sm font-light bg-[#e6e2d7] text-[#0a0a0a] hover:bg-[#e6e2d7]/90"
                      >
                        {t('cta')}
                      </Button>
                    </div>
                  </motion.div>
                </div>

                {/* Progress hairlines */}
                <div className="mt-5 sm:mt-6 flex items-center gap-2">
                  {dossiers.map((_, idx) => (
                    <motion.div
                      key={idx}
                      animate={{
                        opacity: idx === activeIndex ? 1 : 0.45,
                        scaleX: idx === activeIndex ? 1 : 0.7,
                      }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="h-px origin-left bg-[#e6e2d7]/22 flex-1"
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.85, ease: EASE }}
                className="order-2 lg:order-1 lg:col-span-5 lg:sticky lg:top-20 lg:self-start"
              >
                <div className="border border-[#e6e2d7]/14 bg-[#0b0b0b]/40 backdrop-blur-xl overflow-hidden">
                  <div className="divide-y divide-[#e6e2d7]/10">
                    {dossiers.map((dossier, index) => {
                      const isActive = index === activeIndex;

                      return (
                        <motion.button
                          key={dossier.n}
                          type="button"
                          className={[
                            'relative w-full text-left p-6 sm:p-7 lg:p-8 group transition-colors',
                            isActive ? 'bg-white/5' : 'bg-transparent',
                          ].join(' ')}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            setActiveIndex(index);
                          }}
                          onFocus={() => setActiveIndex(index)}
                          aria-pressed={isActive}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{
                            duration: 0.6,
                            delay: index * 0.08,
                            ease: EASE,
                          }}
                          whileHover={{ y: -2 }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="dossier-rail"
                              className="absolute left-0 top-0 h-full w-[2px] bg-[#e6e2d7]/35"
                              transition={{ duration: 0.45, ease: EASE }}
                            />
                          )}

                          <div className="flex items-start justify-between gap-5 sm:gap-6">
                            <div className="flex-1">
                              <div className="flex items-baseline gap-3 mb-2">
                                <h3
                                  className={[
                                    'font-montserrat font-medium leading-snug transition-colors',
                                    isActive
                                      ? 'text-[#e6e2d7] text-xl'
                                      : 'text-[#e6e2d7]/75 text-xl group-hover:text-[#e6e2d7]/88',
                                  ].join(' ')}
                                >
                                  {dossier.title}
                                </h3>

                                <span
                                  className={[
                                    'text-sm font-light tracking-wide-editorial transition-colors',
                                    isActive ? 'text-[#e6e2d7]/55' : 'text-[#e6e2d7]/32',
                                  ].join(' ')}
                                >
                                  — {dossier.year}
                                </span>
                              </div>

                              <p
                                className={[
                                  'text-sm md:text-base font-light leading-relaxed transition-colors',
                                  isActive ? 'text-[#e6e2d7]/70' : 'text-[#e6e2d7]/42',
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
                                    : 'text-[#e6e2d7]/28 opacity-80',
                                ].join(' ')}
                              >
                                /{dossier.n}
                              </span>
                              <span
                                className={[
                                  'h-2 w-2 rounded-full transition-colors',
                                  isActive ? 'bg-[#e6e2d7]/45' : 'bg-[#e6e2d7]/16',
                                ].join(' ')}
                              />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
