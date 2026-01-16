'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

type PanelKey = 'signals' | 'routes' | 'edge';

type Panel = {
  key: PanelKey;
  claim: string;
  title: string;
  body: string;
  items: string[];
  bg: string;
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function PositionSection() {
  const t = useTranslations('position');

  const panels: Panel[] = [
    {
      key: 'signals',
      claim: t('line1'),
      title: t('tab1_title'),
      body: t('tab1_body'),
      items: [t('tab1_item1'), t('tab1_item2'), t('tab1_item3')],
      bg: '/jpg/22.png',
    },
    {
      key: 'routes',
      claim: t('line2'),
      title: t('tab2_title'),
      body: t('tab2_body'),
      items: [t('tab2_item1'), t('tab2_item2'), t('tab2_item3')],
      bg: '/jpg/16.jpg',
    },
    {
      key: 'edge',
      claim: t('line3'),
      title: t('tab3_title'),
      body: t('tab3_body'),
      items: [t('tab3_item1'), t('tab3_item2'), t('tab3_item3')],
      bg: '/jpg/11.jpg',
    },
  ];

  const [active, setActive] = React.useState(0);
  const current = panels[active];

  return (
    <section className="relative bg-[#0a0a0a] min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="hidden lg:grid absolute inset-0 grid-cols-3">
          {panels.map((p, idx) => {
            const isActive = idx === active;

            return (
              <motion.div
                key={p.key}
                className="relative h-full w-full"
                animate={{ opacity: isActive ? 1 : 0.9 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <Image
                  src={p.bg}
                  alt=""
                  fill
                  priority={false}
                  className={[
                    'object-cover',
                    'transition-[filter,transform] duration-500 ease-out',
                    isActive
                      ? 'filter-none scale-[1.02]'
                      : 'grayscale contrast-105 brightness-95',
                  ].join(' ')}
                />

                <motion.div
                  className="absolute inset-0"
                  animate={{
                    opacity: isActive ? 0 : 1,
                    backdropFilter: isActive ? 'blur(0px)' : 'blur(1.5px)',
                  }}
                  transition={{ duration: 0.55, ease: EASE }}
                />

                {idx < 2 && (
                  <div className="absolute right-0 top-0 h-full w-px bg-[#e6e2d7]/10" />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="lg:hidden absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.bg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="absolute inset-0"
            >
              <Image
                src={current.bg}
                alt=""
                fill
                priority={false}
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-[#0a0a0a]/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/55 via-[#0a0a0a]/20 to-[#0a0a0a]/35" />
        </div>

        <div className="absolute left-0 right-0 top-0 h-px bg-[#e6e2d7]/10" />
        <div className="absolute left-0 right-0 bottom-0 h-px bg-[#e6e2d7]/10" />
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="pt-20 md:pt-24 lg:pt-28"
        >
          <p className="text-xs tracking-extreme-editorial text-[#e6e2d7]/55 font-light">
            {t('label')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 pb-20 md:pb-24 lg:pb-28 pt-10 md:pt-12 lg:pt-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease: EASE }}
            className="lg:col-span-5"
          >
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="border border-[#e6e2d7]/10 bg-[#0f0f0f]/30 backdrop-blur-md"
            >
              <div className="p-6 md:p-8">
                <div className="space-y-5">
                  {panels.map((p, idx) => {
                    const isActive = idx === active;

                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setActive(idx)}
                        className="w-full text-left group"
                        aria-pressed={isActive}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <p
                            className={[
                              'font-montserrat leading-[1.08] transition-colors duration-300',
                              'text-2xl md:text-2xl font-medium',
                              isActive
                                ? 'text-[#e6e2d7]'
                                : 'text-[#e6e2d7]/55 group-hover:text-[#e6e2d7]/75',
                            ].join(' ')}
                          >
                            {p.claim}
                          </p>

                          <span
                            className={[
                              'text-[11px] md:text-xs tracking-[0.28em] transition-opacity duration-300 pt-2',
                              isActive
                                ? 'text-[#e6e2d7]/45 opacity-100'
                                : 'text-[#e6e2d7]/18 opacity-70',
                            ].join(' ')}
                          >
                            /0{idx + 1}
                          </span>
                        </div>

                        {/* Hairline + moving indicator */}
                        <div className="mt-3 relative">
                          <div className="h-px w-full bg-[#e6e2d7]/10" />
                          {isActive && (
                            <motion.div
                              layoutId="active-indicator"
                              className="absolute left-0 top-0 h-px w-full bg-[#e6e2d7]/25"
                              transition={{ duration: 0.45, ease: EASE }}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-8 text-base md:text-lg text-[#e6e2d7]/55 font-light leading-relaxed max-w-xl">
                  {t('paragraph')}
                </p>

                <div className="mt-8 lg:hidden flex items-center gap-2">
                  {panels.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActive(idx)}
                      aria-label={`Go to panel ${idx + 1}`}
                      className="flex-1"
                    >
                      <motion.div
                        animate={{
                          opacity: idx === active ? 1 : 0.45,
                          scaleX: idx === active ? 1 : 0.7,
                        }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="h-px origin-left bg-[#e6e2d7]/22 w-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="hidden lg:block lg:col-span-1">
            <div className="h-full w-px bg-[#e6e2d7]/10 mx-auto" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease: EASE, delay: 0.06 }}
            className="lg:col-span-6"
          >
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="border border-[#e6e2d7]/10 bg-[#0f0f0f]/26 backdrop-blur-md"
            >
              <div className="p-6 md:p-8 min-h-[320px] md:min-h-[340px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs tracking-[0.28em] text-[#e6e2d7]/35">
                            {t('outputLabel')}
                          </span>
                          <span className="h-px w-10 bg-[#e6e2d7]/12" />
                        </div>

                        <h3 className="mt-3 text-2xl md:text-3xl text-[#e6e2d7]/92 font-light leading-snug">
                          {current.title}
                        </h3>

                        <p className="mt-4 text-base md:text-lg text-[#e6e2d7]/60 font-light leading-relaxed max-w-2xl">
                          {current.body}
                        </p>
                      </div>

                      <div className="mt-2 h-2 w-2 rounded-full bg-[#e6e2d7]/18" />
                    </div>

                    <div className="mt-7 md:mt-8 space-y-3">
                      {current.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-[#e6e2d7]/28 mt-1">—</span>
                          <p className="text-sm md:text-base text-[#e6e2d7]/72 font-light leading-relaxed">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 md:mt-9 flex items-center gap-2">
                  {panels.map((_, idx) => (
                    <motion.div
                      key={idx}
                      animate={{
                        opacity: idx === active ? 1 : 0.55,
                        scaleX: idx === active ? 1 : 0.7,
                      }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="h-px origin-left bg-[#e6e2d7]/20 flex-1"
                    />
                  ))}
                </div>

                <div className="mt-3 text-[11px] tracking-wide text-[#e6e2d7]/25">
                  {t('progress.paused')}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
