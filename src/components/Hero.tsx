'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import ContactModal from './ContactModal';
import { Button } from '@/components/ui/button';

/**
 * Hero: vídeo de fondo real (/videos/1.mp4 — antes apuntaba a hero.mp4,
 * que no existe), entrada animada POR TIEMPO (visible desde el primer
 * frame, sin depender del scroll) y parallax sutil al scrollear.
 */
export default function Hero() {
  const t = useTranslations('hero');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentO = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const cueO = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const enter = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <>
      <section ref={ref} className="relative h-screen w-full overflow-hidden">
        {/* Fondo: vídeo + fallback de gradiente por si el vídeo tarda */}
        <motion.div className="absolute inset-0" style={prefersReducedMotion ? {} : { scale: videoScale }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#102027] via-[#1c3742] to-[#0a0a0a]" />
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/videos/1.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#0a0a0a]" />
        </motion.div>

        {/* Retícula editorial, aparece suave */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ duration: 2, delay: 1 }}
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(230,226,215,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(230,226,215,0.10) 1px, transparent 1px)',
            backgroundSize: '96px 96px',
          }}
        />

        {/* Contenido */}
        <motion.div
          className="relative z-10 flex h-full items-center"
          style={prefersReducedMotion ? {} : { y: contentY, opacity: contentO }}
        >
          <div className="mx-auto w-full max-w-[1920px] px-6 lg:px-12">
            <div className="max-w-4xl">
              <motion.p
                {...enter(0.1)}
                className="mb-6 text-xs font-light uppercase tracking-[0.35em] text-[#e6e2d7]/60"
              >
                {t('microcopy')}
              </motion.p>

              <motion.h1
                {...enter(0.25)}
                className="mb-6 font-playfair text-5xl font-medium leading-[1.05] text-[#e6e2d7] md:text-7xl lg:text-8xl"
              >
                {t('title')}
              </motion.h1>

              <motion.p
                {...enter(0.45)}
                className="mb-10 max-w-2xl text-lg font-light leading-relaxed text-[#e6e2d7]/85 md:text-xl lg:text-2xl"
              >
                {t('subtitle')}
              </motion.p>

              <motion.div
                {...enter(0.65)}
                className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
              >
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="h-12 px-8 text-sm font-light tracking-editorial bg-[#e6e2d7] text-[#0a0a0a] transition-all duration-300 hover:bg-white hover:shadow-[0_0_30px_rgba(230,226,215,0.25)]"
                >
                  {t('ctaPrimary')}
                </Button>
                <Link
                  href="/dataroom"
                  className="group inline-flex h-12 items-center gap-2 border border-[#e6e2d7]/30 px-8 text-sm font-light tracking-editorial text-[#e6e2d7] transition-all duration-300 hover:border-[#e6e2d7]/70 hover:bg-[#e6e2d7]/10"
                >
                  {t('ctaPortal')}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Indicador de scroll animado */}
        <motion.div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
          style={prefersReducedMotion ? {} : { opacity: cueO }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
        >
          <div className="relative h-14 w-px overflow-hidden bg-[#e6e2d7]/15">
            <motion.div
              className="absolute left-0 top-0 h-5 w-px bg-[#e6e2d7]/70"
              animate={prefersReducedMotion ? {} : { y: [0, 56] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </section>

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
