'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ContactModal from '../ContactModal';
import LanguageSwitcher from '../LanguageSwitcher';
import { useScrollEffect } from '@/hooks/useScrollEffect';
import { EASE } from './motion';

const LINKS = [
  { href: '#tesis', key: 'thesis' },
  { href: '#capas', key: 'layers' },
  { href: '#metodo', key: 'method' },
  { href: '#portal', key: 'portal' },
] as const;

/** Track which section is currently in viewport */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the largest intersection ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-30% 0px -30% 0px', threshold: [0, 0.25, 0.5] },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

const SECTION_IDS = ['tesis', 'capas', 'metodo', 'portal'];

export default function Nav() {
  const t = useTranslations('landing.nav');
  const isScrolled = useScrollEffect(40);
  const activeSection = useActiveSection(SECTION_IDS);
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          isScrolled ? 'bg-[#f4f2ec]/90 backdrop-blur-md border-b border-[#1c3742]/10' : 'bg-transparent'
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

          <div className="hidden items-center gap-8 lg:flex">
            {LINKS.map((l) => {
              const sectionId = l.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={l.key}
                  href={l.href}
                  className={`label-mono transition-colors duration-300 ${
                    isActive
                      ? isScrolled
                        ? 'text-[#1c3742] border-b border-[#c08552]'
                        : 'text-[#e6e2d7] border-b border-[#c08552]'
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
            <Link
              href="/dataroom"
              className={`label-mono border px-5 py-2.5 transition-colors duration-300 ${isScrolled ? 'border-[#1c3742]/40 text-[#1c3742] hover:bg-[#1c3742] hover:text-[#e6e2d7]' : 'border-[#e6e2d7]/60 text-[#e6e2d7] hover:bg-[#e6e2d7] hover:text-[#102027]'}`}
            >
              {t('portalCta')}
            </Link>
            <button
              onClick={() => setModal(true)}
              className={`label-mono px-5 py-2.5 transition-colors duration-300 ${isScrolled ? 'bg-[#1c3742] text-[#e6e2d7] hover:bg-[#e6e2d7] hover:text-[#1c3742]' : 'bg-[#e6e2d7] text-[#102027] hover:bg-white hover:text-[#102027]'}`}
            >
              {t('access')}
            </button>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <LanguageSwitcher isScrolled={isScrolled} />
            <button onClick={() => setOpen(!open)} aria-label="Menú" className={`p-2 ${isScrolled && !open ? 'text-[#1c3742]' : 'text-[#e6e2d7]'}`}>
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
            className="fixed inset-0 z-40 flex flex-col justify-between bg-[#f4f2ec] px-6 pb-10 pt-28 lg:hidden"
          >
            <div className="space-y-2">
              {LINKS.map((l, i) => {
                const sectionId = l.href.replace('#', '');
                const isActive = activeSection === sectionId;
                return (
                  <motion.a
                    key={l.key}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.08 * i, ease: EASE }}
                    className={`display-xl block text-4xl ${isActive ? 'text-[#c08552]' : 'text-[#1c3742]'}`}
                  >
                    {t(l.key)}
                    <span className="text-[#c08552]">.</span>
                  </motion.a>
                );
              })}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col gap-3"
            >
              <Link
                href="/dataroom"
                onClick={() => setOpen(false)}
                className="label-mono border border-[#1c3742]/40 px-6 py-4 text-center text-[#1c3742]"
              >
                {t('portalCta')}
              </Link>
              <button
                onClick={() => { setModal(true); setOpen(false); }}
                className="label-mono bg-[#1c3742] px-6 py-4 text-[#e6e2d7]"
              >
                {t('access')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContactModal isOpen={modal} onClose={() => setModal(false)} />
    </>
  );
}
