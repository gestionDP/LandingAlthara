'use client';

/**
 * Capa 1 — formulario del documento de verificación. ALT-WEB-2026-01 §06.
 *
 * Captura nombre, email y teléfono con finalidad declarada (entrega del
 * documento y posible contacto comercial) y dispara el doble opt-in. El PDF
 * no se entrega aquí: solo tras confirmar la dirección de correo.
 */
import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AS_OF, VERIFICATION, t as pick, type Locale } from '@/lib/figures';

const inputClass =
  'h-12 w-full rounded-none border border-[#1c3742]/25 bg-transparent px-4 text-sm font-light text-[#1c3742] transition-colors placeholder:text-[#1c3742]/35 focus-visible:border-[#1c3742]/60 focus-visible:outline-none';

const CONTAINS = [0, 1, 2, 3] as const;

export default function VerificationForm({ initialError }: { initialError?: string }) {
  const t = useTranslations('verification');
  const locale = useLocale() as Locale;

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(initialError ?? null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      const res = await fetch('/api/verification/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale, consent: true }),
      });
      if (!res.ok) throw new Error('request_failed');
      setStatus('sent');
    } catch {
      setStatus('error');
      setError('generic');
    }
  };

  const errorMessage = (key: string) => {
    const known = [
      'invalid_token',
      'not_found',
      'expired',
      'revoked',
      'not_confirmed',
      'document_not_ready',
      'generic',
    ];
    return t(`errors.${known.includes(key) ? key : 'generic'}`);
  };

  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#1c3742]">
      <div className="container-site max-w-3xl py-16 md:py-24">
        <Link href="/" className="label-mono link-underline text-[#1c3742]/50 hover:text-[#1c3742]">
          {t('back')}
        </Link>

        <p className="label-mono mt-8 text-[#c08552]">{t('label')}</p>
        <h1 className="display-xl mt-4 text-3xl md:text-4xl">{t('title')}</h1>
        <p className="mt-8 text-base leading-relaxed text-[#1c3742]/75 md:text-lg">{t('intro')}</p>

        <section className="mt-12">
          <h2 className="label-mono border-b border-[#1c3742]/20 pb-3 text-[#1c3742]/60">
            {t('containsTitle')}
          </h2>
          <ul className="mt-6 space-y-3">
            {CONTAINS.map((i) => (
              <li key={i} className="flex gap-4 text-base leading-relaxed text-[#1c3742]/75">
                <span className="label-mono shrink-0 pt-1 text-[#c08552]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{t(`contains.${i}`)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-[#1c3742]/45">
            {VERIFICATION.ref} · {VERIFICATION.version} · {pick(AS_OF, locale)}
          </p>
        </section>

        <section className="mt-14 border-t border-[#1c3742]/20 pt-10">
          {status === 'sent' ? (
            <div className="border border-[#1c3742]/25 bg-[#1c3742]/[0.03] p-8">
              <h2 className="font-montserrat text-xl font-bold">{t('sent.title')}</h2>
              <p className="mt-3 text-base leading-relaxed text-[#1c3742]/75">{t('sent.text')}</p>
            </div>
          ) : (
            <>
              <h2 className="label-mono text-[#1c3742]/60">{t('form.title')}</h2>

              <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-6">
                <div className="space-y-1">
                  <label htmlFor="v-name" className="label-mono block text-[#1c3742]/50">
                    {t('form.name')}
                  </label>
                  <input
                    id="v-name"
                    type="text"
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t('form.namePlaceholder')}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="v-email" className="label-mono block text-[#1c3742]/50">
                    {t('form.email')}
                  </label>
                  <input
                    id="v-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t('form.emailPlaceholder')}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="v-phone" className="label-mono block text-[#1c3742]/50">
                    {t('form.phone')}
                  </label>
                  <input
                    id="v-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+34 600 00 00 00"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="v-consent"
                    className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-[#1c3742]/70"
                  >
                    <input
                      id="v-consent"
                      type="checkbox"
                      required
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#1c3742]"
                    />
                    <span>
                      {t('consent.text')}{' '}
                      <a
                        href="/politica-privacidad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                      >
                        {t('consent.link')}
                      </a>{' '}
                      *
                    </span>
                  </label>
                  <p className="text-[11px] leading-relaxed text-[#1c3742]/45">
                    {t('consent.notice')}
                  </p>
                </div>

                {error && (
                  <p className="border border-[#c08552]/50 bg-[#c08552]/5 px-4 py-3 text-sm text-[#1c3742]/80">
                    {errorMessage(error)}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="label-mono w-full bg-[#1c3742] px-8 py-4 text-[#e6e2d7] transition-colors duration-300 hover:bg-[#c08552] disabled:opacity-60"
                >
                  {status === 'sending' ? t('form.submitting') : t('form.submit')}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
