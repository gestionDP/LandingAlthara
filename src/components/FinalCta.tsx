'use client';

import { useTranslations } from 'next-intl';
import ContactModal from './ContactModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useReveal } from '@/hooks/useReveal';
import { motion, useReducedMotion } from 'framer-motion';

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container = {
  hidden: { opacity: 0, y: 14, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.9,
      ease: easeOutExpo,
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: easeOutExpo },
  },
};

const underline = {
  hidden: { scaleX: 0, opacity: 0, transformOrigin: '50% 50%' },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.9, ease: easeOutExpo, delay: 0.08 },
  },
};

export default function FinalCta() {
  const t = useTranslations('finalCta');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const { ref, isRevealed } = useReveal({
    type: 'media',
    threshold: 0.2,
    duration: 0.8,
    distance: 12,
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <section
        ref={ref as React.RefObject<HTMLElement>}
        id="access"
        className="relative lg:h-screen w-full h-screen overflow-hidden"
      >
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/5.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black/40" />

          {!prefersReducedMotion && (
            <motion.div
              aria-hidden
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.35, ease: easeOutExpo }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ y: '12%', opacity: 0 }}
                animate={isRevealed ? { y: '0%', opacity: 1 } : { y: '12%', opacity: 0 }}
                transition={{ duration: 1.1, ease: easeOutExpo }}
                style={{
                  background:
                    'radial-gradient(900px 520px at 50% 55%, rgba(230,226,215,0.10), rgba(10,10,10,0) 60%)',
                  mixBlendMode: 'screen',
                }}
              />
            </motion.div>
          )}
        </div>

        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-[1920px] mx-auto px-6 lg:px-12 w-full">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              variants={container}
              initial="hidden"
              animate={isRevealed ? 'show' : 'hidden'}
            >
              <motion.h2
                variants={item}
                className="text-4xl md:text-5xl lg:text-6xl font-playfair text-[#e6e2d7] font-normal mb-6 leading-[1.1]"
              >
                {t('title')}
              </motion.h2>

              <motion.div
                variants={underline}
                className="mx-auto mb-8 h-px w-28 bg-[#e6e2d7]/25"
              />

              <div className="space-y-3 mb-10">
                <motion.p
                  variants={item}
                  className="text-lg md:text-xl text-[#e6e2d7]/90 font-light leading-relaxed"
                >
                  {t('subcopy.line1')}
                </motion.p>
                <motion.p
                  variants={item}
                  className="text-lg md:text-xl text-[#e6e2d7]/90 font-light leading-relaxed"
                >
                  {t('subcopy.line2')}
                </motion.p>
              </div>

              <motion.div
                variants={item}
                whileHover={!prefersReducedMotion ? { scale: 1.01 } : undefined}
                whileTap={!prefersReducedMotion ? { scale: 0.99 } : undefined}
                transition={{ duration: 0.2, ease: easeOutExpo }}
              >
                <Button
                  onClick={openModal}
                  className="h-14 px-10 font-light tracking-editorial text-sm bg-[#e6e2d7] text-[#0a0a0a] hover:bg-transparent hover:text-[#e6e2d7] hover:border-[#e6e2d7] border border-transparent transition-all duration-200 mb-8"
                >
                  {t('cta')}
                </Button>
              </motion.div>

             
            </motion.div>
          </div>
        </div>
      </section>

      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
