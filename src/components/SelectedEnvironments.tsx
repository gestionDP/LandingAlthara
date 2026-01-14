'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

type EnvTile = {
  label: string;
  img: string;
};

export default function SelectedEnvironments() {
  const t = useTranslations('selectedEnvironments');

  const environments: EnvTile[] = [
    { label: t('environment1'), img: '/jpg/29.jpeg' },
    { label: t('environment2'), img: '/jpg/30.jpeg' },
    { label: t('environment3'), img: '/jpg/31.jpeg' },
    { label: t('environment4'), img: '/jpg/32.jpeg' },
    { label: t('environment5'), img: '/jpg/33.jpeg' },
  ];

  const [activeIndex, setActiveIndex] = React.useState(0);
  const isOdd = environments.length % 2 === 1;

  const gridColsClass = [
    isOdd ? 'grid-cols-1' : 'grid-cols-2', // base (mobile)
    'md:grid-cols-2',
    'lg:grid-cols-5',
  ].join(' ');

  return (
    <section className="relative py-0 bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-[1920px] mx-auto w-full">
        <div className={`grid ${gridColsClass} gap-0`}>
          {environments.map((env, idx) => {
            const isActive = idx === activeIndex;

            return (
              <button
                key={idx}
                type="button"
                onMouseEnter={() => setActiveIndex(idx)}
                onFocus={() => setActiveIndex(idx)}
                onClick={() => setActiveIndex(idx)}
                className="relative text-left overflow-hidden"
                aria-pressed={isActive}
              >
                <div className="relative h-[300px] sm:h-[340px] md:h-[320px] lg:h-[360px]">
                  <Image
                    src={env.img}
                    alt={env.label}
                    fill
                    className={[
                      'object-cover transition-all duration-700',
                      'grayscale saturate-50',
                      isActive
                        ? 'grayscale-0 saturate-110 scale-[1.03]'
                        : 'hover:grayscale-0 hover:saturate-110',
                    ].join(' ')}
                  />

                  <div
                    className={[
                      'absolute inset-0 transition-all duration-700',
                      isActive
                        ? 'bg-[#0a0a0a]/20'
                        : 'bg-[#0a0a0a]/55 hover:bg-[#0a0a0a]/25',
                    ].join(' ')}
                  />

                  <div className="pointer-events-none absolute inset-0 border border-[#e6e2d7]/10" />

                  <div className="absolute inset-0 flex items-end p-4 sm:p-5 md:p-6">
                    <motion.div
                      animate={{
                        opacity: isActive ? 1 : 0.6,
                        scale: isActive ? 1.08 : 1,
                        y: isActive ? -6 : 0,
                      }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full"
                    >
                      <div
                        className={[
                          'w-full border border-white/15 backdrop-blur-xl',
                          'bg-white/10',
                          'px-4 py-3 sm:px-5 sm:py-4',
                          isActive ? 'bg-white/12' : 'bg-white/7',
                        ].join(' ')}
                      >
                        <div
                          className={[
                            'font-playfair font-normal leading-[1.05]',
                            isActive
                              ? 'text-[26px] sm:text-[30px] md:text-[34px] lg:text-[38px] text-white'
                              : 'text-[20px] sm:text-[22px] md:text-[26px] lg:text-[28px] text-white/75',
                          ].join(' ')}
                          style={{
                            textShadow: isActive
                              ? '0 10px 24px rgba(0,0,0,0.45)'
                              : '0 8px 18px rgba(0,0,0,0.35)',
                          }}
                        >
                          {env.label}
                        </div>

                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              transition={{
                                duration: 0.25,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              className="mt-2 text-[11px] tracking-[0.28em] text-white/55"
                            >
                              SELECTED /0{idx + 1}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </div>

                  <div className="pointer-events-none absolute top-3 right-3 sm:top-4 sm:right-4">
                    <div
                      className={[
                        'h-2 w-2 rounded-full transition-colors duration-300',
                        isActive ? 'bg-white/70' : 'bg-white/20',
                      ].join(' ')}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
