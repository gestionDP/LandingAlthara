'use client';

/**
 * 08 · Análisis + Verificación + Gobernanza — ALT-WEB-2026-01 §04.H.
 * Cabecera en dos columnas; paneles a la izquierda e imagen a la derecha.
 */
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AS_OF, VERIFICATION_HREF, t as pick, type Locale } from '@/lib/figures';
import { MaskReveal, Reveal } from './motion';

export default function Research() {
  const t = useTranslations('landing.research');
  const tPos = useTranslations('landing.position');
  const locale = useLocale() as Locale;
  const governance = t('governanceText1');

  return (
    <section id="analisis" className="landing-band scroll-mt-24">
      <div className="container-site py-24 md:py-32">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10 md:items-end">
          <div className="md:col-span-6">
            <Reveal>
              <p className="label-mono text-[#c08552]">{t('label')}</p>
            </Reveal>
            <h2 className="display-xl mt-8 text-4xl text-[#1c3742] md:text-6xl lg:text-7xl">
              <MaskReveal>
                <span className="block">{t('researchTitle')}</span>
              </MaskReveal>
            </h2>
          </div>
          <Reveal delay={0.1} className="md:col-span-6">
            <p className="text-base leading-relaxed text-[#1c3742]/75 md:text-lg">
              {t('researchText')}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:mt-20 md:grid-cols-12 md:gap-8">
          <div className="flex flex-col gap-5 md:col-span-6">
            <Reveal delay={0.08}>
              <div className="bg-[#102027] px-7 py-8 md:px-9 md:py-10">
                <p className="label-mono text-[#c08552]">{t('verificationTitle')}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#e6e2d7]/80 md:text-base">
                  {t('verificationText')}
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-8">
                  <a
                    href={VERIFICATION_HREF}
                    className="label-mono link-underline w-fit text-[#c08552] hover:text-[#e6e2d7]"
                  >
                    {tPos('verificationLink')} →
                  </a>
                  <Link
                    href="/metodologia"
                    className="label-mono link-underline w-fit text-[#c08552] hover:text-[#e6e2d7]"
                  >
                    {tPos('methodologyLink')} →
                  </Link>
                </div>
                <p className="mt-5 text-xs text-[#e6e2d7]/40">
                  {pick(AS_OF, locale)} · {tPos('verificationMeta')}
                </p>
              </div>
            </Reveal>

            {governance ? (
              <Reveal delay={0.14}>
                <div className="bg-[#1c3742]/[0.04] px-7 py-8 md:px-9 md:py-10">
                  <p className="label-mono text-[#1c3742]/50">{t('governanceTitle')}</p>
                  <p className="mt-4 text-sm leading-relaxed text-[#1c3742]/75 md:text-base">
                    {governance}
                  </p>
                </div>
              </Reveal>
            ) : null}
          </div>

          <Reveal delay={0.12} className="relative min-h-[280px] h-full overflow-hidden md:col-span-6">
            <Image
              src="/png/banner2.png"
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#102027]/20" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
