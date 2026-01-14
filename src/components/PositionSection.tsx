'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useReveal } from '@/hooks/useReveal';
import { motion, AnimatePresence } from 'framer-motion';

type Panel = {
  key: 'signals' | 'routes' | 'edge';
  claim: string;
  title: string;
  body: string;
  items: string[];
  bg: string;
};

export default function PositionSection() {
  const t = useTranslations('position');
  const { ref, isRevealed } = useReveal({ type: 'text', threshold: 0.2 });

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

  const handleSelect = (idx: number) => {
    setActive(idx);
  };

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative py-24 lg:py-32 overflow-hidden bg-[#0a0a0a]"
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="hidden lg:grid absolute inset-0 grid-cols-3">
          {panels.map((p, idx) => {
            const isActive = idx === active;

            return (
              <motion.div
                key={p.key}
                className="relative h-full w-full"
                animate={{
                  opacity: isActive ? 1 : 0.55,
                  filter: isActive ? 'grayscale(0%)' : 'grayscale(100%)',
                }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={p.bg}
                  alt=""
                  fill
                  priority={false}
                  className="object-cover"
                />

                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: isActive ? 0 : 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="absolute inset-0 bg-[#0a0a0a]/12" />
                </motion.div>

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
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={current.bg}
                alt=""
                fill
                priority={false}
                className="object-cover grayscale"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-[#0a0a0a]/72" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/75 via-transparent to-transparent" />
        </div>

        <div className="absolute left-0 right-0 top-0 h-px bg-[#e6e2d7]/10" />
        <div className="absolute left-0 right-0 bottom-0 h-px bg-[#e6e2d7]/10" />
      </div>

      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <p className="text-xs tracking-extreme-editorial text-[#e6e2d7]/55 font-light">
            {t('label')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="border border-[#e6e2d7]/10 bg-[#0f0f0f]/28 backdrop-blur-md">
              <div className="p-7 md:p-9">
                <div className="space-y-6">
                  {panels.map((p, idx) => {
                    const isActive = idx === active;

                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setActive(idx)}
                        className="w-full text-left"
                        aria-pressed={idx === active}
                      >
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={
                            isRevealed
                              ? { opacity: 1, y: 0 }
                              : { opacity: 0, y: 10 }
                          }
                          transition={{
                            duration: 0.55,
                            delay: idx * 0.06,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className={[
                            'font-playfair leading-[1.08] transition-all duration-300',
                            isActive
                              ? 'text-[#e6e2d7] text-2xl md:text-2xl'
                              : 'text-[#e6e2d7]/55 text-2xl md:text-2xl',
                          ].join(' ')}
                        >
                          {p.claim}
                        </motion.p>

                        <div className="mt-3 flex items-center gap-3">
                          <span
                            className={[
                              'h-px flex-1 transition-opacity duration-300',
                              isActive
                                ? 'bg-[#e6e2d7]/22 opacity-100'
                                : 'bg-[#e6e2d7]/10 opacity-60',
                            ].join(' ')}
                          />
                          <span
                            className={[
                              'text-xs tracking-[0.28em] transition-opacity duration-300',
                              isActive
                                ? 'text-[#e6e2d7]/45 opacity-100'
                                : 'text-[#e6e2d7]/18 opacity-70',
                            ].join(' ')}
                          >
                            /0{idx + 1}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-10 text-base md:text-lg text-[#e6e2d7]/55 font-light leading-relaxed max-w-xl">
                  {t('paragraph')}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <div className="h-full w-px bg-[#e6e2d7]/10 mx-auto" />
          </div>

          <div className="lg:col-span-6">
            <div className="border border-[#e6e2d7]/10 bg-[#0f0f0f]/24 backdrop-blur-md">
              <div className="p-7 md:p-9 min-h-[340px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.key}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
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

                      <div className="mt-1 h-2 w-2 rounded-full bg-[#e6e2d7]/18" />
                    </div>

                    <div className="mt-8 space-y-3">
                      {current.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-[#e6e2d7]/28 mt-1">—</span>
                          <p className="text-sm md:text-base text-[#e6e2d7]/70 font-light leading-relaxed">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-9 flex items-center gap-2">
                  {panels.map((_, idx) => (
                    <div
                      key={idx}
                      className={[
                        'h-px flex-1 transition-opacity',
                        idx === active
                          ? 'bg-[#e6e2d7]/22 opacity-100'
                          : 'bg-[#e6e2d7]/10 opacity-60',
                      ].join(' ')}
                    />
                  ))}
                </div>

                <div className="mt-3 text-[11px] tracking-wide text-[#e6e2d7]/25">
                  {t('progress.paused')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
