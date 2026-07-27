'use client';

/**
 * Navegación — ALT-WEB-2026-01 §01 y §08.
 *
 * SIN BOTONES: el único botón del site está en la sección 09 · Acceso, a la
 * que aquí se llega por ancla de texto como cualquier otra sección. El acceso
 * de inversores existentes vive en el pie, como enlace discreto a
 * crm.althara.es. Sin punto final decorativo en el menú móvil.
 */
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../LanguageSwitcher';
import { useScrollEffect } from '@/hooks/useScrollEffect';
import { EASE } from './motion';

const LINKS = [
  { href: '#tesis', key: 'thesis' },
  { href: '#proceso', key: 'process' },
  { href: '#infraestructura', key: 'infrastructure' },
  { href: '#colaboracion', key: 'partnerships' },
  { href: '#analisis', key: 'research' },
  { href: '#acceso', key: 'access' },
] as const;

const SECTION_IDS = LINKS.map((l) => l.href.replace('#', ''));

/** Marca la sección visible en el viewport. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -30% 0px', threshold: [0, 0.25, 0.5] },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export default function Nav() {
  const t = useTranslations('landing.nav');
  const isScrolled = useScrollEffect(40);
  const activeSection = useActiveSection(SECTION_IDS);
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          isScrolled
            ? 'border-b border-[#1c3742]/10 bg-[#f4f2ec]/90 backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <div className="container-site flex h-18 items-center justify-between py-4">
          <Link href="/" aria-label="Althara">
            <Image
              src="/svg/logoFull.svg"
              alt="Althara"
              width={118}
              height={30}
              priority
              loading="eager"
              className={isScrolled ? '' : 'brightness-0 invert'}
              style={{ height: 'auto' }}
            />
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {LINKS.map((l) => {
              const isActive = activeSection === l.href.replace('#', '');
              return (
                <a
                  key={l.key}
                  href={l.href}
                  className={`label-mono transition-colors duration-300 ${
                    isActive
                      ? isScrolled
                        ? 'border-b border-[#c08552] text-[#1c3742]'
                        : 'border-b border-[#c08552] text-[#e6e2d7]'
                      : isScrolled
                        ? 'text-[#1c3742]/70 hover:text-[#1c3742]'
                        : 'text-[#e6e2d7]/70 hover:text-[#e6e2d7]'
                  }`}
                >
                  {t(l.key)}
                </a>
              );
            })}
            <LanguageSwitcher isScrolled={isScrolled} />
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <LanguageSwitcher isScrolled={isScrolled} />
            <button
              onClick={() => setOpen(!open)}
              aria-label={t('menu')}
              className={`p-2 ${isScrolled && !open ? 'text-[#1c3742]' : 'text-[#e6e2d7]'}`}
            >
              {open ? <X className="h-6 w-6 text-[#1c3742]" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-40 flex flex-col justify-start gap-2 bg-[#f4f2ec] px-6 pb-10 pt-28 lg:hidden"
          >
            {LINKS.map((l, i) => {
              const isActive = activeSection === l.href.replace('#', '');
              return (
                <motion.a
                  key={l.key}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.06 * i, ease: EASE }}
                  className={`display-xl block text-3xl ${isActive ? 'text-[#c08552]' : 'text-[#1c3742]'}`}
                >
                  {t(l.key)}
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
