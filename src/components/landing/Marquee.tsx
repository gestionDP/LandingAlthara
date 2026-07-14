'use client';

/**
 * Franja editorial de transición (tesis → qué hacemos): imagen a sangre de
 * fondo con las palabras clave en modo "fantasma" (semitransparentes y en
 * contorno) desplazándose en direcciones opuestas por encima.
 */
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function Marquee({ className = '' }: { className?: string }) {
  const t = useTranslations('landing.marquee');
  const words = [t('w1'), t('w2'), t('w3'), t('w4'), t('w5')];
  const row = [...words, ...words];

  return (
    <div className={`relative overflow-hidden bg-[#1c3742] py-12 md:py-16 ${className}`}>
      {/* Imagen de fondo a sangre */}
      <Image
        src="/png/banner.png"
        alt=""
        fill
        aria-hidden
        sizes="100vw"
        className="object-cover"
      />
      {/* Velo para que las palabras fantasma siempre lean sobre la imagen */}
      <div className="absolute inset-0 bg-[#102027]/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#102027]/70 via-transparent to-[#102027]/70" />

      {/* Palabras transparentes por encima */}
      <div className="relative z-10" aria-hidden>
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
    </div>
  );
}
