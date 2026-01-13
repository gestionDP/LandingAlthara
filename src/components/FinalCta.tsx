'use client';

import Image from 'next/image';
import AnimatedSection from './AnimatedSection';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import ContactModal from './ContactModal';
import { useState } from 'react';

export default function FinalCta() {
  const t = useTranslations('finalCta');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <section id="cta-final" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-16">
      <div className="absolute inset-0">
        <Image
          src="/jpg/14.jpg"
          alt="Background"
          fill
          className="object-cover"
          quality={95}
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center py-12">
        <AnimatedSection animation="fadeInUp" delay={0.2}>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-light text-[#e6e2d7] leading-tight tracking-tight mb-8">
            {t('heading')}
          </h2>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={0.4}>
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-[#e6e2d7]/90 leading-relaxed mb-10 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={0.6}>
          <Button
            onClick={openModal}
            className="h-16 px-12 text-lg font-medium bg-althara-primary text-[#e6e2d7] hover:bg-althara-primary/90 border border-[#e6e2d7]/30 shadow-lg hover:shadow-xl transition-all duration-300 mb-6"
          >
            {t('cta')}
          </Button>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={0.8}>
          <p className="text-base sm:text-lg text-[#e6e2d7]/70 font-light">
            {t('microcopy')}
          </p>
        </AnimatedSection>

        <ContactModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </section>
  );
}

