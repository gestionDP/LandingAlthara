'use client';

/**
 * 02 · Posición — ALT-WEB-2026-01 §04.B y §05.
 *
 * Las cifras públicas, fechadas y con NOTA DE ALCANCE VISIBLE POR DEFECTO
 * (no tooltip, no acordeón: la nota forma parte del diseño). Los valores se
 * leen de `src/content/figures.json`, nunca están incrustados aquí.
 *
 * Regla de coherencia: ninguna cifra de rentabilidad en la capa pública. El
 * retorno reside en el documento de verificación (Capa 1).
 */
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AS_OF, FIGURES, VERIFICATION_HREF, t as pick, type Locale } from '@/lib/figures';
import { Reveal } from './motion';

export default function Position() {
  const t = useTranslations('landing.position');
  const locale = useLocale() as Locale;

  return (
    <section id="posicion" className="container-site scroll-mt-24 py-24 md:py-32">
      <Reveal>
        <p className="label-mono text-[#c08552]">{t('label')}</p>
      </Reveal>

      <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
        {FIGURES.map((f, i) => (
          <Reveal key={f.id} delay={0.08 * i}>
            <div className="border-t border-[#1c3742]/15 pt-6">
              <p className="display-xl text-6xl text-[#1c3742] md:text-7xl lg:text-8xl">
                {pick(f.value, locale)}
              </p>
              <p className="label-mono mt-4 text-[#1c3742]/60">{pick(f.label, locale)}</p>
              {/* Nota de alcance: visible por defecto, cuerpo pequeño bajo el valor */}
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#1c3742]/55">
                {pick(f.scope, locale)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.16}>
        <div className="mt-16 border-t border-[#1c3742]/15 pt-6 md:mt-20">
          <p className="max-w-2xl text-base leading-relaxed text-[#1c3742]/70 md:text-lg">
            <span className="font-semibold text-[#1c3742]">{t('trackRecordTitle')}</span>{' '}
            {t('trackRecordText')}
          </p>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:gap-10">
            <Link
              href="/metodologia"
              className="label-mono link-underline w-fit text-[#c08552] hover:text-[#1c3742]"
            >
              {t('methodologyLink')} →
            </Link>
            <a
              href={VERIFICATION_HREF}
              className="label-mono link-underline w-fit text-[#c08552] hover:text-[#1c3742]"
            >
              {t('verificationLink')} →
            </a>
          </div>
          <p className="mt-4 text-xs text-[#1c3742]/45">
            {pick(AS_OF, locale)} · {t('verificationMeta')}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
