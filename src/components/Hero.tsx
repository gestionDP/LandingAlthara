'use client';

import { useTranslations } from 'next-intl';
import ContactModal from './ContactModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, useTransform } from 'framer-motion';
import { StickyScene } from '@/components/StickyScene';

export default function Hero() {
  const t = useTranslations('hero');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <StickyScene  zIndex={10}>
        {({ progress }) => {
          const titleY = useTransform(progress, [0, 0.12], [14, 0]);
          const titleO = useTransform(progress, [0, 0.10], [0, 1]);

          const subY = useTransform(progress, [0.05, 0.18], [12, 0]);
          const subO = useTransform(progress, [0.06, 0.16], [0, 1]);

          const ctaY = useTransform(progress, [0.10, 0.24], [10, 0]);
          const ctaO = useTransform(progress, [0.12, 0.22], [0, 1]);

          const gridO = useTransform(progress, [0.22, 0.42], [0, 1]);
          const panelScale = useTransform(progress, [0, 0.42], [1, 0.985]);
          const bgDim = useTransform(progress, [0.18, 0.42], [0.55, 0.78]);

          const heroOut = useTransform(progress, [0.75, 1], [1, 0.9]);

          return (
            <motion.div className="relative h-screen w-full" style={{ opacity: heroOut }}>
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

                <motion.div className="absolute inset-0" style={{ opacity: bgDim }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/70" />
                </motion.div>
              </div>

              <motion.div
                style={{ opacity: gridO }}
                className="absolute inset-0 pointer-events-none"
              >
                <div
                  className="absolute inset-0 opacity-[0.14]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(230,226,215,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(230,226,215,0.10) 1px, transparent 1px)',
                    backgroundSize: '96px 96px',
                  }}
                />
              </motion.div>

              <motion.div
                className="relative z-10 h-full flex items-center"
                style={{ scale: panelScale }}
              >
                <div className="max-w-[1920px] mx-auto px-6 lg:px-12 w-full">
                  <div className="max-w-4xl">
                    <motion.h1
                      style={{ y: titleY, opacity: titleO }}
                      className="font-montserrat text-5xl md:text-7xl lg:text-8xl font-medium text-[#e6e2d7] leading-[1.05] mb-6"
                    >
                      {t('title')}
                    </motion.h1>

                    <motion.p
                      style={{ y: subY, opacity: subO }}
                      className="text-lg md:text-xl lg:text-2xl text-[#e6e2d7]/85 font-light leading-relaxed mb-8 max-w-2xl"
                    >
                      {t('subtitle')}
                    </motion.p>

                    <motion.div
                      style={{ y: ctaY, opacity: ctaO }}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6"
                    >
                      <Button
                        onClick={openModal}
                        className="h-12 px-8 font-light tracking-editorial text-sm bg-[#e6e2d7] text-[#0a0a0a] hover:bg-[#e6e2d7]/90 transition-all duration-200"
                      >
                        {t('ctaPrimary')}
                      </Button>

                    
                    </motion.div>

                
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                style={{ opacity: useTransform(progress, [0.0, 0.2], [0.35, 0]) }}
              >
                <div className="w-px h-12 bg-[#e6e2d7]/25" />
              </motion.div>
            </motion.div>
          );
        }}
      </StickyScene>

      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
