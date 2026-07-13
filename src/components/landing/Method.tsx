'use client';

/**
 * Método: banda oscura con filas sticky que se solapan al hacer scroll,
 * números gigantes en bronce.
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ContactModal from '../ContactModal';
import { Reveal } from './motion';

const STEPS = [0, 1, 2, 3, 4] as const;

export default function Method() {
  const t = useTranslations('landing.method');
  const [modal, setModal] = useState(false);

  return (
    <>
      <section id="metodo" className="scroll-mt-0 bg-[#1c3742] py-16 text-[#e6e2d7] md:py-28">
        <div className="container-site">
          <Reveal>
            <h2 className="display-xl text-5xl md:text-8xl">
              {t('title')}
              <span className="text-[#c08552]">.</span>
            </h2>
            <p className="mt-6 max-w-md text-base text-[#e6e2d7]/70 md:text-lg">{t('intro')}</p>
          </Reveal>

          <div className="mt-14">
            {STEPS.map((i) => (
              <div
                key={i}
                className="sticky top-16 grid gap-4 border-t border-[#e6e2d7]/12 bg-[#1c3742] py-10 md:min-h-[42vh] md:grid-cols-12 md:gap-6 md:py-16"
              >
                <span className="display-xl text-7xl leading-none text-[#c08552] md:col-span-3 md:text-[7.5rem] lg:text-[8.5rem]">
                  {i + 1}
                </span>
                <h3 className="pt-2 font-montserrat text-xl font-extrabold md:col-span-3 md:text-2xl">
                  {t(`steps.${i}.title`)}
                </h3>
                <p className="max-w-md pt-2 text-base leading-relaxed text-[#e6e2d7]/75 md:col-span-6 md:text-lg">
                  {t(`steps.${i}.text`)}
                </p>
              </div>
            ))}
          </div>

          <Reveal className="mt-14 flex justify-center md:mt-16">
            <button
              onClick={() => setModal(true)}
              className="label-mono bg-[#e6e2d7] px-8 py-4 text-[#102027] transition-colors duration-300 hover:bg-[#c08552] hover:text-[#e6e2d7]"
            >
              {t('cta')}
            </button>
          </Reveal>
        </div>
      </section>

      <ContactModal isOpen={modal} onClose={() => setModal(false)} />
    </>
  );
}
