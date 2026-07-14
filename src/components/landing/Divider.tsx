'use client';

/** Separador editorial minimalista entre secciones, con imagen de fondo y overlay oscuro. */
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { MaskReveal, Reveal } from './motion';

export default function Divider() {
  const t = useTranslations('landing.divider');

  return (
    <section className="relative min-h-[60vh] flex items-center py-24 md:py-32">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/png/banner2.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
          priority
        />
        <div className="absolute inset-0 bg-[#102027]/45" />
      </div>
      <div className="container-site relative z-10 text-center">
        <MaskReveal>
          <p className="display-xl text-5xl text-[#e6e2d7] md:text-7xl lg:text-8xl">
            {t('line1')}
          </p>
        </MaskReveal>
        <Reveal delay={0.15}>
          <p className="mt-6 text-lg text-[#e6e2d7]/50 md:text-2xl">
            {t('line2')}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
