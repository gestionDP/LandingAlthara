'use client';

/**
 * 05 · Cartera — ALT-WEB-2026-01 §04.E.
 *
 * ⚠️ SECCIÓN NO MONTADA TODAVÍA. No está importada en `src/app/page.tsx`.
 *
 * Faltan por identificar las filas C-01, C-02 y D-02 (PENDIENTE CATALINA,
 * §09 del documento). Para publicarla:
 *   1. completar `portfolio.operations` en `src/content/figures.json`,
 *   2. poner `portfolio.published: true`,
 *   3. añadir `<Portfolio />` entre <Process /> e <Infrastructure /> en page.tsx.
 *
 * Coherencia obligatoria antes de publicar: las dos operaciones cerradas deben
 * pertenecer al universo de retorno del documento de verificación.
 *
 * Regla de contenido: sin direcciones, sin importes y sin retornos — ese
 * detalle vive en el data room.
 */
import { useLocale, useTranslations } from 'next-intl';
import { PORTFOLIO, t as pick, type Locale } from '@/lib/figures';
import { Reveal } from './motion';

export default function Portfolio() {
  const t = useTranslations('landing.portfolio');
  const locale = useLocale() as Locale;

  // Puerta de publicación: nada a medias en abierto.
  if (!PORTFOLIO.published) return null;

  const cell = (value: string | null) =>
    value ?? <span className="text-[#1c3742]/30">{t('pending')}</span>;

  return (
    <section id="cartera" className="container-site scroll-mt-24 py-24 md:py-32">
      <Reveal>
        <p className="label-mono text-[#c08552]">{t('label')}</p>
      </Reveal>

      <div className="mt-6 grid gap-6 md:grid-cols-12">
        <h2 className="display-xl text-4xl text-[#1c3742] md:col-span-5 md:text-5xl">
          {t('title')}
        </h2>
        <Reveal delay={0.1} className="md:col-span-7">
          <p className="max-w-2xl text-base leading-relaxed text-[#1c3742]/70 md:text-lg">
            {t('intro')}
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.15}>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#1c3742]/25">
                {(['op', 'typology', 'region', 'year', 'status'] as const).map((c) => (
                  <th key={c} className="label-mono py-3 pr-4 font-medium text-[#1c3742]/60">
                    {t(`col.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PORTFOLIO.operations.map((op) => (
                <tr key={op.ref} className="border-b border-[#1c3742]/10">
                  <td className="py-4 pr-4 font-montserrat text-sm font-bold text-[#1c3742]">
                    {op.ref}
                  </td>
                  <td className="py-4 pr-4 text-sm text-[#1c3742]/75">
                    {cell(pick(op.typology, locale))}
                  </td>
                  <td className="py-4 pr-4 text-sm text-[#1c3742]/75">
                    {cell(pick(op.region, locale))}
                  </td>
                  <td className="py-4 pr-4 text-sm text-[#1c3742]/75">{cell(op.year)}</td>
                  <td className="py-4 pr-4 text-sm text-[#1c3742]/75">
                    {pick(op.status, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </section>
  );
}
