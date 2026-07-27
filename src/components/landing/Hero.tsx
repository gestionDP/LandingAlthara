'use client';

/**
 * 01 · Portada — ALT-WEB-2026-01 §04.A.
 *
 * Qué es la firma y dónde opera. Sin promesa, sin adjetivo, sin subtítulo
 * promocional y SIN BOTONES: el único botón del site vive en la sección 09.
 * Las cifras no van aquí; tienen sección propia (02 · Posición).
 */
import { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MaskReveal } from './motion';

export default function Hero() {
  const t = useTranslations('landing.hero');
  const reduce = useReducedMotion();

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yVideo = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
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
        <motion.div style={reduce ? {} : { y: yTitle }} className="my-6">
          <MaskReveal onMount delay={0.25}>
            <Image
              src="/logos/Althara-SVG/Althara-01.svg"
              alt="ALTHARA"
              width={3470}
              height={494}
              priority
              className="h-auto w-[80vw] max-w-[900px] md:w-[60vw]"
            />
          </MaskReveal>
          <MaskReveal onMount delay={0.42}>
            <p className="mt-5 max-w-2xl text-2xl font-light leading-tight text-[#e6e2d7] md:text-4xl lg:text-5xl">
              {t('wordmarkSub')}
            </p>
          </MaskReveal>
        </motion.div>

        <motion.div
          className="flex flex-col gap-6 border-t border-[#e6e2d7]/15 pt-8 md:flex-row md:items-end md:justify-between md:gap-16"
          initial={reduce ? {} : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <p className="max-w-xl text-base leading-relaxed text-[#e6e2d7]/70 md:text-lg">
            {t('lead')}
          </p>
          <p className="label-mono max-w-sm leading-relaxed text-[#e6e2d7]/55">
            {t('location')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
