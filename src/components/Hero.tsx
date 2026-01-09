'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AnimatedSection from './AnimatedSection';
import { useTranslations } from 'next-intl';

const heroImages = ['/jpg/7.jpg', '/jpg/5.jpg', '/jpg/4.jpg', '/jpg/hero.jpg'];

export default function Hero() {
  const t = useTranslations('hero');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        {heroImages.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100 z-0' : 'opacity-0 z-[-1]'
            }`}
          >
            <Image
              src={src}
              alt={`Hero Background ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover"
              quality={90}
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ))}
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex-1"></div>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-32 mt-20">
          <AnimatedSection animation="fadeInUp" delay={0.4} autoAnimate={true}>
            <h1 className="text-4xl sm:text-5xl md:text-4xl lg:text-7xl font-normal text-white mb-6 leading-tight break-words">
              {t('title')
                .split('\n')
                .map((line, index) => (
                  <span key={index} className="block">
                    {line}
                  </span>
                ))}
            </h1>
          </AnimatedSection>

          <AnimatedSection
            className="space-y-2 mb-6"
            animation="fadeInUp"
            delay={0.6}
            autoAnimate={true}
          >
            <p className="text-base sm:text-lg md:text-xl text-white font-light leading-relaxed break-words">
              {t('description.line1')}
            </p>
            <p className="text-base sm:text-lg md:text-xl text-white font-light leading-relaxed break-words">
              {t('description.line2')}
            </p>
            <p className="text-base sm:text-lg md:text-xl text-white font-light leading-relaxed break-words">
              {t('description.line3')}
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
