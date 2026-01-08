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
      key: 'advisors',
      image: '/jpg/18.jpg',
      alt: 'Asesores',
    },
  ];

  return (
    <section id="para-quien-es" className="bg-[#e6e2d7] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-16" animation="fadeInUp" delay={0.2}>
          <SectionHeader letter="D" title={t('title')} />
          <h2 className="text-4xl font-normal text-althara-black leading-tight mt-6">
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
                <div className="absolute inset-0 bg-althara-dark-blue/70 group-hover:bg-althara-dark-blue/60 transition-colors duration-300"></div>
              </div>

              <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
                <h3 className="text-3xl font-medium mb-4">
                  {t(`profiles.${profile.key}.title`)}
                </h3>
                <p className="text-base font-light leading-relaxed line-clamp-2">
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
