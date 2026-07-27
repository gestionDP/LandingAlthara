'use client';

/**
 * 04 · Proceso — ALT-WEB-2026-01 §04.D.
 *
 * Sustituye a «Método» y a «Qué hacemos» (que contaban lo mismo dos veces).
 * Se enuncia UNA sola vez, en cinco pasos. Sin botón —el único del site está
 * en la sección 09— y sin punto final decorativo en el titular.
 *
 * «Matching» pasa a llamarse «Asignación»: el anglicismo lee a producto
 * tecnológico, no a firma.
 */
import { useTranslations } from 'next-intl';
import { Reveal } from './motion';

const STEPS = [0, 1, 2, 3, 4] as const;

export default function Process() {
  const t = useTranslations('landing.process');

  return (
    <section id="proceso" className="scroll-mt-0 bg-[#1c3742] py-16 text-[#e6e2d7] md:py-28">
      <div className="container-site">
        <Reveal>
          <p className="label-mono text-[#c08552]">{t('label')}</p>
          <h2 className="display-xl mt-6 text-5xl md:text-8xl">{t('title')}</h2>
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
      </div>
    </section>
  );
}
