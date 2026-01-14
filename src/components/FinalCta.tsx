'use client';

import { useTranslations } from 'next-intl';
import ContactModal from './ContactModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useReveal } from '@/hooks/useReveal';
import { motion } from 'framer-motion';

export default function FinalCta() {
  const t = useTranslations('finalCta');
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        className="relative h-[80vh] lg:h-screen w-full overflow-hidden"
      >
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/5.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-[1920px] mx-auto px-6 lg:px-12 w-full">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={
                isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
              }
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-[#e6e2d7] font-normal mb-6 leading-[1.1]">
                {t('title')}
              </h2>

              <div className="space-y-3 mb-10">
                <p className="text-lg md:text-xl text-[#e6e2d7]/90 font-light leading-relaxed">
                  {t('subcopy.line1')}
                </p>
                <p className="text-lg md:text-xl text-[#e6e2d7]/90 font-light leading-relaxed">
                  {t('subcopy.line2')}
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={openModal}
                  className="h-14 px-10 font-light tracking-editorial text-sm bg-[#e6e2d7] text-[#0a0a0a] hover:bg-transparent hover:text-[#e6e2d7] hover:border-[#e6e2d7] border border-transparent transition-all duration-200 mb-8"
                >
                  {t('cta')}
                </Button>
              </motion.div>

              <p className="text-xs text-[#e6e2d7]/40 font-light tracking-wide-editorial">
                {t('microcopy')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
