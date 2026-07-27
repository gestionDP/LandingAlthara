'use client';

/**
 * Pie — ALT-WEB-2026-01 §03 y §04.I.
 *
 * Sin aforismo («El mercado visible es la punta del iceberg» se elimina) y
 * sin repetir la escasez. El acceso de inversores existentes es aquí un
 * ENLACE DE TEXTO a crm.althara.es, nunca un botón.
 *
 * La entidad jurídica no aparece en la capa visible: solo en el aviso legal,
 * el documento de verificación y las capas de acceso.
 */
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('landing.footer');
  const tAccess = useTranslations('landing.access');
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
            <a
              href={`mailto:${tAccess('email')}`}
              className="link-underline mt-6 block w-fit text-sm text-[#e6e2d7]/70 hover:text-[#e6e2d7]"
            >
              {tAccess('email')}
            </a>
          </div>

          <nav aria-label={t('sections')} className="flex flex-wrap gap-x-8 gap-y-3">
            <a
              href="#tesis"
              className="label-mono link-underline text-[#e6e2d7]/60 hover:text-[#e6e2d7]"
            >
              {t('thesis')}
            </a>
            <a
              href="#proceso"
              className="label-mono link-underline text-[#e6e2d7]/60 hover:text-[#e6e2d7]"
            >
              {t('process')}
            </a>
            <a
              href="#infraestructura"
              className="label-mono link-underline text-[#e6e2d7]/60 hover:text-[#e6e2d7]"
            >
              {t('infrastructure')}
            </a>
            <a
              href="#analisis"
              className="label-mono link-underline text-[#e6e2d7]/60 hover:text-[#e6e2d7]"
            >
              {t('research')}
            </a>
            <Link
              href="/metodologia"
              className="label-mono link-underline text-[#e6e2d7]/60 hover:text-[#e6e2d7]"
            >
              {t('methodology')}
            </Link>
            {/* §04.H: el documento de verificación puede solicitarse desde
                cualquier página del site. */}
            <Link
              href="/verificacion"
              className="label-mono link-underline text-[#e6e2d7]/60 hover:text-[#e6e2d7]"
            >
              {t('verification')}
            </Link>
          </nav>

          {/* Acceso de inversores existentes: enlace de texto, nunca botón */}
          <a
            href="https://crm.althara.es"
            className="label-mono link-underline w-fit text-[#c08552] hover:text-[#e6e2d7]"
          >
            {t('investorAccess')}
          </a>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#e6e2d7]/10 pt-6 text-xs text-[#e6e2d7]/40 md:flex-row md:justify-between">
          <p>
            © {year} Althara. {t('rights')}
          </p>
          <nav aria-label="Enlaces legales" className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/aviso-legal" className="hover:text-[#e6e2d7]">
              {t('legalNotice')}
            </Link>
            <Link href="/politica-privacidad" className="hover:text-[#e6e2d7]">
              {t('privacy')}
            </Link>
            <Link href="/politica-cookies" className="hover:text-[#e6e2d7]">
              {t('cookies')}
            </Link>
            <Link href="/condiciones-uso" className="hover:text-[#e6e2d7]">
              {t('terms')}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
