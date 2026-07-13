'use client';

/**
 * Las capas de Althara: palabras gigantes apiladas; la activa se enciende
 * y despliega su detalle (scroll en desktop activa cada una; hover también).
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Reveal, EASE } from './motion';

const ITEMS = [0, 1, 2, 3] as const;

export default function Layers() {
  const t = useTranslations('landing.layers');
  const [active, setActive] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <section id="capas" className="container-site scroll-mt-24 py-24 md:py-36">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <h2 className="display-xl text-5xl text-[#1c3742] md:text-6xl">
          {t('title')}
          <span className="text-[#c08552]">.</span>
        </h2>
        <Reveal delay={0.1}>
          <p className="max-w-md text-base leading-relaxed text-[#1c3742]/70 md:text-right md:text-lg">
            {t('intro')}
          </p>
        </Reveal>
      </div>

      <div className="mt-14 md:mt-20">
        {ITEMS.map((i) => {
          const isActive = !isDesktop || active === i;
          return (
            <motion.div
              key={i}
              onViewportEnter={isDesktop ? () => setActive(i) : undefined}
              viewport={{ margin: '-45% 0px -45% 0px' }}
              onMouseEnter={isDesktop ? () => setActive(i) : undefined}
              className="border-t border-[#1c3742]/10 py-8 first:border-t-0 md:border-t-0"
            >
              <h3
                className={`display-xl break-words text-4xl leading-tight transition-colors duration-[1100ms] ease-out md:text-7xl lg:text-8xl ${
                  isActive ? 'text-[#1c3742]' : 'text-[#1c3742]/15'
                }`}
              >
                {t(`items.${i}.title`)}
              </h3>

              {/* Móvil: detalle siempre visible */}
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#1c3742]/60 md:hidden">
                {t(`items.${i}.text`)}
              </p>

              {/* Desktop: despliegue */}
              <div className="hidden md:block">
                <AnimatePresence initial={false}>
                  {active === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.9, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-6 pb-6 pt-4 md:grid-cols-12">
                        <p className="label-mono pt-2 text-[#c08552] md:col-span-2">
                          {String(i + 1).padStart(2, '0')}
                        </p>
                        <p className="max-w-3xl text-xl leading-relaxed text-[#1c3742]/70 md:col-span-10">
                          {t(`items.${i}.text`)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
