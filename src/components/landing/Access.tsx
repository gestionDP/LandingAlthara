'use client';

/**
 * 09 · Acceso — ALT-WEB-2026-01 §04.I.
 *
 * Cierre único. EL ÚNICO BOTÓN DEL SITE está aquí; ninguna otra sección
 * puede tener uno. La selección de contrapartes se afirma una sola vez, en
 * esta sección. Sin punto final decorativo y sin «Ya soy inversor»: ese
 * acceso es un enlace de texto en el pie.
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ContactModal from '../ContactModal';
import { MaskReveal, Reveal } from './motion';

export default function Access() {
  const t = useTranslations('landing.access');
  const [modal, setModal] = useState(false);

  return (
    <>
      <section id="acceso" className="relative scroll-mt-24 overflow-hidden">
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
        <div className="absolute inset-0 bg-[#102027]/80" />

        <div className="container-site relative z-10 py-28 md:py-40">
          <p className="label-mono text-[#c08552]">{t('label')}</p>

          <h2 className="display-xl mt-8 text-[9vw] leading-[1.02] text-[#e6e2d7] md:text-[4.5rem] lg:text-[5.5rem]">
            <MaskReveal><span className="block">{t('line1')}</span></MaskReveal>
            <MaskReveal delay={0.1}><span className="block">{t('line2')}</span></MaskReveal>
            <MaskReveal delay={0.2}><span className="block">{t('line3')}</span></MaskReveal>
          </h2>

          <div className="mt-14 grid gap-10 border-t border-[#e6e2d7]/15 pt-10 md:grid-cols-2 md:gap-16">
            <Reveal>
              <p className="max-w-md text-lg leading-relaxed text-[#e6e2d7]/70 md:text-xl">
                {t('sub')}
              </p>
            </Reveal>
            <Reveal delay={0.15} className="flex flex-col gap-6 md:items-end">
              {/* Único botón del site */}
              <button
                onClick={() => setModal(true)}
                className="label-mono w-fit bg-[#e6e2d7] px-8 py-4 text-[#102027] transition-colors duration-300 hover:bg-[#c08552] hover:text-[#e6e2d7]"
              >
                {t('cta')}
              </button>
              <a
                href={`mailto:${t('email')}`}
                className="link-underline w-fit text-lg text-[#e6e2d7]/70 hover:text-[#e6e2d7]"
              >
                {t('email')}
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <ContactModal isOpen={modal} onClose={() => setModal(false)} />
    </>
  );
}
