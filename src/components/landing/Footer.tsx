'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('landing.footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#e6e2d7]/10 bg-[#102027] py-12 text-[#e6e2d7]">
      <div className="container-site">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <Image
              src="/svg/logoFull.svg"
              alt="Althara"
              width={150}
              height={38}
              className="brightness-0 invert"
              style={{ height: 'auto' }}
            />
            <p className="mt-4 max-w-sm font-playfair text-lg italic text-[#e6e2d7]/70">
              {t('mantra')}
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm text-[#e6e2d7]/70">
            <a href="mailto:info@althara.es" className="link-underline w-fit hover:text-[#e6e2d7]">info@althara.es</a>
            <a href="tel:+34694428685" className="link-underline w-fit hover:text-[#e6e2d7]">+34 694 428 685</a>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            <a href="#tesis" className="label-mono link-underline text-[#e6e2d7]/60 hover:text-[#e6e2d7]">{t('thesis')}</a>
            <a href="#capas" className="label-mono link-underline text-[#e6e2d7]/60 hover:text-[#e6e2d7]">{t('layers')}</a>
            <a href="#metodo" className="label-mono link-underline text-[#e6e2d7]/60 hover:text-[#e6e2d7]">{t('method')}</a>
            <Link href="/dataroom" className="label-mono link-underline text-[#c08552] hover:text-[#e6e2d7]">{t('portal')}</Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#e6e2d7]/10 pt-6 text-xs text-[#e6e2d7]/40 md:flex-row md:justify-between">
          <p>© {year} Althara. {t('rights')}</p>
          <nav
            aria-label="Enlaces legales"
            className="flex flex-wrap gap-x-4 gap-y-1"
          >
            <Link href="/aviso-legal" className="hover:text-[#e6e2d7]">Aviso Legal</Link>
            <Link href="/politica-privacidad" className="hover:text-[#e6e2d7]">Política de Privacidad</Link>
            <Link href="/politica-cookies" className="hover:text-[#e6e2d7]">Política de Cookies</Link>
            <Link href="/condiciones-uso" className="hover:text-[#e6e2d7]">Condiciones de Uso</Link>
          </nav>
          <p>{t('confidential')}</p>
        </div>
      </div>
    </footer>
  );
}
