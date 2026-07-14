'use client';

/**
 * Entornos seleccionados: carrusel infinito de 6 tarjetas con autoplay.
 * Usa translateX para movimiento continuo, pausa al hover.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import ContactModal from '../ContactModal';
import { Reveal } from './motion';

const CARDS = [
  { i: 0, img: '/jpg/29.jpeg' },
  { i: 1, img: '/jpg/30.jpeg' },
  { i: 2, img: '/jpg/31.jpeg' },
  { i: 3, img: '/jpg/32.jpeg' },
  { i: 4, img: '/jpg/33.jpeg' },
  { i: 5, img: '/jpg/27.jpeg' },
] as const;

export default function Segments() {
  const t = useTranslations('landing.segments');
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [modalType, setModalType] = useState<string | null>(null);

  const innerRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const offset = useRef(0);
  const speed = 0.5; // px per frame

  useEffect(() => {
    if (reduce) return;
    const inner = innerRef.current;
    if (!inner) return;

    let raf: number;
    // Width of one full set of cards (half the total rendered content)
    const getHalf = () => inner.scrollWidth / 2;

    const step = () => {
      if (!isPaused.current) {
        offset.current += speed;
        const half = getHalf();
        if (offset.current >= half) {
          offset.current -= half;
        }
        inner.style.transform = `translateX(-${offset.current}px)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  const pause = useCallback(() => { isPaused.current = true; }, []);
  const resume = useCallback(() => { isPaused.current = false; }, []);

  // Duplicate cards for seamless loop
  const allCards = [...CARDS, ...CARDS];

  return (
    <>
      <section id="segmentos" className="scroll-mt-24 py-24 md:py-36">
        <div className="container-site">
          <Reveal>
            <p className="label-mono text-[#c08552]">{t('label')}</p>
          </Reveal>
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="display-xl text-4xl text-[#1c3742] md:text-6xl">
              {t('title')}
              <span className="text-[#c08552]">.</span>
            </h2>
            <Reveal delay={0.1}>
              <p className="max-w-md text-base leading-relaxed text-[#1c3742]/70 md:text-right">
                {t('intro')}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Carrusel horizontal infinito */}
        <div
          className="mt-12 overflow-hidden"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
        >
          <div ref={innerRef} className="flex gap-3 will-change-transform">
            {allCards.map((c, idx) => {
              const isActive = active === idx;
              return (
                <button
                  key={`${c.i}-${idx}`}
                  type="button"
                  onClick={() => setModalType(t(`items.${c.i}`))}
                  onMouseEnter={() => setActive(idx)}
                  onMouseLeave={() => setActive(null)}
                  className="group relative aspect-[3/5] w-[280px] shrink-0 overflow-hidden text-left md:w-[340px]"
                  aria-label={t(`items.${c.i}`)}
                >
                  <Image
                    src={c.img}
                    alt=""
                    fill
                    sizes="280px"
                    className={`object-cover transition-all duration-700 ease-out group-hover:scale-[1.05] ${
                      isActive ? 'grayscale-0' : 'grayscale'
                    }`}
                  />
                  <div className={`absolute inset-0 transition-colors duration-500 ${isActive ? 'bg-[#102027]/10' : 'bg-[#102027]/35'}`} />
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <p className={`text-base font-medium leading-snug transition-colors duration-300 md:text-lg ${isActive ? 'text-white' : 'text-[#e6e2d7]/85'}`}>
                      {t(`items.${c.i}`)}
                    </p>
                    <p className={`mt-1 text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${isActive ? 'text-[#c08552]' : 'text-[#e6e2d7]/70'}`}>
                      {t('cta')} →
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <ContactModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        initialType={modalType ?? undefined}
      />
    </>
  );
}
