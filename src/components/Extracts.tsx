'use client';

import { useTranslations } from 'next-intl';
import { useReveal } from '@/hooks/useReveal';
import { Carousel } from '@/components/ui/carousel';
import { motion } from 'framer-motion';

export default function Extracts() {
  const t = useTranslations('extracts');
  const { ref, isRevealed } = useReveal({ threshold: 0.2 });

  const quotes = [
    {
      text: t('quote1.text'),
      attribution: t('quote1.attribution'),
    },
    {
      text: t('quote2.text'),
      attribution: t('quote2.attribution'),
    },
    {
      text: t('quote3.text'),
      attribution: t('quote3.attribution'),
    },
  ];

  const carouselItems = quotes.map((quote, index) => (
    <div key={index} className="space-y-6 p-6 lg:p-8 border border-[#e6e2d7]/10 hover:border-[#e6e2d7]/20 transition-all duration-200">
      <p className="text-base md:text-lg text-[#e6e2d7]/80 font-light leading-relaxed">
        {quote.text}
      </p>
      <div className="pt-4 border-t hairline-divider">
        <p className="text-xs tracking-wide-editorial text-[#e6e2d7]/40 font-light">
          {quote.attribution}
        </p>
      </div>
    </div>
  ));

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-24 lg:py-32 bg-[#102027]"
    >
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-16">
            <p className="text-xs tracking-extreme-editorial text-[#e6e2d7]/60 font-light">
              {t('label')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Carousel items={carouselItems} showArrows={true} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
