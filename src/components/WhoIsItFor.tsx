'use client';

import Image from 'next/image';
import SectionHeader from './SectionHeader';
import AnimatedSection, { AnimatedSequence } from './AnimatedSection';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function WhoIsItFor() {
  const t = useTranslations('whoIsItFor');

  const profiles = [
    {
      key: 'investors',
      image: '/jpg/16.jpg',
      alt: 'Inversores',
    },
    {
      key: 'owners',
      image: '/jpg/17.jpg',
      alt: 'Propietarios',
    },
    {
      key: 'partners',
      image: '/jpg/18.jpg',
      alt: 'Partners',
    },
  ];

  return (
    <section id="para-quien-es" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-16">
      <div className="absolute inset-0">
        <Image
          src="/jpg/20.jpg"
          alt="Background"
          fill
          className="object-cover"
          quality={95}
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <AnimatedSection className="mb-12" animation="fadeInUp" delay={0.2}>
          <SectionHeader letter="D" title={t('title')} variant="dark" />
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-light text-[#e6e2d7] leading-tight mt-6 text-center">
            {t('heading')}
          </h2>
        </AnimatedSection>

        <AnimatedSequence
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          animation="fadeInUp"
          baseDelay={0.4}
          delayIncrement={0.2}
        >
          {profiles.map((profile) => (
            <motion.div
              key={profile.key}
              className="relative h-96 overflow-hidden group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0">
                <Image
                  src={profile.image}
                  alt={profile.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/70 group-hover:bg-black/60 transition-colors duration-300"></div>
              </div>

              <div className="relative z-10 h-full flex flex-col justify-end p-8 text-[#e6e2d7]">
                <h3 className="text-2xl sm:text-3xl font-medium mb-2">
                  {t(`profiles.${profile.key}.title`)}
                </h3>
                <p className="text-lg sm:text-xl font-light leading-relaxed">
                  {t(`profiles.${profile.key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatedSequence>
      </div>
    </section>
  );
}
