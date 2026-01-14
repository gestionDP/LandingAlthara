'use client';

import { useTranslations } from 'next-intl';
import ContactModal from './ContactModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useReveal } from '@/hooks/useReveal';
import { motion } from 'framer-motion';

export default function Hero() {
  const t = useTranslations('hero');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const titleReveal = useReveal({ type: 'text', delay: 0 });
  const subcopyReveal = useReveal({ type: 'text', delay: 0.1 });
  const ctasReveal = useReveal({ type: 'text', delay: 0.15 });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1920px] mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-4xl">
              <motion.div
                ref={titleReveal.ref as React.RefObject<HTMLDivElement>}
                initial={{ opacity: 0, y: 12 }}
                animate={
                  titleReveal.isRevealed
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 12 }
                }
                transition={titleReveal.animationProps.transition}
              >
                <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl font-normal text-[#e6e2d7] leading-[1.1] mb-6">
                  {t('title')}
                </h1>
              </motion.div>

              <motion.div
                ref={subcopyReveal.ref as React.RefObject<HTMLDivElement>}
                initial={{ opacity: 0, y: 12 }}
                animate={
                  subcopyReveal.isRevealed
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 12 }
                }
                transition={subcopyReveal.animationProps.transition}
              >
                <p className="text-lg md:text-xl lg:text-2xl text-[#e6e2d7]/90 font-light leading-relaxed mb-8 max-w-2xl">
                  {t('subtitle')}
                </p>
              </motion.div>

              <motion.div
                ref={ctasReveal.ref as React.RefObject<HTMLDivElement>}
                initial={{ opacity: 0, y: 12 }}
                animate={
                  ctasReveal.isRevealed
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 12 }
                }
                transition={ctasReveal.animationProps.transition}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6"
              >
                <Button
                  onClick={openModal}
                  className="h-12 px-8 font-light tracking-editorial text-sm bg-[#e6e2d7] text-[#0a0a0a] hover:bg-[#e6e2d7]/90 transition-all duration-200"
                >
                  {t('ctaPrimary')}
                </Button>

                <button
                  onClick={() => {
                    const methodSection = document.getElementById('method');
                    if (methodSection) {
                      methodSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-[#e6e2d7]/80 hover:text-[#e6e2d7] font-light text-sm transition-all duration-200 underline underline-offset-4 decoration-[#e6e2d7]/30 hover:decoration-[#e6e2d7]/60"
                >
                  {t('ctaSecondary')}
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={
                  ctasReveal.isRevealed ? { opacity: 1 } : { opacity: 0 }
                }
                transition={{ delay: 0.2, duration: 0.55 }}
              >
                <p className="text-xs text-[#e6e2d7]/50 font-light tracking-wide-editorial">
                  {t('microcopy')}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 opacity-30">
          <div className="w-px h-12 bg-[#e6e2d7]/30"></div>
        </div>
      </section>

      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
