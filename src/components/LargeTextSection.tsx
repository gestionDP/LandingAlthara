'use client';

import AnimatedSection from './AnimatedSection';
import { useTranslations } from 'next-intl';

interface LargeTextSectionProps {
  translationKey: string;
  className?: string;
}

export default function LargeTextSection({
  translationKey,
  className = '',
}: LargeTextSectionProps) {
  const t = useTranslations(translationKey);

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center bg-althara-dark-blue ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <AnimatedSection animation="fadeInUp" delay={0.2}>
          <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-[#e6e2d7] leading-[0.9] tracking-tight text-center">
            {t('heading')
              .split('\n')
              .map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
          </h2>
        </AnimatedSection>
        {t('description') && (
          <AnimatedSection animation="fadeInUp" delay={0.4}>
            <p className="text-2xl sm:text-3xl md:text-4xl font-light text-[#e6e2d7]/80 leading-relaxed mt-12 text-center max-w-4xl mx-auto">
              {t('description')}
            </p>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}



