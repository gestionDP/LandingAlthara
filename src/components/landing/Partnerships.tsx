'use client';

/**
 * 07 · Colaboración — ALT-WEB-2026-01 §04.G.
 * Split asimétrico: título a la izquierda, tipos + cuerpo a la derecha.
 */
import { useTranslations } from 'next-intl';
import { MaskReveal, Reveal } from './motion';

const TYPE_KEYS = [0, 1, 2] as const;

export default function Partnerships() {
  const t = useTranslations('landing.partnerships');

  return (
    <section id="colaboracion" className="landing-surface scroll-mt-24">
      <div className="container-site py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10 md:items-start">
          <div className="md:col-span-7">
            <Reveal>
              <p className="label-mono text-[#c08552]">{t('label')}</p>
            </Reveal>
            <h2 className="display-xl mt-8 text-3xl text-[#1c3742] md:text-5xl lg:text-6xl">
              <MaskReveal>
                <span className="block">{t('title')}</span>
              </MaskReveal>
            </h2>
          </div>

          <div className="flex flex-col gap-8 md:col-span-5 md:pt-10">
            <Reveal delay={0.08}>
              <ul className="space-y-3">
                {TYPE_KEYS.map((i) => (
                  <li key={i} className="label-mono text-[#1c3742]/55">
                    {t(`types.${i}.title`)}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="text-base leading-relaxed text-[#1c3742]/75 md:text-lg">
                {t('p1')}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-base font-medium leading-relaxed text-[#c08552] md:text-lg">
                {t('p2')}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
