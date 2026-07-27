'use client';

/**
 * /metodologia — página pública versionada. ALT-WEB-2026-01 v1.2 §05.
 *
 * Cubre ÚNICAMENTE las cifras de la capa pública. Ninguna cifra de
 * rentabilidad puede aparecer aquí: la metodología del retorno reside en el
 * documento de verificación (Capa 1).
 *
 * Regla de coherencia: la definición de cada afirmación pública es tan
 * accesible como la afirmación misma.
 */
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  AS_OF,
  FIGURES,
  METHODOLOGY_VERSION,
  PERIMETER,
  VERIFICATION_HREF_ABS,
  t as pick,
  type Locale,
} from '@/lib/figures';

export default function MethodologyContent() {
  const t = useTranslations('landing.methodology');
  const tPos = useTranslations('landing.position');
  const locale = useLocale() as Locale;
  const date = pick(AS_OF, locale) ?? '';

  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#1c3742]">
      <div className="container-site max-w-3xl py-16 md:py-24">
        <Link
          href="/"
          className="label-mono link-underline text-[#1c3742]/50 hover:text-[#1c3742]"
        >
          {t('back')}
        </Link>

        <h1 className="display-xl mt-8 text-4xl md:text-5xl">{t('title')}</h1>
        <p className="label-mono mt-4 text-[#c08552]">
          {t('header', { version: METHODOLOGY_VERSION, date })}
        </p>
        <p className="mt-8 text-base leading-relaxed text-[#1c3742]/75 md:text-lg">{t('intro')}</p>

        <section className="mt-14">
          <h2 className="label-mono border-b border-[#1c3742]/20 pb-3 text-[#1c3742]/60">
            {t('s1title')}
          </h2>
          <dl className="mt-6 space-y-8">
            {FIGURES.map((f) => (
              <div key={f.id}>
                <dt className="font-montserrat text-2xl font-semibold">
                  {pick(f.value, locale)}{' '}
                  <span className="text-base font-normal text-[#1c3742]/60">
                    — {pick(f.label, locale)}
                  </span>
                </dt>
                <dd className="mt-2 text-base leading-relaxed text-[#1c3742]/75">
                  {pick(f.scope, locale)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-14">
          <h2 className="label-mono border-b border-[#1c3742]/20 pb-3 text-[#1c3742]/60">
            {t('s2title')}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[#1c3742]/75">
            {t('s2intro', { operations: PERIMETER.operations, units: PERIMETER.units })}
          </p>
          <table className="mt-6 w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#1c3742]/25">
                <th className="label-mono py-3 pr-4 font-medium text-[#1c3742]/60">
                  {t('s2col.place')}
                </th>
                <th className="label-mono py-3 pr-4 font-medium text-[#1c3742]/60">
                  {t('s2col.operations')}
                </th>
                <th className="label-mono py-3 font-medium text-[#1c3742]/60">
                  {t('s2col.units')}
                </th>
              </tr>
            </thead>
            <tbody>
              {PERIMETER.composition.map((c) => (
                <tr key={c.place.es} className="border-b border-[#1c3742]/10">
                  <td className="py-3 pr-4 text-[#1c3742]">{pick(c.place, locale)}</td>
                  <td className="py-3 pr-4 text-[#1c3742]/75">{c.operations}</td>
                  <td className="py-3 text-[#1c3742]/75">{c.units}</td>
                </tr>
              ))}
              <tr className="border-b-2 border-[#1c3742]/40 font-semibold">
                <td className="py-3 pr-4">{t('s2total')}</td>
                <td className="py-3 pr-4">{PERIMETER.operations}</td>
                <td className="py-3">{PERIMETER.units}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-sm leading-relaxed text-[#1c3742]/55">
            {t('s2note', { operations: PERIMETER.operations })}
          </p>
        </section>

        {/* PENDIENTE VALIDACIÓN (Catalina / Miguel Ángel): el criterio de
            valoración no venía literal en ALT-WEB-2026-01. Confirmar antes de
            publicar. */}
        <section className="mt-14">
          <h2 className="label-mono border-b border-[#1c3742]/20 pb-3 text-[#1c3742]/60">
            {t('s3title')}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[#1c3742]/75">{t('s3text')}</p>
        </section>

        <section className="mt-14">
          <h2 className="label-mono border-b border-[#1c3742]/20 pb-3 text-[#1c3742]/60">
            {t('s4title')}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[#1c3742]/75">{t('s4text')}</p>
          <a
            href={VERIFICATION_HREF_ABS}
            className="label-mono link-underline mt-5 inline-block text-[#c08552] hover:text-[#1c3742]"
          >
            {t('verificationCta')} →
          </a>
        </section>

        <section className="mt-14">
          <h2 className="label-mono border-b border-[#1c3742]/20 pb-3 text-[#1c3742]/60">
            {t('s5title')}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[#1c3742]/75">{t('s5text')}</p>
          <p className="mt-6 text-sm text-[#1c3742]/45">
            {tPos('verificationLink')}: {date}, {tPos('verificationMeta')}.
          </p>
        </section>
      </div>
    </main>
  );
}
