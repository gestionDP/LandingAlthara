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

const navLinks = [
  { href: '#como-funciona', key: 'menu.howItWorks' },
  { href: '#que-es', key: 'menu.whatIs' },
  { href: '#nuestro-proceso', key: 'menu.process' },
  { href: '#para-quien-es', key: 'menu.whoIsItFor' },
  { href: '#por-que-confiar', key: 'menu.whyTrust' },
  { href: '#casos-de-exito', key: 'menu.successCases' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrollEffect(50);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const t = useTranslations('navbar');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map((link) => link.href.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('nav')) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
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

  useEffect(() => {
    if (isMenuOpen) {
      const handleScroll = () => setIsMenuOpen(false);
      window.addEventListener('scroll', handleScroll, { once: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMenuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-althara-dark-blue backdrop-blur-md shadow-lg border-b border-althara-dark-blue'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            href="#"
            className="flex-shrink-0 z-10 transition-transform duration-300 hover:scale-105"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Image
              src="/svg/logoFull.svg"
              alt="Althara Logo"
              width={180}
              height={45}
              className={` transition-all duration-500 ${
                isScrolled ? 'brightness-0 invert' : 'brightness-0 invert'
              }`}
              priority
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const sectionId = link.href.substring(1);
              const isActive = activeSection === sectionId;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 group ${
                    isScrolled
                      ? isActive
                        ? 'text-[#e6e2d7]'
                        : 'text-[#e6e2d7]/80 hover:text-[#e6e2d7]'
                      : isActive
                      ? 'text-[#e6e2d7]'
                      : 'text-[#e6e2d7]/90 hover:text-[#e6e2d7]'
                  }`}
                >
                  <span className="relative z-10">{t(link.key)}</span>
                  {isActive && (
                    <span
                      className={`absolute inset-0 transition-all duration-300 ${
                        isScrolled ? 'bg-[#e6e2d7]/10' : 'bg-[#e6e2d7]/10'
                      }`}
                    />
                  )}
                  <span
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      isScrolled ? 'bg-[#e6e2d7]/10' : 'bg-[#e6e2d7]/5'
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            <LanguageSwitcher isScrolled={isScrolled} />
            <Button
              onClick={openModal}
              className={`h-10 px-6 font-medium transition-all duration-300 ${
                isScrolled
                  ? 'bg-althara-primary text-[#e6e2d7] hover:bg-althara-primary/90 border border-[#e6e2d7]/30 shadow-md hover:shadow-lg'
                  : 'bg-[#e6e2d7]/10 text-[#e6e2d7] backdrop-blur-sm border border-[#e6e2d7]/20 hover:bg-[#e6e2d7]/20'
              }`}
            >
              {t('contactUs')}
            </Button>
          </div>

          <div className="lg:hidden flex items-center space-x-2">
            <LanguageSwitcher isScrolled={isScrolled} />
            <Button
              onClick={toggleMenu}
              variant="ghost"
              size="icon"
              className={`h-10 w-10 transition-all duration-300 ${
                isScrolled
                  ? 'text-[#e6e2d7] hover:bg-[#e6e2d7]/10'
                  : 'text-[#e6e2d7] hover:bg-[#e6e2d7]/10'
              }`}
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

        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-1 border-t border-[#e6e2d7]/20 mt-2">
            {navLinks.map((link) => {
              const sectionId = link.href.substring(1);
              const isActive = activeSection === sectionId;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#e6e2d7]/10 text-[#e6e2d7]'
                      : 'text-[#e6e2d7]/80 hover:bg-[#e6e2d7]/10 hover:text-[#e6e2d7]'
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
            <Button
              onClick={() => {
                openModal();
                setIsMenuOpen(false);
              }}
              className="w-full mt-4 mx-4 bg-althara-dark-blue text-[#e6e2d7] hover:bg-althara-dark-blue/90"
            >
              {t('contactUs')}
            </Button>
          </div>
        </div>
      </div>

      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </nav>
  );
}
