'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

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

  // ---- Autoplay control ----
  const [isPaused, setIsPaused] = React.useState(false);
  const resumeTimeoutRef = React.useRef<number | null>(null);

  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  const pauseTemporarily = React.useCallback((ms: number) => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = window.setTimeout(() => setIsPaused(false), ms);
  }, []);

  React.useEffect(() => {
    if (prefersReducedMotion) return;
    if (isPaused) return;

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % environments.length);
    }, 2400); 

    return () => window.clearInterval(id);
  }, [isPaused, environments.length, prefersReducedMotion]);

  React.useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  const isOdd = environments.length % 2 === 1;

  const gridColsClass = [
    isOdd ? 'grid-cols-1' : 'grid-cols-2',
    'md:grid-cols-2',
    'lg:grid-cols-5',
  ].join(' ');

  return (
    <section
      className="relative py-0 bg-[#0a0a0a] overflow-hidden"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1920px] mx-auto w-full">
        <div className={`grid ${gridColsClass} gap-0`}>
          {environments.map((env, idx) => {
            const isActive = idx === activeIndex;

            return (
              <button
                key={idx}
                type="button"
                onMouseEnter={() => {
                  setActiveIndex(idx);
                  setIsPaused(true);
                }}
                onFocus={() => {
                  setActiveIndex(idx);
                  pauseTemporarily(3500);
                }}
                onClick={() => {
                  setActiveIndex(idx);
                  pauseTemporarily(3500);
                }}
             
                onPointerDown={() => {
                  setActiveIndex(idx);
                  pauseTemporarily(3500);
                }}
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
                        ? 'grayscale-0 saturate-110'
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
                      animate={{ opacity: isActive ? 1 : 0.75, scale: 1, y: 0 }}
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
                              ? 'text-[20px] sm:text-[20px] md:text-[24px] lg:text-[24px] text-white'
                              : 'text-[20px] sm:text-[20px] md:text-[24px] lg:text-[24px] text-white/75',
                          ].join(' ')}
                          style={{
                            textShadow: isActive
                              ? '0 10px 24px rgba(0,0,0,0.45)'
                              : '0 8px 18px rgba(0,0,0,0.35)',
                          }}
                        >
                          {env.label}
                        </div>
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
