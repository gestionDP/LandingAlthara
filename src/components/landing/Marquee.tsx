'use client';

/** Marquee fantasma: banda sólida con textos semitransparentes en direcciones opuestas. */
import { useTranslations } from 'next-intl';

export default function Marquee({ className = '' }: { className?: string }) {
  const t = useTranslations('landing.marquee');
  const words = [t('w1'), t('w2'), t('w3'), t('w4'), t('w5')];
  const row = [...words, ...words];

  return (
    <div className={`overflow-hidden bg-[#1c3742] py-10 md:py-14 ${className}`} aria-hidden>
      <div className="flex w-max animate-marquee gap-14 whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="ghost-solid display-xl text-6xl md:text-8xl">
            {w}
          </span>
        ))}
      </div>
      <div className="mt-2 flex w-max animate-marquee-reverse gap-14 whitespace-nowrap md:mt-4">
        {row.map((w, i) => (
          <span key={i} className="ghost-outline display-xl text-6xl md:text-8xl">
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}
