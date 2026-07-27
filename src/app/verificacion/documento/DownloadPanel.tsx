'use client';

/**
 * Capa 1 — descarga del documento tras confirmar la dirección de correo.
 * El token viaja en la URL del correo; el PDF lo sirve el backend, que
 * registra cada descarga antes de entregarlo.
 */
import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AS_OF, VERIFICATION, t as pick, type Locale } from '@/lib/figures';

export default function DownloadPanel({ token }: { token: string }) {
  const t = useTranslations('verification');
  const locale = useLocale() as Locale;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/verification/download?token=${encodeURIComponent(token)}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? 'generic');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${VERIFICATION.ref}-${VERIFICATION.version}-${locale}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('generic');
    } finally {
      setBusy(false);
    }
  };

  const known = ['invalid_token', 'not_found', 'expired', 'revoked', 'not_confirmed', 'document_not_ready', 'generic'];

  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#1c3742]">
      <div className="container-site max-w-2xl py-16 md:py-24">
        <Link href="/" className="label-mono link-underline text-[#1c3742]/50 hover:text-[#1c3742]">
          {t('back')}
        </Link>

        <p className="label-mono mt-8 text-[#c08552]">{t('label')}</p>
        <h1 className="display-xl mt-4 text-3xl md:text-4xl">{t('download.title')}</h1>
        <p className="mt-6 text-base leading-relaxed text-[#1c3742]/75 md:text-lg">
          {t('download.text')}
        </p>

        <p className="mt-6 text-xs text-[#1c3742]/45">
          {VERIFICATION.ref} · {VERIFICATION.version} · {pick(AS_OF, locale)}
        </p>

        <button
          onClick={handleDownload}
          disabled={busy}
          className="label-mono mt-10 bg-[#1c3742] px-8 py-4 text-[#e6e2d7] transition-colors duration-300 hover:bg-[#c08552] disabled:opacity-60"
        >
          {t('download.cta')}
        </button>

        <p className="mt-4 text-xs text-[#1c3742]/45">{t('download.logged')}</p>

        {error && (
          <p className="mt-8 border border-[#c08552]/50 bg-[#c08552]/5 px-4 py-3 text-sm text-[#1c3742]/80">
            {error === 'document_not_ready'
              ? t('download.notReady')
              : t(`errors.${known.includes(error) ? error : 'generic'}`)}
          </p>
        )}
      </div>
    </main>
  );
}
