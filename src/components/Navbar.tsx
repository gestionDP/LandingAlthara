'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ContactModal from './ContactModal';
import { Button } from '@/components/ui/button';
import { useScrollEffect } from '@/hooks/useScrollEffect';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { durations } from '@/lib/animations';

const navLinks = [
  { href: '#dossiers', key: 'menu.dossiers' },
  { href: '#signals', key: 'menu.signals' },
  { href: '#method', key: 'menu.method' },
  { href: '#access', key: 'menu.access' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrollEffect(50);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslations('navbar');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#e6e2d7]/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link
              href="#"
              className="flex-shrink-0 z-10 transition-transform duration-200 hover:scale-105"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setIsMenuOpen(false);
              }}
            >
              <Image
                src="/svg/logoFull.svg"
                alt="Althara"
                width={120}
                height={30}
                className="brightness-0 invert"
                priority
              />
            </Link>

          
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-xs text-[#e6e2d7]/40 tracking-wide-editorial font-light">
                <span className="hidden xl:inline">
                  {t('microcopy.private')}
                </span>
              </div>

              <LanguageSwitcher isScrolled={isScrolled} />

              <Button
                onClick={openModal}
                className="h-10 px-6 font-light tracking-editorial text-sm bg-transparent text-[#e6e2d7] border border-[#e6e2d7]/30 hover:bg-[#e6e2d7]/10 hover:border-[#e6e2d7]/50 transition-all duration-200"
              >
                {t('requestAccess')}
              </Button>
            </div>

            <div className="lg:hidden flex items-center space-x-3">
              <LanguageSwitcher isScrolled={isScrolled} />
              <Button
                onClick={toggleMenu}
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-[#e6e2d7] hover:bg-[#e6e2d7]/10 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durations.overlay }}
            className="fixed inset-0 z-40 bg-[#102027] lg:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: durations.overlay,
                    delay: navLinks.length * 0.08,
                  }}
                  className="pt-8"
                >
                  <Button
                    onClick={() => {
                      openModal();
                      setIsMenuOpen(false);
                    }}
                    className="h-12 px-8 font-light tracking-editorial text-sm bg-transparent text-[#e6e2d7] border border-[#e6e2d7]/30 hover:bg-[#e6e2d7]/10 hover:border-[#e6e2d7]/50 transition-all duration-200"
                  >
                    {t('requestAccess')}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: durations.overlay,
                    delay: (navLinks.length + 1) * 0.08,
                  }}
                  className="pt-12 text-xs text-[#e6e2d7]/40 tracking-wide-editorial font-light text-center space-y-2"
                >
                  <div>{t('microcopy.private')}</div>
                  <div>{t('microcopy.curated')}</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
