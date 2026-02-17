'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  LayoutGroup,
  motion,
  useInView,
  useReducedMotion,
  type Transition,
} from 'framer-motion';
import { useCarouselCore } from '@/hooks/useCarouselCore';

type EnvTile = {
  label: string;
  img: string;
};

const EASE_OUT: Transition['ease'] = [0.16, 1, 0.3, 1];

const SPEED = 1.6;
const AUTOPLAY_MS = 4200;

const T = {
  enter: 0.9 * SPEED,
  stagger: 0.06 * SPEED,
  tile: 0.45 * SPEED,
  image: 0.7 * SPEED,
  overlay: 0.55 * SPEED,
  label: 0.35 * SPEED,
  subtitle: 0.35 * SPEED,
  outline: 0.5 * SPEED,
  bar: 0.5 * SPEED,
  dot: 0.25 * SPEED,
};

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

  const {
    activeIndex,
    setActiveIndex,
    goNext,
    goPrev,
    isPaused,
    setIsPaused,
    pauseTemporarily,
  } = useCarouselCore({
    itemCount: environments.length,
    autoplay: !reduceMotion,
    interval: AUTOPLAY_MS,
    pauseOnHover: true,
    loop: true,
  });

  const isOdd = environments.length % 2 === 1;
  const gridColsClass = [
    isOdd ? 'grid-cols-1' : 'grid-cols-2',
    'md:grid-cols-2',
    'lg:grid-cols-5',
  ].join(' ');

  const sectionRef = React.useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, {
    once: true,
    amount: 0.25,
  });

  const containerVariants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: T.stagger,
            delayChildren: 0.06 * SPEED,
          },
        },
      };

  const tileVariants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        rest: { opacity: 1, scale: 1 },
        active: { opacity: 1, scale: 1.01 },
      }
    : {
        hidden: {
          opacity: 0,
          y: 22,
          filter: 'blur(12px)',
          clipPath: 'inset(100% 0% 0% 0% )', 
        },
        rest: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          clipPath: 'inset(0% 0% 0% 0% )',
          scale: 1,
          transition: { duration: T.enter, ease: EASE_OUT },
        },
        active: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          clipPath: 'inset(0% 0% 0% 0% )',
          scale: 1.01,
          transition: { duration: T.tile, ease: EASE_OUT },
        },
      };

  const overlayVariants = {
    hidden: { opacity: 0.75 },
    rest: { opacity: 0.55 },
    active: { opacity: 0.2 },
  };

  const imageVariants = {
    hidden: { scale: 1.02, filter: 'grayscale(100%) saturate(50%) blur(6px)' },
    rest: { scale: 1, filter: 'grayscale(100%) saturate(50%)' },
    active: { scale: 1.03, filter: 'grayscale(0%) saturate(115%)' },
  };

  const labelVariants = {
    hidden: { y: 14, opacity: 0 },
    rest: { y: 8, opacity: 0.78 },
    active: { y: 0, opacity: 1 },
  };

  const subtitleBarVariants = {
    hidden: { opacity: 0 },
    rest: { opacity: 0.9 },
    active: { opacity: 1 },
  };

  const onKeyDownTile = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (environments.length === 0) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
      pauseTemporarily(3500);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
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
      ref={sectionRef as unknown as React.RefObject<HTMLElement>}
      className="relative bg-[#0a0a0a] w-full overflow-hidden"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1920px] mx-auto w-full h-full">
        <LayoutGroup>
          <motion.div
            className={`grid ${gridColsClass} gap-0 min-h-[70vh]`}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
          >
            {environments.map((env, idx) => {
              const isActive = idx === activeIndex;

              const state = !inView ? 'hidden' : isActive ? 'active' : 'rest';

              return (
                <motion.button
                  key={`${env.img}-${idx}`}
                  type="button"
                  variants={tileVariants}
                  initial="hidden"
                  animate={state}
                  whileHover={reduceMotion ? undefined : 'active'}
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
                  onKeyDown={onKeyDownTile}
                  className={[
                    'relative text-left',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-0',
                  ].join(' ')}
                  aria-pressed={isActive}
                  aria-label={env.label}
                  style={{ willChange: reduceMotion ? undefined : 'transform, opacity, filter, clip-path' }}
                >
                  <div className="relative h-full min-h-[220px]">
                    <motion.div
                      className="absolute inset-0"
                      variants={imageVariants}
                      transition={{ duration: T.image, ease: EASE_OUT }}
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
                      className="absolute inset-0"
                      variants={overlayVariants}
                      transition={{ duration: T.overlay, ease: EASE_OUT }}
                      style={{ willChange: reduceMotion ? undefined : 'opacity' }}
                    />

                    <div className="pointer-events-none absolute inset-0 border border-[#e6e2d7]/10" />

                    {isActive && !reduceMotion && (
                      <motion.div
                        layoutId="activeOutline"
                        className="pointer-events-none absolute inset-0"
                        transition={{ duration: T.outline, ease: EASE_OUT }}
                      />
                    )}

                    <div className="absolute inset-0 flex items-end p-4 sm:p-5 md:p-6">
                      <motion.div
                        className="w-full"
                        variants={labelVariants}
                        transition={{ duration: T.label, ease: EASE_OUT, delay: reduceMotion ? 0 : 0.05 }}
                        style={{ willChange: reduceMotion ? undefined : 'transform, opacity' }}
                      >
                        <motion.div
                          variants={subtitleBarVariants}
                          transition={{ duration: T.subtitle, ease: EASE_OUT, delay: reduceMotion ? 0 : 0.05 }}
                          className={[
                            'w-full backdrop-blur-xl',
                            'px-4 py-3 sm:px-5 sm:py-4',
                            'bg-white/10',
                          ].join(' ')}
                          style={{
                            backgroundColor: isActive
                              ? 'rgba(255,255,255,0.12)'
                              : 'rgba(255,255,255,0.07)',
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
                        transition={{ duration: T.dot, ease: EASE_OUT }}
                      />
                    </div>

                    {isActive && !reduceMotion && (
                      <motion.div
                        layoutId="activeBar"
                        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-white/50"
                        transition={{ duration: T.bar, ease: EASE_OUT }}
                      />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </LayoutGroup>
      </div>
    </section>
  );
}
