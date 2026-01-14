'use client';

import { useTranslations } from 'next-intl';
import { useReveal } from '@/hooks/useReveal';
import Image from 'next/image';
import ContactModal from './ContactModal';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { HoverUnderline } from '@/components/ui/hover-underline';

export default function BriefingNote() {
  const t = useTranslations('briefingNote');
  const { ref, isRevealed } = useReveal({
    type: 'media',
    threshold: 0.2,
    duration: 0.7,
    distance: 12,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <section
        ref={ref as React.RefObject<HTMLElement>}
        className="py-24 lg:py-32 bg-[#102027]"
      >
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-12">
              <p className="text-xs tracking-extreme-editorial text-[#e6e2d7]/60 font-light">
                {t('label')}
              </p>
            </div>

            <motion.div
              className="relative overflow-hidden group cursor-pointer"
              onClick={openModal}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 opacity-20"
                whileHover={{ scale: 1.03, opacity: 0.3 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src="/jpg/10.jpg"
                  alt="Briefing note"
                  fill
                  className="object-cover grayscale"
                  sizes="100vw"
                />
              </motion.div>

              <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]"></div>

              <div className="relative z-10 p-12 lg:p-20 min-h-[400px] lg:min-h-[500px] flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-[#e6e2d7] font-normal mb-6 max-w-3xl">
                    {t('title')}
                  </h3>

                  <div className="space-y-3 max-w-2xl">
                    <p className="text-base md:text-lg text-[#e6e2d7]/70 font-light leading-relaxed">
                      {t('extract.line1')}
                    </p>
                    <p className="text-base md:text-lg text-[#e6e2d7]/70 font-light leading-relaxed">
                      {t('extract.line2')}
                    </p>
                  </div>
                </div>

                <div className="mt-12 flex items-center justify-between">
                  <HoverUnderline
                    as="button"
                    onClick={openModal}
                    className="text-[#e6e2d7] hover:text-[#e6e2d7]/80 font-light text-sm tracking-editorial"
                  >
                    {t('cta')}
                  </HoverUnderline>

                  <div className="text-xs tracking-wide-editorial text-[#e6e2d7]/40 font-light">
                    {t('stamp')}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
