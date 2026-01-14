'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useReveal } from '@/hooks/useReveal';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = {
  number: string;
  title: string;
  bullet1: string;
  bullet2: string;
};

export default function MethodPhases() {
  const t = useTranslations('method');
  const { ref, isRevealed } = useReveal({ threshold: 0.2 });

  const phases: Phase[] = [
    {
      number: '01',
      title: t('phase1.title'),
      bullet1: t('phase1.bullet1'),
      bullet2: t('phase1.bullet2'),
    },
    {
      number: '02',
      title: t('phase2.title'),
      bullet1: t('phase2.bullet1'),
      bullet2: t('phase2.bullet2'),
    },
    {
      number: '03',
      title: t('phase3.title'),
      bullet1: t('phase3.bullet1'),
      bullet2: t('phase3.bullet2'),
    },
    {
      number: '04',
      title: t('phase4.title'),
      bullet1: t('phase4.bullet1'),
      bullet2: t('phase4.bullet2'),
    },
    {
      number: '05',
      title: t('phase5.title'),
      bullet1: t('phase5.bullet1'),
      bullet2: t('phase5.bullet2'),
    },
  ];

  const [active, setActive] = React.useState(0);
  const [isInteracting, setIsInteracting] = React.useState(false);

  React.useEffect(() => {
    if (!isRevealed) return;
    if (isInteracting) return;

    const id = window.setInterval(() => {
      setActive((p) => (p + 1) % phases.length);
    }, 3800);

    return () => window.clearInterval(id);
  }, [isRevealed, isInteracting, phases.length]);

  const current = phases[active];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="method"
      className="relative overflow-hidden bg-[#0a0a0a]"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => window.setTimeout(() => setIsInteracting(false), 900)}
      onTouchStart={() => setIsInteracting(true)}
    >
      <div className="absolute inset-0 pointer-events-none">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-[0.35]"
          src="/videos/4.mp4"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/videos/4.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/25 to-[#0a0a0a]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_45%,rgba(10,10,10,0.15)_0%,rgba(10,10,10,0.55)_70%,rgba(10,10,10,0.75)_100%)]" />

        <div className="absolute left-0 right-0 top-0 h-px bg-[#e6e2d7]/10" />
        <div className="absolute left-0 right-0 bottom-0 h-px bg-[#e6e2d7]/10" />
      </div>

      <div className="relative z-10 py-32 lg:py-32">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-14 flex items-end justify-between gap-6">
              <p className="text-xs tracking-extreme-editorial text-[#e6e2d7]/60 font-light">
                {t('label')}
              </p>

              <div className="hidden md:flex items-center gap-2 text-xs tracking-[0.28em] text-[#e6e2d7]/35">
                <span>/{current.number}</span>
                <span className="h-px w-10 bg-[#e6e2d7]/15" />
                <span>{isInteracting ? 'MANUAL' : 'AUTOPLAY'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
              <div className="lg:col-span-4">
                <div className="border border-[#e6e2d7]/12 bg-[#0f0f0f]/30 backdrop-blur-xl">
                  <div className="divide-y divide-[#e6e2d7]/10">
                    {phases.map((p, idx) => {
                      const isActive = idx === active;

                      return (
                        <button
                          key={p.number}
                          type="button"
                          className={[
                            'w-full text-left px-7 py-6 transition-colors',
                            isActive
                              ? 'bg-white/5'
                              : 'bg-transparent hover:bg-white/3',
                          ].join(' ')}
                          onMouseEnter={() => setActive(idx)}
                          onFocus={() => setActive(idx)}
                          onClick={() => setActive(idx)}
                          aria-pressed={isActive}
                        >
                          <div className="flex items-center justify-between gap-6">
                            <div>
                              <div
                                className={[
                                  'text-xs tracking-[0.28em] transition-colors',
                                  isActive
                                    ? 'text-[#e6e2d7]/60'
                                    : 'text-[#e6e2d7]/30',
                                ].join(' ')}
                              >
                                / {p.number}
                              </div>

                              <div
                                className={[
                                  'mt-2 font-playfair transition-all leading-[1.05]',
                                  isActive
                                    ? 'text-[#e6e2d7] text-2xl md:text-2xl'
                                    : 'text-[#e6e2d7]/65 text-xl md:text-xl',
                                ].join(' ')}
                              >
                                {p.title}
                              </div>
                            </div>

                            <div
                              className={[
                                'h-2 w-2 rounded-full transition-colors',
                                isActive
                                  ? 'bg-[#e6e2d7]/45'
                                  : 'bg-[#e6e2d7]/15',
                              ].join(' ')}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="relative border border-[#e6e2d7]/12 bg-[#0f0f0f]/30 backdrop-blur-xl overflow-hidden">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-24 left-1/2 h-[260px] w-[720px] -translate-x-1/2 rounded-full bg-[#e6e2d7]/[0.05] blur-3xl" />
                  </div>

                  <div className="p-8 md:p-10 min-h-[340px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={current.number}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="flex items-start justify-between gap-8">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs tracking-[0.28em] text-[#e6e2d7]/45">
                                METHOD
                              </span>
                              <span className="h-px w-10 bg-[#e6e2d7]/15" />
                              <span className="text-xs tracking-[0.28em] text-[#e6e2d7]/35">
                                /{current.number}
                              </span>
                            </div>

                            <h3 className="mt-4 text-3xl md:text-4xl text-[#e6e2d7]/95 font-playfair font-normal leading-[1.1]">
                              {current.title}
                            </h3>
                          </div>

                          <div className="text-right">
                            <div className="text-xs tracking-[0.28em] text-[#e6e2d7]/35">
                              STATUS
                            </div>
                            <div className="mt-2 text-sm text-[#e6e2d7]/60 font-light">
                              Active window
                            </div>
                          </div>
                        </div>

                        <div className="mt-10 space-y-4">
                          <div className="flex items-start gap-3">
                            <span className="text-[#e6e2d7]/35 mt-1">—</span>
                            <p className="text-sm md:text-base text-[#e6e2d7]/75 font-light leading-relaxed">
                              {current.bullet1}
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="text-[#e6e2d7]/35 mt-1">—</span>
                            <p className="text-sm md:text-base text-[#e6e2d7]/75 font-light leading-relaxed">
                              {current.bullet2}
                            </p>
                          </div>
                        </div>

                        <div className="mt-12 pt-6 border-t border-[#e6e2d7]/10 flex items-center justify-between gap-6">
                          <p className="text-xs tracking-[0.22em] text-[#e6e2d7]/40">
                            OUTPUT:{' '}
                            {active === 0
                              ? 'Briefing'
                              : active === 1
                              ? 'Route'
                              : active === 2
                              ? 'Model'
                              : active === 3
                              ? 'Action path'
                              : 'Review loop'}
                          </p>
                          <p className="text-xs tracking-[0.22em] text-[#e6e2d7]/30">
                            {isInteracting
                              ? 'Hover / tap to navigate'
                              : 'Autoplay scanning'}
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-6 flex items-center gap-2">
                      {phases.map((_, idx) => (
                        <div
                          key={idx}
                          className={[
                            'h-px flex-1 transition-opacity',
                            idx === active
                              ? 'bg-[#e6e2d7]/30 opacity-100'
                              : 'bg-[#e6e2d7]/10 opacity-60',
                          ].join(' ')}
                        />
                      ))}
                    </div>

                    <div className="mt-10">
                      <p className="text-base md:text-lg text-[#e6e2d7]/55 font-light italic">
                        {t('finalLine')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
