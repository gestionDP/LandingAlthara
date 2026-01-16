'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useStagger } from '@/hooks/useStagger';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from 'framer-motion';

type Tile = {
  src: string;
  alt: string;
  phrase: string;
  tag?: string;
};

type TileCardProps = {
  tile: Tile;
  index: number;
  isActive: boolean;
  prefersReducedMotion: boolean;
  revealed: boolean;
  transition: any;
  spanClass: string;
  onEnter: (idx: number) => void;
  onPauseTemporarily: (ms: number) => void;
};

const TileCard = React.memo(function TileCard({
  tile,
  index,
  isActive,
  prefersReducedMotion,
  revealed,
  transition,
  spanClass,
  onEnter,
  onPauseTemporarily,
}: TileCardProps) {
  return (
    <motion.div
      className={`relative group ${spanClass}`}
      initial={{ opacity: 0, y: 10 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={transition}
      onPointerDown={() => {
        onEnter(index);
        onPauseTemporarily(3500);
      }}
      onFocus={() => {
        onEnter(index);
        onPauseTemporarily(3500);
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
            'object-cover will-change-transform',
            'transition-[transform,filter] duration-500 ease-out',
            isActive
              ? 'scale-[1.08] filter-none'
              : 'grayscale contrast-[1.05] brightness-[0.9] group-hover:brightness-[0.98]',
            isActive ? '' : 'group-hover:grayscale-0',
            isActive ? '' : 'group-hover:scale-[1.04]',
          ].join(' ')}
        />
        <div
          className={[
            'absolute inset-0 transition-opacity duration-500',
            isActive ? 'opacity-0' : 'opacity-100 group-hover:opacity-60',
          ].join(' ')}
          style={{
            background:
              'linear-gradient(180deg, rgba(10,10,10,0.10), rgba(10,10,10,0.58))',
          }}
        />

        <div
          className={[
            'absolute inset-0 transition-opacity duration-700',
            isActive ? 'opacity-100' : 'opacity-100 group-hover:opacity-100',
          ].join(' ')}
          style={{
            background: isActive
              ? 'rgba(10,10,10,0.12)'
              : 'rgba(10,10,10,0.20)',
          }}
        />

        <div className="pointer-events-none absolute inset-0 border border-[#e6e2d7]/10" />

        <AnimatePresence mode="wait">
          {isActive && !prefersReducedMotion && (
            <motion.div
              key={`spot-${index}`}
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ x: '-22%', y: '18%', scale: 1.1, opacity: 0.0 }}
                animate={{ x: '22%', y: '-18%', scale: 1.22, opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background:
                    'radial-gradient(600px 420px at 30% 60%, rgba(230,226,215,0.16), rgba(10,10,10,0) 55%)',
                  mixBlendMode: 'screen',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isActive && (
            <motion.div
              key="caption"
              layoutId="caption"
              className="absolute left-0 right-0 bottom-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="p-4 md:p-5 border-t border-[#e6e2d7]/12 bg-[#0f0f0f]/25 md:bg-[#0f0f0f]/22 backdrop-blur-md md:backdrop-blur-xl">
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
});

export default function EditorialCollage() {
  const t = useTranslations('editorialCollage');
  const prefersReducedMotion = useReducedMotion();

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

  const [isPaused, setIsPaused] = React.useState(false);
  const resumeTimeoutRef = React.useRef<number | null>(null);

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

  const enter = React.useCallback((idx: number) => {
    setActiveIndex(idx);
  }, []);

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
        <LayoutGroup>
          <div
            className={[
              'grid gap-0 h-full',
              'grid-cols-2 grid-rows-4',
              'md:grid-cols-3 md:grid-rows-3',
              'lg:grid-cols-4 lg:grid-rows-2',
            ].join(' ')}
          >
            {tiles.map((tile, index) => {
              const isActive = index === activeIndex;
              const { transition } = getItemProps(index);

              return (
                <TileCard
                  key={index}
                  tile={tile}
                  index={index}
                  isActive={isActive}
                  prefersReducedMotion={!!prefersReducedMotion}
                  revealed={!!revealedItems[index]}
                  transition={transition}
                  spanClass={getSpan(index)}
                  onEnter={enter}
                  onPauseTemporarily={pauseTemporarily}
                />
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
}
