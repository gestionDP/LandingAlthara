'use client';

/**
 * Sección Portal de inversores: presenta el data room privado y lleva a
 * /dataroom. Tarjeta con vídeo, candado y features con reveal escalonado.
 */
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MaskReveal, Reveal, EASE } from './motion';

const FEATURES = [0, 1, 2, 3] as const;

export default function Portal() {
  const t = useTranslations('landing.portal');
  const reduce = useReducedMotion();

  return (
    <section id="portal" className="container-site scroll-mt-24 py-24 md:py-36">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-6">
          <Reveal>
            <p className="label-mono text-[#c08552]">{t('label')}</p>
          </Reveal>
          <h2 className="display-xl mt-6 text-4xl text-[#1c3742] md:text-6xl lg:text-7xl">
            <MaskReveal><span className="block">{t('title1')}</span></MaskReveal>
            <MaskReveal delay={0.12}>
              <span className="block">
                {t('title2')}
                <span className="text-[#c08552]">.</span>
              </span>
            </MaskReveal>
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-[#1c3742]/70">{t('intro')}</p>
          </Reveal>

          <ul className="mt-10 space-y-5">
            {FEATURES.map((i) => (
              <motion.li
                key={i}
                initial={reduce ? {} : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: 0.08 * i, ease: EASE }}
                className="flex items-baseline gap-4 border-t border-[#1c3742]/10 pt-5"
              >
                <span className="label-mono shrink-0 text-[#c08552]">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="font-montserrat font-bold text-[#1c3742]">{t(`features.${i}.title`)}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#1c3742]/70">{t(`features.${i}.text`)}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          <Reveal delay={0.25} className="mt-12">
            <Link
              href="/dataroom"
              className="label-mono inline-block bg-[#c08552] px-8 py-4 text-[#102027] transition-colors duration-300 hover:bg-[#e6e2d7]"
            >
              {t('cta')}
            </Link>
            <p className="mt-4 text-xs text-[#1c3742]/40">{t('note')}</p>
          </Reveal>
        </div>

        {/* Visual: mockup del propio data room (filas de documentos, uno bloqueado) */}
        <div className="relative md:col-span-6">
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1, ease: EASE }}
            className="sticky top-28 overflow-hidden border border-[#1c3742]/10 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#1c3742]/10 px-5 py-3">
              <p className="label-mono text-[#1c3742]/60">{t('cardLabel')}</p>
              <span className="bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                NDA firmado
              </span>
            </div>
            <div className="divide-y divide-[#1c3742]/10 px-2 py-2">
              {[
                { label: 'PDF', bg: 'bg-red-50', color: 'text-red-700', name: 'Dossier del activo.pdf', meta: 'PDF · 4,2 MB', locked: false },
                { label: 'XLS', bg: 'bg-emerald-50', color: 'text-emerald-700', name: 'Modelo financiero.xlsx', meta: 'Excel · 1,8 MB', locked: false },
                { label: 'DOC', bg: 'bg-blue-50', color: 'text-blue-700', name: 'Due diligence legal.docx', meta: 'Word · 860 KB', locked: false },
                { label: 'NDA', bg: 'bg-[#1c3742]/5', color: 'text-[#1c3742]/50', name: 'Estructura societaria', meta: 'Requiere NDA', locked: true },
              ].map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={reduce ? {} : { opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.12, ease: EASE }}
                  className="flex items-center gap-3 px-3 py-3"
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center ${f.bg} ${f.color} text-[10px] font-bold uppercase tracking-wide`} aria-hidden>
                    {f.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${f.locked ? 'text-[#1c3742]/40' : 'text-[#1c3742]'}`}>{f.name}</p>
                    <p className="text-[11px] text-[#1c3742]/45">{f.meta}</p>
                  </div>
                  {!f.locked && (
                    <span className="border border-[#1c3742]/20 px-2.5 py-1 text-[10px] font-medium text-[#1c3742]/60">
                      Descargar
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="border-t border-[#1c3742]/10 bg-[#faf9f5] px-5 py-3">
              <p className="text-[11px] text-[#1c3742]/50">
                Cada descarga lleva marca de agua personal y queda registrada.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
