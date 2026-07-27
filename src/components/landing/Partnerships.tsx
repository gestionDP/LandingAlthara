'use client';

/**
 * 07 · Colaboración — ALT-WEB-2026-01 §04.G. Sección nueva.
 *
 * Marca blanca y originadores. Es la única sección donde la voz admite
 * primera persona del plural; el resto del site es institucional impersonal.
 */
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { MaskReveal, Reveal } from './motion';

export default function Partnerships() {
  const t = useTranslations('landing.partnerships');

  return (
    <section id="colaboracion" className="relative scroll-mt-24 overflow-hidden bg-[#102027]">
      <Image
        src="/png/banner2.png"
        alt=""
        fill
        aria-hidden
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#102027]/80" />

      <div className="container-site relative z-10 py-24 md:py-32">
        <Reveal>
          <p className="label-mono text-[#c08552]">{t('label')}</p>
        </Reveal>

        <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-8">
          <h2 className="display-xl text-3xl text-[#e6e2d7] md:col-span-7 md:text-5xl lg:text-6xl">
            <MaskReveal><span className="block">{t('title')}</span></MaskReveal>
          </h2>

          <div className="flex flex-col gap-6 md:col-span-5 md:pt-2">
            <Reveal delay={0.12}>
              <p className="text-base leading-relaxed text-[#e6e2d7]/75 md:text-lg">{t('p1')}</p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="border-t border-[#e6e2d7]/15 pt-6 text-base leading-relaxed text-[#e6e2d7]/55">
                {t('p2')}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
