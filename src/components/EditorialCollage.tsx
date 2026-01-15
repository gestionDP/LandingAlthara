'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useStagger } from '@/hooks/useStagger';
import { motion, AnimatePresence } from 'framer-motion';

type Tile = {
  src: string;
  alt: string;
  phrase: string;
  tag?: string;
};

export default function EditorialCollage() {
  const t = useTranslations('editorialCollage');

  const tiles: Tile[] = [
    {
      src: '/jpg/2.jpg',
      alt: t('tiles.0.alt'),
      phrase: t('tiles.0.phrase'),
      tag: t('tiles.0.tag'),
    },
    {
      src: '/jpg/3.jpg',
      alt: t('tiles.1.alt'),
      phrase: t('tiles.1.phrase'),
      tag: t('tiles.1.tag'),
    },
    {
      src: '/jpg/4.jpg',
      alt: t('tiles.2.alt'),
      phrase: t('tiles.2.phrase'),
      tag: t('tiles.2.tag'),
    },
    {
      src: '/jpg/5.jpg',
      alt: t('tiles.3.alt'),
      phrase: t('tiles.3.phrase'),
      tag: t('tiles.3.tag'),
    },
    {
      src: '/jpg/6.jpg',
      alt: t('tiles.4.alt'),
      phrase: t('tiles.4.phrase'),
      tag: t('tiles.4.tag'),
    },
    {
      src: '/jpg/7.jpg',
      alt: t('tiles.5.alt'),
      phrase: t('tiles.5.phrase'),
      tag: t('tiles.5.tag'),
    },
    {
      src: '/jpg/8.jpg',
      alt: t('tiles.6.alt'),
      phrase: t('tiles.6.phrase'),
      tag: t('tiles.6.tag'),
    },
    {
      src: '/jpg/9.jpg',
      alt: t('tiles.7.alt'),
      phrase: t('tiles.7.phrase'),
      tag: t('tiles.7.tag'),
    },
  ];

  const { ref, revealedItems, getItemProps } = useStagger({
    itemCount: tiles.length,
    staggerDelay: 'medium',
    duration: 0.65,
    distance: 10,
  });

  const [activeIndex, setActiveIndex] = React.useState<number>(0);

  // Autoplay control
  const [isPaused, setIsPaused] = React.useState(false);
  const resumeTimeoutRef = React.useRef<number | null>(null);

  // Respeta reduced motion
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    );
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
      setActiveIndex((prev) => (prev + 1) % tiles.length);
    }, 2200);

    return () => window.clearInterval(id);
  }, [isPaused, tiles.length, prefersReducedMotion]);

  React.useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current)
        window.clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  const enter = (idx: number) => {
    setActiveIndex(idx);
  };

  // IMPORTANTE: los spans grandes solo en desktop para no “romper” el reparto de filas en mobile/tablet
  const getSpan = (index: number) => {
    if (index === 0) return 'lg:col-span-2 lg:row-span-2';
    if (index === 3) return 'lg:col-span-2';
    return '';
  };

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="bg-[#0a0a0a] h-screen w-full overflow-hidden"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto w-full h-full">
        <div
          className={[
            'grid gap-0 h-full',
            // 8 tiles => 2x4 ocupa exactamente 100vh
            'grid-cols-2 grid-rows-4',
            // tablet: 3 columnas, 3 filas (queda 1 celda libre; es normal)
            'md:grid-cols-3 md:grid-rows-3',
            // desktop: 4x2 perfecto + spans grandes
            'lg:grid-cols-4 lg:grid-rows-2',
          ].join(' ')}
        >
          {tiles.map((tile, index) => {
            const isActive = index === activeIndex;

            return (
              <motion.div
                key={index}
                className={`relative group ${getSpan(index)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={
                  revealedItems[index]
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 10 }
                }
                transition={getItemProps(index).transition}
                onPointerDown={() => {
                  enter(index);
                  pauseTemporarily(3500);
                }}
                onFocus={() => {
                  enter(index);
                  pauseTemporarily(3500);
                }}
                tabIndex={0}
                role="button"
                aria-label={tile.alt}
              >
                <div className="relative h-full w-full overflow-hidden">
                  <Image
                    src={tile.src}
                    alt={tile.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={[
                      'object-cover will-change-transform transition-transform duration-500 ease-out',
                      'transition-[filter] duration-500 ease-out',
                      isActive
                        ? 'grayscale-0 saturate-110 scale-[1.08]'
                        : 'group-hover:grayscale-0 group-hover:saturate-110 group-hover:scale-[1.04]',
                    ].join(' ')}
                  />

                  <div
                    className={[
                      'absolute inset-0 transition-all duration-700',
                      isActive
                        ? 'bg-[#0a0a0a]/10'
                        : 'bg-[#0a0a0a]/35 group-hover:bg-[#0a0a0a]/12',
                    ].join(' ')}
                  />

                  <div className="pointer-events-none absolute inset-0 border border-[#e6e2d7]/10" />

                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        key={`cap-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="absolute left-0 right-0 bottom-0"
                      >
                        <div className="p-4 md:p-5 border-t border-[#e6e2d7]/12 bg-[#0f0f0f]/25 backdrop-blur-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[11px] tracking-[0.28em] text-[#e6e2d7]/55">
                              {tile.tag ?? 'ALTHARA'}
                            </span>
                            <span className="h-px w-10 bg-[#e6e2d7]/15" />
                            <span className="text-[11px] tracking-[0.28em] text-[#e6e2d7]/35">
                              /0{index + 1}
                            </span>
                          </div>

                          <div className="text-sm md:text-base text-[#e6e2d7]/85 font-light leading-snug">
                            {tile.phrase}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pointer-events-none absolute top-3 right-3">
                    <div
                      className={[
                        'h-2 w-2 rounded-full transition-all duration-500',
                        isActive ? 'bg-[#e6e2d7]/55' : 'bg-[#e6e2d7]/15',
                      ].join(' ')}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
