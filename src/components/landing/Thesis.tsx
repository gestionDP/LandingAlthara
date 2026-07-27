'use client';

/**
 * 03 · Tesis — ALT-WEB-2026-01 §04.C.
 *
 * Por qué el off-market y qué compra la firma. Contiene el ÚNICO AFORISMO
 * del site; no se repite en ninguna otra sección. Sin punto final decorativo.
 *
 * Ticket por operación y horizonte de rotación se leen de figures.json y solo
 * se pintan cuando dejan de ser `null` (pendientes de validación).
 */
import { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { THESIS_DATA, t as pick, type Locale } from '@/lib/figures';
import { MaskReveal, Reveal } from './motion';

export default function Thesis() {
  const t = useTranslations('landing.thesis');
  const locale = useLocale() as Locale;
  const reduce = useReducedMotion();
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ['start end', 'end start'] });
  const yImg = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  const buys: { label: string; value: string }[] = [
    { label: t('situationsLabel'), value: t('situations') },
    { label: t('assetsLabel'), value: t('assets') },
  ];

  const ticket = pick(THESIS_DATA.ticket, locale);
  if (ticket) buys.push({ label: t('ticketLabel'), value: ticket });

  const horizon = pick(THESIS_DATA.horizon, locale);
  if (horizon) buys.push({ label: t('horizonLabel'), value: horizon });

  return (
    <section id="tesis" className="landing-surface scroll-mt-24">
      <div className="container-site py-24 md:py-36">
      <Reveal>
        <p className="label-mono text-[#c08552]">{t('label')}</p>
      </Reveal>

      {/* Único aforismo del site */}
      <h2 className="display-xl mt-8 text-3xl text-[#1c3742] md:text-6xl lg:text-7xl">
        <MaskReveal delay={0.05}><span className="block">{t('line1')}</span></MaskReveal>
        <MaskReveal delay={0.15}><span className="block">{t('line2')}</span></MaskReveal>
        <MaskReveal delay={0.25}><span className="block">{t('line3')}</span></MaskReveal>
      </h2>

      <Reveal delay={0.3}>
        <p className="mt-8 text-lg text-[#1c3742]/60 md:text-xl">{t('sub')}</p>
      </Reveal>

      <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12 md:gap-8">
        <div ref={imgRef} className="relative h-[46vh] overflow-hidden md:col-span-7 md:h-[64vh]">
          <motion.div className="absolute inset-[-10%_0]" style={reduce ? {} : { y: yImg }}>
            <Image
              src="/png/home.png"
              alt="Interior residencial con luz natural"
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </div>

        <div className="flex flex-col md:col-span-5">
          <Reveal delay={0.1} className="relative flex-1 min-h-[24vh] overflow-hidden">
            <Image
              src="/png/home2.png"
              alt="Detalle arquitectónico de una vivienda"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover transition-transform duration-700 hover:scale-[1.04]"
            />
          </Reveal>

          <div className="pt-8">
            <Reveal delay={0.15}>
              <p className="label-mono text-[#1c3742]/60">{t('buysTitle')}</p>
            </Reveal>
            <dl className="mt-5">
              {buys.map((b, i) => (
                <Reveal key={b.label} delay={0.18 + 0.05 * i}>
                  <div className="border-t border-[#1c3742]/12 py-4">
                    <dt className="font-montserrat text-sm font-bold text-[#1c3742]">{b.label}</dt>
                    <dd className="mt-1 text-base leading-relaxed text-[#1c3742]/70">{b.value}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
