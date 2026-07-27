'use client';

/**
 * 08 · Análisis + Gobernanza — ALT-WEB-2026-01 §04.H.
 *
 * Tres bloques: producción analítica propia, verificación de las cifras y
 * gobernanza. La entidad jurídica NO aparece aquí: solo en aviso legal,
 * documento de verificación y capas de acceso.
 */
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AS_OF, VERIFICATION_HREF, t as pick, type Locale } from '@/lib/figures';
import { Reveal } from './motion';

export default function Research() {
  const t = useTranslations('landing.research');
  const tPos = useTranslations('landing.position');
  const locale = useLocale() as Locale;

  return (
    <section id="analisis" className="container-site scroll-mt-24 py-24 md:py-32">
      <Reveal>
        <p className="label-mono text-[#c08552]">{t('label')}</p>
      </Reveal>

      <div className="mt-12 grid gap-12 md:grid-cols-3 md:gap-10">
        <Reveal>
          <div className="border-t border-[#1c3742]/20 pt-6">
            <h3 className="label-mono text-[#1c3742]/60">{t('researchTitle')}</h3>
            <p className="mt-4 text-base leading-relaxed text-[#1c3742]/75">{t('researchText')}</p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="border-t border-[#1c3742]/20 pt-6">
            <h3 className="label-mono text-[#1c3742]/60">{t('verificationTitle')}</h3>
            <p className="mt-4 text-base leading-relaxed text-[#1c3742]/75">
              {t('verificationText')}
            </p>
            <a
              href={VERIFICATION_HREF}
              className="label-mono link-underline mt-5 inline-block text-[#c08552] hover:text-[#1c3742]"
            >
              {tPos('verificationLink')} →
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="border-t border-[#1c3742]/20 pt-6">
            <h3 className="label-mono text-[#1c3742]/60">{t('governanceTitle')}</h3>
            <p className="mt-4 text-base leading-relaxed text-[#1c3742]/75">
              {t('governanceText1')}
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#1c3742]/75">
              {t('governanceText2')}
            </p>
            <p className="mt-4 text-xs leading-relaxed text-[#1c3742]/45">
              {tPos('verificationLink')}: {pick(AS_OF, locale)}, {tPos('verificationMeta')}.
            </p>
            <Link
              href="/metodologia"
              className="label-mono link-underline mt-5 inline-block text-[#c08552] hover:text-[#1c3742]"
            >
              {tPos('methodologyLink')} →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
