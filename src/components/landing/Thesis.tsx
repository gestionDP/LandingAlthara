'use client';

/** Manifiesto: declaración editorial línea a línea con máscaras + imagen parallax. */
import { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MaskReveal, Reveal } from './motion';

export default function Thesis() {
  const t = useTranslations('landing.thesis');
  const reduce = useReducedMotion();
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ['start end', 'end start'] });
  const yImg = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section id="tesis" className="container-site scroll-mt-24 py-24 md:py-36">
      <Reveal>
        <p className="label-mono text-[#c08552]">{t('label')}</p>
      </Reveal>

      <h2 className="display-xl mt-8 text-4xl text-[#1c3742] md:text-7xl lg:text-8xl">
        <MaskReveal delay={0.05}><span className="block">{t('line1')}</span></MaskReveal>
        <MaskReveal delay={0.15}><span className="block text-[#1c3742]/45">{t('line2')}</span></MaskReveal>
        <MaskReveal delay={0.25}>
          <span className="block">
            {t('line3')}
            <span className="text-[#c08552]">.</span>
          </span>
        </MaskReveal>
      </h2>

      <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12 md:gap-8">
        {/* Imagen grande con parallax */}
        <div ref={imgRef} className="relative h-[46vh] overflow-hidden md:col-span-7 md:h-[64vh]">
          <motion.div className="absolute inset-[-10%_0]" style={reduce ? {} : { y: yImg }}>
            <Image
              src="/jpg/34.png"
              alt="Butaca de cuero con luz natural"
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </div>

        <div className="flex flex-col justify-between gap-8 md:col-span-5">
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-[#1c3742]/80 md:text-xl">{t('p1')}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-lg leading-relaxed text-[#1c3742]/60 md:text-xl">{t('p2')}</p>
          </Reveal>
          <Reveal delay={0.25} className="relative hidden h-48 overflow-hidden md:block lg:h-60">
            <Image
              src="/jpg/35.png"
              alt="Puerta clásica de madera"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover transition-transform duration-700 hover:scale-[1.04]"
            />
          </Reveal>
          <Reveal delay={0.3}>
            <p className="font-playfair text-2xl italic leading-snug text-[#1c3742] md:text-3xl">
              {t('quote')}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
