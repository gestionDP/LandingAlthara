'use client';

/**
 * Hero editorial: vídeo a pantalla completa detrás del wordmark gigante
 * ALTHARA., reveals de máscara al montar y parallax opuesto (vídeo baja,
 * título sube) al scrollear.
 */
import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import ContactModal from '../ContactModal';
import { MaskReveal } from './motion';

export default function Hero() {
  const t = useTranslations('landing.hero');
  const [modal, setModal] = useState(false);
  const reduce = useReducedMotion();

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yVideo = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <>
      <section ref={ref} className="relative min-h-screen overflow-hidden bg-[#102027]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#102027] via-[#1c3742] to-[#102027]" />
        <motion.video
          style={reduce ? { scale: 1.15 } : { y: yVideo, scale: 1.15 }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </motion.video>
        {/* Velo doble para que el wordmark siempre lea */}
        <div className="absolute inset-0 bg-[#102027]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#102027]/90 via-transparent to-[#102027]/50" />

        <div className="container-site relative z-10 flex min-h-screen flex-col justify-between pb-12 pt-32 text-[#e6e2d7]">
          {/* Wordmark gigante */}
          <motion.div style={reduce ? {} : { y: yTitle }} className="my-6">
            <h1 className="display-xl text-[15vw] leading-[0.95] md:text-[10rem] lg:text-[12rem]">
              <MaskReveal onMount delay={0.25}>
                <span className="block">ALTHARA</span>
              </MaskReveal>
            </h1>
            <MaskReveal onMount delay={0.42}>
              <p className="mt-4 text-lg font-light text-[#e6e2d7]/90 md:text-right md:text-2xl">
                {t('wordmarkSub')}
                <span className="text-[#c08552]">.</span>
              </p>
            </MaskReveal>
          </motion.div>

          <div>
            <div className="grid gap-8 border-t border-[#e6e2d7]/15 pt-8 md:grid-cols-2 md:gap-16">
              <MaskReveal onMount delay={0.6}>
                <p className="max-w-md text-xl font-medium leading-snug md:text-2xl">
                  {t('tagline')}
                </p>
              </MaskReveal>
              <motion.div
                className="flex flex-col gap-6 md:items-end"
                initial={reduce ? {} : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.75 }}
              >
                <p className="max-w-sm text-sm leading-relaxed text-[#e6e2d7]/70 md:text-right">
                  {t('sub')}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setModal(true)}
                    className="label-mono bg-[#e6e2d7] px-6 py-3 text-[#102027] transition-colors duration-300 hover:bg-[#c08552] hover:text-[#e6e2d7]"
                  >
                    {t('cta1')}
                  </button>
                  <Link
                    href="/dataroom"
                    className="label-mono border border-[#e6e2d7]/70 px-6 py-3 text-[#e6e2d7] transition-colors duration-300 hover:bg-[#e6e2d7] hover:text-[#102027]"
                  >
                    {t('cta2')}
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Cifras reales */}
            <motion.div
              className="mt-10 flex flex-wrap gap-x-12 gap-y-4 border-t border-[#e6e2d7]/15 pt-8"
              initial={reduce ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.95 }}
            >
              {([0, 1, 2] as const).map((i) => (
                <div key={i}>
                  <p className="mt-1 font-montserrat text-2xl font-semibold md:text-3xl">{t(`stats.${i}.v`)}</p>
                  <p className="label-mono mt-1 text-[#e6e2d7]/55">{t(`stats.${i}.k`)}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <ContactModal isOpen={modal} onClose={() => setModal(false)} />
    </>
  );
}
