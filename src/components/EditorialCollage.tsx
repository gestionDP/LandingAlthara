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
    { src: '/jpg/2.jpg', alt: 'Fragment 1', phrase: 'We read signals.', tag: 'SIGNAL' },
    { src: '/jpg/3.jpg', alt: 'Fragment 2', phrase: 'We design private routes.', tag: 'ROUTE' },
    { src: '/jpg/4.jpg', alt: 'Fragment 3', phrase: 'We protect the edge.', tag: 'EDGE' },
    { src: '/jpg/5.jpg', alt: 'Fragment 4', phrase: 'Privacy is architecture.', tag: 'SYSTEM' },
    { src: '/jpg/6.jpg', alt: 'Fragment 5', phrase: 'We work upstream.', tag: 'METHOD' },
    { src: '/jpg/7.jpg', alt: 'Fragment 6', phrase: 'Timing beats narrative.', tag: 'TIMING' },
    { src: '/jpg/8.jpg', alt: 'Fragment 7', phrase: 'Noise is filtered. Patterns stay.', tag: 'FILTER' },
    { src: '/jpg/9.jpg', alt: 'Fragment 8', phrase: 'Advantage is built quietly.', tag: 'ADVANTAGE' },
  ];

  const { ref, revealedItems, getItemProps } = useStagger({
    itemCount: tiles.length,
    staggerDelay: 'medium',
    duration: 0.65,
    distance: 10,
  });

  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const [isInteracting, setIsInteracting] = React.useState(false);

  React.useEffect(() => {
    if (!revealedItems.some(Boolean)) return;
    if (isInteracting) return;

    const id = window.setInterval(() => {
      setActiveIndex((p) => (p + 1) % tiles.length);
    }, 2400);

    return () => window.clearInterval(id);
  }, [isInteracting, revealedItems, tiles.length]);

  const enter = (idx: number) => {
    setIsInteracting(true);
    setActiveIndex(idx);
  };

  const leave = () => {
    window.setTimeout(() => setIsInteracting(false), 900);
  };

  const getSpan = (index: number) => {
    if (index === 0) return 'col-span-2 row-span-2 md:col-span-2 md:row-span-2';
    if (index === 3) return 'col-span-2 md:col-span-2';
    return '';
  };

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="bg-[#0a0a0a]">
      <div className="mx-auto w-full">
        <div
          className={[
            'grid gap-0',
            'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
            'auto-rows-[160px] sm:auto-rows-[190px] md:auto-rows-[240px] lg:auto-rows-[270px]',
          ].join(' ')}
        >
          {tiles.map((tile, index) => {
            const isActive = index === activeIndex;

            return (
              <motion.div
                key={index}
                className={`relative overflow-hidden group ${getSpan(index)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={revealedItems[index] ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={getItemProps(index).transition}
                onMouseEnter={() => enter(index)}
                onMouseLeave={leave}
                onFocus={() => enter(index)}
                onBlur={leave}
                onTouchStart={() => enter(index)}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={tile.src}
                    alt={tile.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={[
                      'object-cover transition-all duration-700',
                      'grayscale saturate-0 contrast-110',
                      isActive
                        ? 'grayscale-0 saturate-110 scale-[1.03]'
                        : 'group-hover:grayscale-0 group-hover:saturate-110 group-hover:scale-[1.02]',
                    ].join(' ')}
                  />

                  <div
                    className={[
                      'absolute inset-0 transition-all duration-700',
                      isActive ? 'bg-[#0a0a0a]/10' : 'bg-[#0a0a0a]/35 group-hover:bg-[#0a0a0a]/12',
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
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
