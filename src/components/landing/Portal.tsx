'use client';

/**
 * Sección Portal de inversores: presenta el data room privado y lleva a
 * /dataroom. Tarjeta con vídeo, candado y features con reveal escalonado.
 */
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MaskReveal, Reveal, EASE } from './motion';

const FEATURES = [0, 1, 2, 3] as const;

export default function Portal() {
  const t = useTranslations('landing.portal');
  const reduce = useReducedMotion();

  return (
    <section id="portal" className="container-site scroll-mt-24 py-24 md:py-36">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-6">
          <Reveal>
            <p className="label-mono text-[#c08552]">{t('label')}</p>
          </Reveal>
          <h2 className="display-xl mt-6 text-4xl text-[#1c3742] md:text-6xl lg:text-7xl">
            <MaskReveal><span className="block">{t('title1')}</span></MaskReveal>
            <MaskReveal delay={0.12}>
              <span className="block">
                {t('title2')}
                <span className="text-[#c08552]">.</span>
              </span>
            </MaskReveal>
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-[#1c3742]/70">{t('intro')}</p>
          </Reveal>

          <ul className="mt-10 space-y-5">
            {FEATURES.map((i) => (
              <motion.li
                key={i}
                initial={reduce ? {} : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: 0.08 * i, ease: EASE }}
                className="flex items-baseline gap-4 border-t border-[#1c3742]/10 pt-5"
              >
                <span className="label-mono shrink-0 text-[#c08552]">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="font-montserrat font-bold text-[#1c3742]">{t(`features.${i}.title`)}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#1c3742]/70">{t(`features.${i}.text`)}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          <Reveal delay={0.25} className="mt-12">
            <Link
              href="/dataroom"
              className="label-mono inline-block bg-[#c08552] px-8 py-4 text-[#102027] transition-colors duration-300 hover:bg-[#e6e2d7]"
            >
              {t('cta')}
            </Link>
            <p className="mt-4 text-xs text-[#1c3742]/40">{t('note')}</p>
          </Reveal>
        </div>

        {/* Visual: vídeo del data room */}
        <div className="relative md:col-span-6">
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1, ease: EASE }}
            className="sticky top-28 overflow-hidden border border-[#1c3742]/10 shadow-xl"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            >
              <source src="/videos/4.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-[#102027]/5 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
