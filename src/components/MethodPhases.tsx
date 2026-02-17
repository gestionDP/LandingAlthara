'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useReveal } from '@/hooks/useReveal';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from 'framer-motion';

type Phase = {
  number: string;
  title: string;
  bullet1: string;
  bullet2: string;
};

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function isElementInViewport(el: HTMLElement, threshold = 0.15) {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;

  const height = Math.max(1, r.height);
  const visiblePx = Math.min(vh, r.bottom) - Math.max(0, r.top);
  const ratio = visiblePx / height;

  return ratio >= threshold;
}

export default function MethodPhases() {
  const t = useTranslations('method');
  const { ref: revealRef, isRevealed } = useReveal({ threshold: 0.2 });
  const prefersReducedMotion = useReducedMotion();

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

  const [isPaused, setIsPaused] = React.useState(false);
  const resumeTimeoutRef = React.useRef<number | null>(null);

  const pauseTemporarily = React.useCallback((ms: number) => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = window.setTimeout(() => setIsPaused(false), ms);
  }, []);

  const tabsRailRef = React.useRef<HTMLDivElement | null>(null);
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const sectionRef = React.useRef<HTMLElement | null>(null);

  const lastChangeWasUserRef = React.useRef(false);

  const centerTabInRail = React.useCallback(
    (idx: number) => {
      const rail = tabsRailRef.current;
      const el = tabRefs.current[idx];
      if (!rail || !el) return;

      const railRect = rail.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      const elLeftWithinRail = elRect.left - railRect.left + rail.scrollLeft;

      const targetLeft =
        elLeftWithinRail - rail.clientWidth / 2 + el.clientWidth / 2;

      rail.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    },
    [prefersReducedMotion]
  );

  React.useEffect(() => {
    if (prefersReducedMotion) return;
    if (isPaused) return;

    const id = window.setInterval(() => {
      lastChangeWasUserRef.current = false;
      setActive((prev) => (prev + 1) % phases.length);
    }, 4200);

    return () => window.clearInterval(id);
  }, [isPaused, phases.length, prefersReducedMotion]);

  React.useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current)
        window.clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  const current = phases[active];

  const selectPhase = (idx: number) => {
    lastChangeWasUserRef.current = true;
    setActive(idx);
    pauseTemporarily(4500);
  };

  React.useEffect(() => {
    if (prefersReducedMotion) return;

    if (!lastChangeWasUserRef.current) {
      const sectionEl = sectionRef.current;
      if (!sectionEl) return;
      if (typeof window === 'undefined') return;
      if (!isElementInViewport(sectionEl, 0.15)) return;
    }

    centerTabInRail(active);
  }, [active, prefersReducedMotion, centerTabInRail]);

  const onKeyDownTabs = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      selectPhase((active + 1) % phases.length);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      selectPhase((active - 1 + phases.length) % phases.length);
    }
    if (e.key === 'Home') {
      e.preventDefault();
      selectPhase(0);
    }
    if (e.key === 'End') {
      e.preventDefault();
      selectPhase(phases.length - 1);
    }
  };

  const setSectionRefs = React.useCallback(
    (node: HTMLElement | null) => {
      sectionRef.current = node;

      if (typeof revealRef === 'function') {
        (revealRef as (node: HTMLElement | null) => void)(node);
      } else if (revealRef && typeof revealRef === 'object') {
        (revealRef as React.MutableRefObject<HTMLElement | null>).current =
          node;
      }
    },
    [revealRef]
  );

  return (
    <section
      ref={setSectionRefs}
      id="method"
      className="relative bg-[#0a0a0a] overflow-hidden py-24"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 pointer-events-none">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-[0.70]"
          src="/videos/4.mp4"
          autoPlay={!prefersReducedMotion}
          muted
          loop={!prefersReducedMotion}
          playsInline
          preload="metadata"
        >
          <source src="/videos/4.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10 h-full">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 h-full">
          <motion.div
            className="h-full flex flex-col"
            initial={{ opacity: 0, y: 12 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
          >
            <div className="shrink-0 pt-10 md:pt-12 lg:pt-14">
              <div className="flex items-end justify-between gap-6">
                <p className="text-xs tracking-extreme-editorial text-[#e6e2d7]/60 font-light">
                  {t('label')}
                </p>

                <div className="hidden md:flex items-center gap-2 text-xs tracking-[0.28em] text-[#e6e2d7]/35">
                  <span>/{current.number}</span>
                  <span className="h-px w-10 bg-[#e6e2d7]/15" />
                  <span>{t('mode.manual')}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col gap-4 md:gap-5 lg:gap-7 pt-4 md:pt-5 lg:pt-6 pb-6">
              <LayoutGroup>
                <div
                  className="shrink-0 border border-[#e6e2d7]/12 bg-[#0f0f0f]/25 backdrop-blur-md md:backdrop-blur-xl"
                  role="tablist"
                  aria-label={t('label')}
                  onKeyDown={onKeyDownTabs}
                >
                  <div
                    ref={tabsRailRef}
                    className={[
                      'flex items-stretch overflow-x-auto',
                      '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                      'snap-x snap-mandatory',
                      'px-2 md:px-0',
                    ].join(' ')}
                  >
                    {phases.map((p, idx) => {
                      const isActive = idx === active;

                      return (
                        <button
                          key={p.number}
                          ref={(node) => {
                            tabRefs.current[idx] = node;
                          }}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-controls={`phase-panel-${p.number}`}
                          className={[
                            'relative text-left transition-colors outline-none',
                            'border-r border-[#e6e2d7]/10 last:border-r-0',
                            isActive
                              ? 'bg-white/5'
                              : 'bg-transparent hover:bg-white/3',
                            'snap-center',
                            'shrink-0 w-[78vw] xs:w-[72vw] sm:w-[56vw]',
                            'lg:w-auto lg:flex-1',
                            'px-5 md:px-6 py-4',
                            'focus-visible:ring-2 focus-visible:ring-[#e6e2d7]/40 focus-visible:ring-offset-0',
                          ].join(' ')}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            selectPhase(idx);
                          }}
                          onFocus={() => {
                            selectPhase(idx);
                          }}
                          onClick={() => {
                            selectPhase(idx);
                          }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 border-b border-[#e6e2d7]/25 bg-white/[0.03]"
                              transition={{ duration: 0.45, ease: EASE_OUT }}
                            />
                          )}

                          <div className="relative flex items-center justify-between gap-6 min-w-0">
                            <div className="min-w-0">
                              <div
                                className={[
                                  'text-[11px] md:text-xs tracking-[0.28em] transition-colors',
                                  isActive
                                    ? 'text-[#e6e2d7]/60'
                                    : 'text-[#e6e2d7]/30',
                                ].join(' ')}
                              >
                                / {p.number}
                              </div>

                              <motion.div
                                layout
                                transition={{ duration: 0.45, ease: EASE_OUT }}
                                className={[
                                  'mt-2 font-playfair leading-[1.05] text-lg md:text-xl',
                                  isActive
                                    ? 'text-[#e6e2d7]'
                                    : 'text-[#e6e2d7]/65',
                                  'line-clamp-1',
                                ].join(' ')}
                              >
                                {p.title}
                              </motion.div>
                            </div>

                            <div className="relative h-5 w-5 flex items-center justify-center">
                              {isActive ? (
                                <motion.div
                                  layoutId="activeDot"
                                  className="h-2 w-2 rounded-full bg-[#e6e2d7]/55"
                                  transition={{
                                    duration: 0.45,
                                    ease: EASE_OUT,
                                  }}
                                />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-[#e6e2d7]/15" />
                              )}
                            </div>
                          </div>

                          {!prefersReducedMotion && isActive && (
                            <div className="hidden lg:block relative mt-4 h-px bg-[#e6e2d7]/10 overflow-hidden">
                              <motion.div
                                key={p.number}
                                className="absolute left-0 top-0 h-full w-full origin-left bg-[#e6e2d7]/35"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: isPaused ? 0 : 1 }}
                                transition={{ duration: 4.1, ease: 'linear' }}
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="lg:hidden px-5 py-3 border-t border-[#e6e2d7]/10 flex items-center gap-2">
                    {phases.map((_, i) => (
                      <div
                        key={i}
                        className={[
                          'h-px flex-1 transition-opacity',
                          i === active
                            ? 'bg-[#e6e2d7]/35 opacity-100'
                            : 'bg-[#e6e2d7]/10 opacity-60',
                        ].join(' ')}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <div className="relative h-full border border-[#e6e2d7]/12 bg-[#0f0f0f]/30 backdrop-blur-md md:backdrop-blur-xl overflow-hidden">
                    <div className="pointer-events-none absolute inset-0">
                      <motion.div
                        className="absolute -top-24 left-1/2 h-[240px] md:h-[260px] w-[560px] md:w-[720px] -translate-x-1/2 rounded-full bg-[#e6e2d7]/[0.05] blur-3xl"
                        animate={
                          prefersReducedMotion ? {} : { opacity: [0.6, 1, 0.6] }
                        }
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </div>

                    <div className="relative h-full overflow-y-auto overscroll-contain p-6 md:p-8 lg:p-10">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={current.number}
                          id={`phase-panel-${current.number}`}
                          role="tabpanel"
                          initial={
                            prefersReducedMotion
                              ? { opacity: 0 }
                              : { opacity: 0, y: 12 }
                          }
                          animate={
                            prefersReducedMotion
                              ? { opacity: 1 }
                              : { opacity: 1, y: 0 }
                          }
                          exit={
                            prefersReducedMotion
                              ? { opacity: 0 }
                              : { opacity: 0, y: -10 }
                          }
                          transition={{ duration: 0.45, ease: EASE_OUT }}
                        >
                          <div className="flex items-start justify-between gap-8">
                            <div className="min-w-0">
                              <div className="flex items-center gap-3">
                                <span className="text-xs tracking-[0.28em] text-[#e6e2d7]/45">
                                  {t('label')}
                                </span>
                                <span className="h-px w-10 bg-[#e6e2d7]/15" />
                                <span className="text-xs tracking-[0.28em] text-[#e6e2d7]/35">
                                  /{current.number}
                                </span>
                              </div>

                              <h3 className="mt-4 text-2xl md:text-3xl lg:text-4xl text-[#e6e2d7]/95 font-playfair font-normal leading-[1.1] line-clamp-2">
                                {current.title}
                              </h3>
                            </div>

                            <div className="hidden sm:block text-right">
                              <div className="text-xs tracking-[0.28em] text-[#e6e2d7]/35">
                                {t('statusLabel')}
                              </div>
                              <div className="mt-2 text-sm text-[#e6e2d7]/60 font-light">
                                {t('activeWindow')}
                              </div>
                            </div>
                          </div>

                          <motion.div
                            className="mt-8 md:mt-10 space-y-4"
                            initial="hidden"
                            animate="show"
                            variants={{
                              hidden: { opacity: 0 },
                              show: {
                                opacity: 1,
                                transition: prefersReducedMotion
                                  ? { duration: 0.2 }
                                  : {
                                      staggerChildren: 0.08,
                                      delayChildren: 0.05,
                                    },
                              },
                            }}
                          >
                            {[current.bullet1, current.bullet2].map((b, i) => (
                              <motion.div
                                key={i}
                                className="flex items-start gap-3"
                                variants={{
                                  hidden: prefersReducedMotion
                                    ? { opacity: 0 }
                                    : { opacity: 0, y: 8 },
                                  show: prefersReducedMotion
                                    ? { opacity: 1 }
                                    : { opacity: 1, y: 0 },
                                }}
                                transition={{ duration: 0.35, ease: EASE_OUT }}
                              >
                                <span className="text-[#e6e2d7]/35 mt-1">
                                  —
                                </span>
                                <p className="text-sm md:text-base text-[#e6e2d7]/75 font-light leading-relaxed">
                                  {b}
                                </p>
                              </motion.div>
                            ))}
                          </motion.div>

                          <div className="mt-10 md:mt-12 pt-6 border-t border-[#e6e2d7]/10 flex items-center justify-between gap-6">
                            <p className="text-xs tracking-[0.22em] text-[#e6e2d7]/40">
                              {t('outputLabel')}: {t(`outputs.${active}`)}
                            </p>
                            <p className="hidden md:block text-xs tracking-[0.22em] text-[#e6e2d7]/30">
                              {t('controls.navigate')}
                            </p>
                          </div>

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

                          <div className="mt-8 md:mt-10">
                            <p className="text-base md:text-lg text-[#e6e2d7]/55 font-light italic">
                              {t('finalLine')}
                            </p>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </LayoutGroup>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
