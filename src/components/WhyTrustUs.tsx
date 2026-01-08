'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import SectionHeader from './SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import ContactModal from './ContactModal';
import AnimatedSection, { AnimatedSequence } from './AnimatedSection';
import { useTranslations } from 'next-intl';

const backgroundImages = [
  '/jpg/14.jpg',

  '/jpg/19.jpg',
  '/jpg/20.jpg',
  '/jpg/2.jpg',
];

export default function WhyTrustUs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const t = useTranslations('whyTrustUs');

  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="por-que-confiar" className="relative overflow-hidden">
      <div className="absolute inset-0">
        {backgroundImages.map((src, index) => {
          const isActive = index === currentImageIndex;

          return (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <Image
                src={src}
                alt={`Background ${index + 1}`}
                fill
                priority={index === 0 || index === 1}
                className="object-cover"
                quality={90}
              />
              <div className="absolute inset-0 bg-althara-dark-blue/75"></div>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="mb-16" animation="fadeInUp" delay={0.2}>
            <SectionHeader letter="E" title={t('title')} variant="dark" />
          </AnimatedSection>

          <AnimatedSequence
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            animation="fadeInUp"
            baseDelay={0.4}
            delayIncrement={0.2}
          >
            <div className="h-full">
              <Card
                className="h-full rounded-none border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                style={{ backgroundColor: '#e6e2d7' }}
              >
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-althara-dark-blue/10 flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-althara-dark-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-althara-black mb-2">
                      {t('cards.card1.title')}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('cards.card1.subtitle')}
                    </p>
                  </div>
                  <p className="text-base font-light text-gray-700 leading-relaxed flex-grow">
                    {t('cards.card1.description')}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="h-full">
              <Card
                className="h-full rounded-none border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                style={{ backgroundColor: '#e6e2d7' }}
              >
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-althara-dark-blue/10 flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-althara-dark-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-althara-black mb-2">
                      {t('cards.card2.title')}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('cards.card2.subtitle')}
                    </p>
                  </div>
                  <p className="text-base font-light text-gray-700 leading-relaxed flex-grow">
                    {t('cards.card2.description')}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="h-full">
              <Card
                className="h-full rounded-none border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                style={{ backgroundColor: '#e6e2d7' }}
              >
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-althara-dark-blue/10 rounded-none flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-althara-dark-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-althara-black mb-2">
                      {t('cards.card3.title')}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('cards.card3.subtitle')}
                    </p>
                  </div>
                  <p className="text-base font-light text-gray-700 leading-relaxed flex-grow">
                    {t('cards.card3.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </AnimatedSequence>
        </div>
      </div>

      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </section>
  );
}
