'use client';

/**
 * 02 · Posición — ALT-WEB-2026-01 §04.B y §05.
 *
 * Dos cifras públicas, centradas. Track record / verificación viven en §08.
 */
import { useLocale, useTranslations } from 'next-intl';
import { FIGURES, t as pick, type Locale } from '@/lib/figures';
import { Reveal } from './motion';

export default function Position() {
  const t = useTranslations('landing.position');
  const locale = useLocale() as Locale;

  return (
    <section id="posicion" className="landing-band scroll-mt-24">
      <div className="container-site py-24 md:py-32">
      <Reveal>
        <p className="label-mono text-center text-[#c08552]">{t('label')}</p>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-5xl gap-16 md:mt-16 md:grid-cols-2 md:gap-20">
        {FIGURES.map((f, i) => (
          <Reveal key={f.id} delay={0.08 * i}>
            <div className="text-center">
              <p className="display-xl text-6xl text-[#1c3742] md:text-7xl lg:text-8xl">
                {pick(f.value, locale)}
              </p>
              <p className="label-mono mt-4 text-[#1c3742]/60">{pick(f.label, locale)}</p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#1c3742]/55">
                {pick(f.scope, locale)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      </div>
    </section>
  );
}
