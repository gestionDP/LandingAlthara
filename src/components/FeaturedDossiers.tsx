'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import ContactModal from './ContactModal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion, useReducedMotion } from 'framer-motion';
import { durations, easeOut } from '@/motion/tokens';

type Dossier = {
  n: string;
  title: string;
  year: string;
  description: string;
  image: string;
};

export default function FeaturedDossiers() {
  const t = useTranslations('featuredDossiers');
  const prefersReducedMotion = useReducedMotion();
  const [detailDossier, setDetailDossier] = useState<Dossier | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const dossiers = useMemo<Dossier[]>(
    () => [
      {
        n: '01',
        title: t('dossier1.title'),
        year: t('dossier1.year'),
        description: t('dossier1.description'),
        image: '/jpg/35.png',
      },
      {
        n: '02',
        title: t('dossier2.title'),
        year: t('dossier2.year'),
        description: t('dossier2.description'),
        image: '/jpg/36.png',
      },
      {
        n: '03',
        title: t('dossier3.title'),
        year: t('dossier3.year'),
        description: t('dossier3.description'),
        image: '/jpg/37.png',
      },
    ],
    [t]
  );

  const openDetail = (d: Dossier) => setDetailDossier(d);
  const closeDetail = () => setDetailDossier(null);
  const openContact = () => {
    closeDetail();
    setIsContactOpen(true);
  };

  return (
    <>
      <section id="dossiers" className="relative py-20 md:py-24 lg:py-28 overflow-hidden bg-[#070707]">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="mb-10 md:mb-12">
            <p className="text-xs tracking-extreme-editorial text-[#e6e2d7]/60 font-light">
              {t('label')}
            </p>
            <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-semibold font-montserrat text-[#e6e2d7] leading-tight max-w-2xl">
              {t('title')}
            </h2>
          </div>

          {/* Desktop: 1 grande izquierda + 2 en columna derecha. Mobile: columna única */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Card grande (izquierda en desktop) */}
            <motion.article
              key={dossiers[0].n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: durations.section, ease: easeOut }}
              className="flex flex-col"
            >
              <motion.button
                type="button"
                onClick={() => openDetail(dossiers[0])}
                className="group w-full text-left border border-[#e6e2d7]/10 bg-[#0b0b0b]/60 backdrop-blur-sm overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e6e2d7]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070707] min-h-[44px]"
                whileHover={!prefersReducedMotion ? { y: -2 } : undefined}
                whileTap={!prefersReducedMotion ? { scale: 0.99 } : undefined}
                transition={{ duration: durations.micro, ease: easeOut }}
              >
                <div className="relative w-full aspect-[16/10] lg:aspect-[4/5]">
                  <Image
                    src={dossiers[0].image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/85 via-[#0a0a0a]/30 to-transparent" />
                  <div className="absolute left-0 right-0 bottom-0 p-5 md:p-6">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-xs tracking-[0.28em] text-[#e6e2d7]/50">
                        {dossiers[0].year}
                      </span>
                      <span className="h-px w-6 bg-[#e6e2d7]/20" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-medium font-montserrat text-[#e6e2d7] leading-tight">
                      {dossiers[0].title}
                    </h3>
                    <p className="mt-2 text-sm text-[#e6e2d7]/70 font-light line-clamp-2">
                      {dossiers[0].description}
                    </p>
                  </div>
                </div>
              </motion.button>
            </motion.article>

            {/* Columna derecha: 2 cards apiladas (solo desktop; en mobile van debajo de la primera) */}
            <div className="flex flex-col gap-6 lg:gap-8">
              {dossiers.slice(1, 3).map((dossier, idx) => (
                <motion.article
                  key={dossier.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: durations.section, ease: easeOut, delay: (idx + 1) * 0.06 }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  <motion.button
                    type="button"
                    onClick={() => openDetail(dossier)}
                    className="group w-full text-left border border-[#e6e2d7]/10 bg-[#0b0b0b]/60 backdrop-blur-sm overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e6e2d7]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070707] min-h-[44px] flex-1"
                    whileHover={!prefersReducedMotion ? { y: -2 } : undefined}
                    whileTap={!prefersReducedMotion ? { scale: 0.99 } : undefined}
                    transition={{ duration: durations.micro, ease: easeOut }}
                  >
                    <div className="relative w-full aspect-[4/3]">
                      <Image
                        src={dossier.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        sizes="(min-width: 1024px) 50vw, 100vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/85 via-[#0a0a0a]/25 to-transparent" />
                      <div className="absolute left-0 right-0 bottom-0 p-5 md:p-6">
                        <div className="flex items-baseline gap-3 mb-1">
                          <span className="text-xs tracking-[0.28em] text-[#e6e2d7]/50">
                            {dossier.year}
                          </span>
                          <span className="h-px w-6 bg-[#e6e2d7]/20" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-medium font-montserrat text-[#e6e2d7] leading-tight">
                          {dossier.title}
                        </h3>
                        <p className="mt-2 text-sm text-[#e6e2d7]/70 font-light line-clamp-2">
                          {dossier.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={!!detailDossier} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="border-[#e6e2d7]/20 bg-[#0a0a0a] text-[#e6e2d7] max-w-lg">
          {detailDossier && (
            <>
              <DialogTitle className="sr-only">{detailDossier.title}</DialogTitle>
              <div className="space-y-4 pr-8">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs tracking-[0.28em] text-[#e6e2d7]/50">
                    {detailDossier.year}
                  </span>
                  <span className="h-px w-8 bg-[#e6e2d7]/20" />
                </div>
                <h2 className="text-2xl md:text-3xl font-medium font-montserrat text-[#e6e2d7] leading-tight">
                  {detailDossier.title}
                </h2>
                <p className="text-base text-[#e6e2d7]/80 font-light leading-relaxed">
                  {detailDossier.description}
                </p>
                <Button
                  onClick={openContact}
                  className="mt-6 h-12 px-8 font-light tracking-editorial text-sm bg-[#e6e2d7] text-[#0a0a0a] hover:bg-[#e6e2d7]/90 transition-colors"
                >
                  {t('cta')}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}
