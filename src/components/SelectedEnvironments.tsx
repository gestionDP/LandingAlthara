'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  LayoutGroup,
  motion,
  useReducedMotion,
  type Transition,
} from 'framer-motion';

type EnvTile = {
  label: string;
  img: string;
};

const EASE_OUT: Transition['ease'] = [0.16, 1, 0.3, 1];

export default function SelectedEnvironments() {
  const t = useTranslations('selectedEnvironments');

  const environments = React.useMemo<EnvTile[]>(
    () => [
      { label: t('environment1'), img: '/jpg/29.jpeg' },
      { label: t('environment2'), img: '/jpg/30.jpeg' },
      { label: t('environment3'), img: '/jpg/31.jpeg' },
      { label: t('environment4'), img: '/jpg/32.jpeg' },
      { label: t('environment5'), img: '/jpg/33.jpeg' },
    ],
    [t]
  );

  const reduceMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = React.useState(0);

  const [isPaused, setIsPaused] = React.useState(false);
  const resumeTimeoutRef = React.useRef<number | null>(null);
  const autoplayTimeoutRef = React.useRef<number | null>(null);

  const clearResumeTimeout = React.useCallback(() => {
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const clearAutoplayTimeout = React.useCallback(() => {
    if (autoplayTimeoutRef.current) {
      window.clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
  }, []);

  const pauseTemporarily = React.useCallback(
    (ms: number) => {
      setIsPaused(true);
      clearResumeTimeout();
      resumeTimeoutRef.current = window.setTimeout(() => {
        setIsPaused(false);
      }, ms);
    },
    [clearResumeTimeout]
  );

  React.useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        setIsPaused(true);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  React.useEffect(() => {
    if (reduceMotion) return;
    if (isPaused) {
      clearAutoplayTimeout();
      return;
    }
    if (document.visibilityState !== 'visible') return;

    clearAutoplayTimeout();
    autoplayTimeoutRef.current = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % environments.length);
    }, 2400);

    return () => clearAutoplayTimeout();
  }, [reduceMotion, isPaused, environments.length, clearAutoplayTimeout, activeIndex]);

  React.useEffect(() => {
    return () => {
      clearResumeTimeout();
      clearAutoplayTimeout();
    };
  }, [clearResumeTimeout, clearAutoplayTimeout]);

  React.useEffect(() => {
    setActiveIndex((prev) => {
      if (environments.length === 0) return 0;
      return prev >= environments.length ? 0 : prev;
    });
  }, [environments.length]);

  const isOdd = environments.length % 2 === 1;
  const gridColsClass = [
    isOdd ? 'grid-cols-1' : 'grid-cols-2',
    'md:grid-cols-2',
    'lg:grid-cols-5',
  ].join(' ');

  const tileVariants = {
    rest: { scale: 1 },
    active: { scale: 1.01 },
  };

  const overlayVariants = {
    rest: { opacity: 0.55 },
    active: { opacity: 0.2 },
  };

  const imageVariants = {
    rest: { scale: 1, filter: 'grayscale(100%) saturate(50%)' },
    active: { scale: 1.03, filter: 'grayscale(0%) saturate(115%)' },
  };

  const labelVariants = {
    rest: { y: 8, opacity: 0.78 },
    active: { y: 0, opacity: 1 },
  };

  const subtitleBarVariants = {
    rest: { opacity: 0.9 },
    active: { opacity: 1 },
  };

  const onKeyDownTile = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (environments.length === 0) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (idx + 1) % environments.length;
      setActiveIndex(next);
      pauseTemporarily(3500);
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (idx - 1 + environments.length) % environments.length;
      setActiveIndex(prev);
      pauseTemporarily(3500);
    }

    if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
      pauseTemporarily(3500);
    }

    if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(environments.length - 1);
      pauseTemporarily(3500);
    }
  };

  return (
    <section
      className="relative bg-[#0a0a0a]  w-full overflow-hidden"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1920px] mx-auto w-full h-full">
        <LayoutGroup>
          <div className={`grid ${gridColsClass} gap-0 min-h-[70vh]`}>
            {environments.map((env, idx) => {
              const isActive = idx === activeIndex;

              return (
                <motion.button
                  key={`${env.img}-${idx}`}
                  type="button"
                  initial={false}
                  animate={isActive ? 'active' : 'rest'}
                  whileHover={reduceMotion ? undefined : 'active'}
                  variants={tileVariants}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
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
                  onKeyDown={(e) => onKeyDownTile(e, idx)}
                  className={[
                    'relative text-left',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-0',
                  ].join(' ')}
                  aria-pressed={isActive}
                  aria-label={env.label}
                >
                  <div className="relative h-full min-h-[220px]">
                    <motion.div
                      className="absolute inset-0"
                      variants={imageVariants}
                      transition={{ duration: 0.7, ease: EASE_OUT }}
                      style={{ willChange: reduceMotion ? undefined : 'transform, filter' }}
                    >
                      <Image
                        src={env.img}
                        alt={env.label}
                        fill
                        priority={idx === 0 || isActive}
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 50vw, 100vw"
                        quality={80}
                        className="object-cover"
                      />
                    </motion.div>

                    <motion.div
                      className="absolute inset-0 "
                      variants={overlayVariants}
                      transition={{ duration: 0.55, ease: EASE_OUT }}
                      style={{ willChange: reduceMotion ? undefined : 'opacity' }}
                    />

                    <div className="pointer-events-none absolute inset-0 border border-[#e6e2d7]/10" />

                    {isActive && !reduceMotion && (
                      <motion.div
                        layoutId="activeOutline"
                        className="pointer-events-none absolute inset-0 "
                        transition={{ duration: 0.5, ease: EASE_OUT }}
                      />
                    )}

                    <div className="absolute inset-0 flex items-end p-4 sm:p-5 md:p-6">
                      <motion.div
                        className="w-full"
                        variants={labelVariants}
                        transition={{ duration: 0.35, ease: EASE_OUT }}
                        style={{ willChange: reduceMotion ? undefined : 'transform, opacity' }}
                      >
                        <motion.div
                          variants={subtitleBarVariants}
                          transition={{ duration: 0.35, ease: EASE_OUT }}
                          className={[
                            'w-full backdrop-blur-xl',
                            'px-4 py-3 sm:px-5 sm:py-4',
                            'bg-white/10',
                          ].join(' ')}
                          style={{
                            backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
                          }}
                        >
                          <div
                            className={[
                              'font-playfair font-normal leading-[1.05]',
                              'text-[20px] sm:text-[20px] md:text-[24px] lg:text-[24px]',
                              isActive ? 'text-white' : 'text-white/75',
                            ].join(' ')}
                            style={{
                              textShadow: isActive
                                ? '0 10px 24px rgba(0,0,0,0.45)'
                                : '0 8px 18px rgba(0,0,0,0.35)',
                            }}
                          >
                            {env.label}
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>

                    <div className="pointer-events-none absolute top-3 right-3 sm:top-4 sm:right-4">
                      <motion.div
                        className="h-2 w-2 rounded-full bg-white"
                        animate={{ opacity: isActive ? 0.7 : 0.2 }}
                        transition={{ duration: 0.25, ease: EASE_OUT }}
                      />
                    </div>

                    {isActive && !reduceMotion && (
                      <motion.div
                        layoutId="activeBar"
                        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-white/50"
                        transition={{ duration: 0.5, ease: EASE_OUT }}
                      />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
}
