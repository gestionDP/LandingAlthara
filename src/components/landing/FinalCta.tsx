'use client';

/** Cierre: tipografía gigante con máscara + doble CTA + email en subrayado animado. Fondo con vídeo oscuro. */
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ContactModal from '../ContactModal';
import { MaskReveal, Reveal } from './motion';

export default function FinalCta() {
  const t = useTranslations('landing.finalCta');
  const [modal, setModal] = useState(false);

  return (
    <>
      <section id="acceso" className="relative scroll-mt-24 overflow-hidden">
        {/* Video de fondo */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src="/videos/6.mp4" type="video/mp4" />
        </video>
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-[#102027]/80" />

        <div className="container-site relative z-10 py-28 md:py-44">
          <p className="label-mono text-[#c08552]">{t('label')}</p>
          <h2 className="display-xl mt-8 text-[13vw] text-[#e6e2d7] md:text-[8rem] lg:text-[10rem] leading-[0.95]">
            <MaskReveal><span className="block">{t('line1')}</span></MaskReveal>
            <MaskReveal delay={0.14}>
              <span className="block md:text-right">
                {t('line2')}
                <span className="text-[#c08552]">.</span>
              </span>
            </MaskReveal>
          </h2>

          <div className="mt-14 grid gap-10 border-t border-[#e6e2d7]/15 pt-10 md:grid-cols-2 md:gap-16">
            <Reveal>
              <p className="max-w-md text-lg leading-relaxed text-[#e6e2d7]/70 md:text-xl">
                {t('sub')}
              </p>
            </Reveal>
            <Reveal delay={0.15} className="flex flex-col gap-6 md:items-end">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setModal(true)}
                  className="label-mono bg-[#e6e2d7] px-8 py-4 text-[#102027] transition-colors duration-300 hover:bg-[#c08552] hover:text-[#e6e2d7]"
                >
                  {t('cta1')}
                </button>
                <Link
                  href="/dataroom"
                  className="label-mono border border-[#e6e2d7]/70 px-8 py-4 text-[#e6e2d7] transition-colors duration-300 hover:bg-[#e6e2d7] hover:text-[#102027]"
                >
                  {t('cta2')}
                </Link>
              </div>
              <div className="flex flex-col gap-1 md:items-end">
                <a
                  href="mailto:info@althara.es"
                  className="link-underline text-lg text-[#e6e2d7]/70 hover:text-[#e6e2d7]"
                >
                  info@althara.es
                </a>
                <a
                  href="tel:+34694428685"
                  className="link-underline text-lg text-[#e6e2d7]/70 hover:text-[#e6e2d7]"
                >
                  +34 694 428 685
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <ContactModal isOpen={modal} onClose={() => setModal(false)} />
    </>
  );
}
