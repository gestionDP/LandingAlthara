'use client';

/** Separador editorial minimalista entre secciones. */
import { useTranslations } from 'next-intl';
import { MaskReveal, Reveal } from './motion';

export default function Divider() {
  const t = useTranslations('landing.divider');

  return (
    <section className="bg-[#102027] py-24 md:py-32">
      <div className="container-site text-center">
        <MaskReveal>
          <p className="display-xl text-3xl text-[#e6e2d7] md:text-5xl lg:text-6xl">
            {t('line1')}
          </p>
        </MaskReveal>
        <Reveal delay={0.15}>
          <p className="mt-4 text-base text-[#e6e2d7]/50 md:text-lg">
            {t('line2')}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
