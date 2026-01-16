'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SPEED = 1.9;

const makeVariants = (reduce: boolean) => {
  if (reduce) {
    return {
      wrap: { hidden: { opacity: 0 }, show: { opacity: 1 } },
      title: { hidden: { opacity: 0 }, show: { opacity: 1 } },
      sub: { hidden: { opacity: 0 }, show: { opacity: 1 } },
    };
  }

  return {
    wrap: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.085 * SPEED,
          delayChildren: 0.02 * SPEED,
        },
      },
    },
    title: {
      hidden: {
        opacity: 0,
        y: 34,
        filter: 'blur(16px)',
        clipPath: 'inset(100% 0% 0% 0% round 18px)',
      },
      show: {
        opacity: 1,
        y: [34, -2, 0],
        filter: 'blur(0px)',
        clipPath: 'inset(0% 0% 0% 0% round 18px)',
        transition: { duration: 1.05 * SPEED, ease: EASE },
      },
    },
    sub: {
      hidden: {
        opacity: 0,
        y: 18,
        filter: 'blur(12px)',
        clipPath: 'inset(100% 0% 0% 0% round 12px)',
      },
      show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        clipPath: 'inset(0% 0% 0% 0% round 12px)',
        transition: { duration: 0.75 * SPEED, ease: EASE },
      },
    },
  };
};


export default function ManifestoStatement() {
  const t = useTranslations('manifesto');
  const reduce = useReducedMotion();
  const v = makeVariants(!!reduce);

  return (
    <section className="relative bg-[#0a0a0a] min-h-screen w-full overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/videos/3.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-[#0a0a0a]/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/55 via-transparent to-[#0a0a0a]/70" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e6e2d7' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 right-0 top-0 h-px bg-[#e6e2d7]/10" />
        <div className="absolute left-0 right-0 bottom-0 h-px bg-[#e6e2d7]/10" />
      </div>

      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 relative z-10 w-full">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            variants={v.wrap}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.45 }}
            style={{ willChange: 'transform, opacity, filter, clip-path' }}
            className="transform-gpu"
          >
            <motion.h2
              variants={v.title}
              className="font-montserrat text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium text-[#e6e2d7] leading-[1.05] mb-8"
            >
              {t('statement')}
            </motion.h2>

            {t('subline') && (
              <motion.p
                variants={v.sub}
                className="text-sm md:text-base text-[#e6e2d7]/60 font-light tracking-wide-editorial"
              >
                {t('subline')}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: 'blur(6px)' }}
            whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.22 }}
            className="mt-10 flex justify-center"
            style={{ willChange: 'transform, opacity, filter' }}
          >
            <div className="h-px w-24 bg-[#e6e2d7]/18" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}