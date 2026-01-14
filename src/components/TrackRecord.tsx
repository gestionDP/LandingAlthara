'use client';

import { useTranslations } from 'next-intl';
import { useReveal } from '@/hooks/useReveal';
import { motion } from 'framer-motion';

export default function TrackRecord() {
  const t = useTranslations('trackRecord');
  const { ref, isRevealed } = useReveal({ type: 'media', threshold: 0.2, duration: 0.6, distance: 10 });

  const metrics = [
    { value: t('metric1.value'), label: t('metric1.label') },
    { value: t('metric2.value'), label: t('metric2.label') },
    { value: t('metric3.value'), label: t('metric3.label') },
    { value: t('metric4.value'), label: t('metric4.label') },
  ];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-16 lg:py-20 bg-[#102027] relative"
    >
      <div className="absolute inset-0 opacity-[0.02] hidden lg:block">
        <div className="h-full w-full bg-gradient-to-r from-[#e6e2d7] via-transparent to-[#e6e2d7]"></div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-12 text-center">
            <p className="text-xs tracking-extreme-editorial text-[#e6e2d7]/60 font-light">
              {t('label')}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                className={`flex flex-col items-center text-center ${
                  index < metrics.length - 1
                    ? 'lg:border-r hairline-divider'
                    : ''
                }`}
                initial={{ opacity: 0 }}
                animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                }}
              >
                <div className="text-4xl md:text-5xl lg:text-6xl font-light text-[#e6e2d7] mb-3">
                  {metric.value}
                </div>
                <div className="text-xs tracking-wide-editorial text-[#e6e2d7]/50 font-light">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <p className="text-xs text-[#e6e2d7]/40 font-light italic">
              {t('footnote')}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
