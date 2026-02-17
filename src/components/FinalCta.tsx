'use client';

import { useTranslations } from 'next-intl';
import ContactModal from './ContactModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, useReducedMotion } from 'framer-motion';
import { durations, easeOut } from '@/motion/tokens';

/**
 * Cada bloque se revela cuando ENTRA en vista al hacer scroll (no todo a la vez).
 * amount: parte del elemento que debe estar visible para disparar (0.4 = ~40%).
 */
const VIEWPORT_AMOUNT = 0.4;

const itemReveal = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};
const lineReveal = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1 },
};

export default function FinalCta() {
  const t = useTranslations('finalCta');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const viewport = { once: true, amount: VIEWPORT_AMOUNT };
  const transition = { duration: durations.section, ease: easeOut };

  return (
    <>
      <section
        id="access"
        className="relative min-h-screen flex items-center justify-center py-24 md:py-32 overflow-hidden bg-[#0a0a0a]"
      >
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#e6e2d7]/15 to-transparent hidden lg:block" />

        <div className="relative z-10 max-w-[1920px] mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-4xl mx-auto lg:mx-0 lg:max-w-3xl text-center lg:text-left">
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={itemReveal}
              transition={{ ...transition, duration: durations.ui }}
              className="text-xs tracking-[0.28em] text-[#e6e2d7]/50 font-light mb-6"
            >
              ACCESO
            </motion.p>

            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={itemReveal}
              transition={transition}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-playfair font-normal text-[#e6e2d7] leading-[1.05] mb-8"
            >
              {t('title')}
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={lineReveal}
              transition={{ ...transition, duration: durations.ui }}
              className="h-px w-24 bg-[#e6e2d7]/30 origin-left mb-10 mx-auto lg:mx-0"
            />

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={itemReveal}
              transition={transition}
              className="text-lg md:text-xl lg:text-2xl text-[#e6e2d7]/90 font-light leading-relaxed mb-4"
            >
              {t('subcopy.line1')}
            </motion.p>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={itemReveal}
              transition={transition}
              className="text-lg md:text-xl lg:text-2xl text-[#e6e2d7]/80 font-light leading-relaxed mb-12"
            >
              {t('subcopy.line2')}
            </motion.p>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={itemReveal}
              transition={transition}
              className="flex justify-center lg:justify-start"
            >
              <motion.div
                whileHover={!prefersReducedMotion ? { scale: 1.02 } : undefined}
                whileTap={!prefersReducedMotion ? { scale: 0.98 } : undefined}
                transition={{ duration: durations.micro, ease: easeOut }}
              >
                <Button
                  onClick={openModal}
                  className="h-14 px-12 font-light tracking-editorial text-sm bg-[#e6e2d7] text-[#0a0a0a] hover:bg-transparent hover:text-[#e6e2d7] hover:border-[#e6e2d7] border-2 border-transparent transition-all duration-200"
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
