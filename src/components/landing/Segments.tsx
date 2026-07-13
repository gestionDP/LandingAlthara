'use client';

/**
 * Entornos seleccionados: 6 tarjetas de segmento (como la sección original).
 * En B/N; la activa (hover/scroll) recupera el color. Al hacer clic se abre
 * el formulario de solicitud con ese tipo de inversión ya preseleccionado.
 */
import { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import ContactModal from '../ContactModal';
import { Reveal, EASE } from './motion';

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

        {/* Tira de tarjetas a sangre completa */}
        <div className="mt-12 grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-6">
          {CARDS.map((c, idx) => {
            const isActive = active === idx;
            return (
              <motion.button
                key={c.i}
                type="button"
                onClick={() => setModalType(t(`items.${c.i}`))}
                onMouseEnter={() => setActive(idx)}
                onMouseLeave={() => setActive(null)}
                initial={reduce ? {} : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.06 * idx, ease: EASE }}
                className="group relative aspect-[3/4] overflow-hidden text-left"
                aria-label={t(`items.${c.i}`)}
              >
                <Image
                  src={c.img}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 17vw, (min-width: 768px) 33vw, 50vw"
                  className={`object-cover transition-all duration-700 ease-out group-hover:scale-[1.05] ${
                    isActive ? 'grayscale-0' : 'grayscale'
                  }`}
                />
                <div className={`absolute inset-0 transition-colors duration-500 ${isActive ? 'bg-[#102027]/10' : 'bg-[#102027]/35'}`} />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                  <p className={`text-base font-medium leading-snug transition-colors duration-300 md:text-lg ${isActive ? 'text-white' : 'text-[#e6e2d7]/85'}`}>
                    {t(`items.${c.i}`)}
                  </p>
                  <p className={`mt-1 text-[11px] uppercase tracking-[0.18em] transition-opacity duration-300 ${isActive ? 'text-[#c08552] opacity-100' : 'opacity-0'}`}>
                    {t('cta')} →
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="container-site">
          <Reveal delay={0.15}>
            <p className="mt-6 text-xs text-[#1c3742]/45">{t('footnote')}</p>
          </Reveal>
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
