'use client';

/**
 * Solicitud de acceso — formulario detrás del único botón del site (09 · Acceso).
 *
 * ALT-WEB-2026-01 v1.2 §03: se elimina el selector de «tipo de inversión».
 * Alimentaba los seis perfiles de «Con quién trabajamos», que responden a una
 * lógica de segmentación de funnel y contradicen la tesis de firma cerrada.
 *
 * §08: el copy del modal y el aviso de privacidad se sirven traducidos —
 * ES y EN con paridad total, sin literales incrustados.
 */
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { contactService, ContactFormData } from '@/lib/api';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

const inputClass =
  'h-12 w-full rounded-none border border-[#e6e2d7]/20 bg-transparent px-4 text-[#e6e2d7] placeholder:text-[#e6e2d7]/40 font-light tracking-editorial text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e6e2d7]/40 focus-visible:border-[#e6e2d7]/40 transition-colors';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const t = useTranslations('contactModal');
  const locale = useLocale() as 'es' | 'en';
  const [formData, setFormData] = useState<ContactFormData>({ email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    const result = await contactService.submitContactForm(formData, locale);
    if (result.success) {
      setSubmitStatus('success');
      setFormData({ email: '', phone: '' });
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
      }, 2200);
    } else {
      setSubmitStatus('error');
    }
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const FormContent = () => (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-light tracking-[0.28em] text-[#e6e2d7]/50">
            {t('form.email')}
          </p>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder={t('form.emailPlaceholder')}
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-light tracking-[0.28em] text-[#e6e2d7]/50">
            {t('form.phone')}
          </p>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+34 600 00 00 00"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="privacy-consent"
            className="flex cursor-pointer items-start gap-2 text-xs font-light text-[#e6e2d7]/70"
          >
            <input
              id="privacy-consent"
              name="privacyConsent"
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#e6e2d7]"
            />
            <span>
              {t('privacy.consentPre')}{' '}
              <a
                href="/politica-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-[#e6e2d7]"
              >
                {t('privacy.consentLink')}
              </a>{' '}
              *
            </span>
          </label>
          <p className="text-[11px] font-light leading-relaxed text-[#e6e2d7]/45">
            {t('privacy.notice')}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border border-[#e6e2d7]/25 bg-[#e6e2d7]/5 px-4 py-3"
            >
              <p className="text-center text-sm font-light text-[#e6e2d7]/90">
                {t('messages.success')}
              </p>
            </motion.div>
          )}
          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border border-[#e6e2d7]/20 bg-[#e6e2d7]/5 px-4 py-3"
            >
              <p className="text-center text-sm font-light text-[#e6e2d7]/80">
                {t('messages.error')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="tracking-editorial h-12 w-full rounded-none border-0 bg-[#e6e2d7] text-sm font-light text-[#102027] transition-colors hover:bg-[#e6e2d7]/90"
          >
            {isSubmitting ? t('form.submitting') : t('form.submit')}
          </Button>
        </div>
      </form>
    </div>
  );

  if (isMobile) {
    return (
      <BottomSheet open={isOpen} onOpenChange={onClose}>
        <BottomSheetContent className="border-[#e6e2d7]/10 bg-[#102027] px-6 pb-10 pt-8">
          <p className="tracking-extreme-editorial mb-6 text-xs font-light text-[#e6e2d7]/60">
            {t('requestLabel')}
          </p>
          <FormContent />
        </BottomSheetContent>
      </BottomSheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[90vh] w-full max-w-4xl gap-0 overflow-hidden border border-[#e6e2d7]/15 bg-[#102027] p-0 [&>button]:text-[#e6e2d7] [&>button]:opacity-70 [&>button]:ring-offset-[#102027] [&>button]:focus-visible:ring-[#e6e2d7]/40 [&>button]:hover:opacity-100"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{t('title')}</DialogTitle>
        <div className="grid min-h-[480px] grid-cols-1 lg:grid-cols-2">
          <div className="relative min-h-[240px] lg:min-h-0">
            <Image
              src="/jpg/4.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102027]/90 via-[#102027]/40 to-[#102027]/20" />
            <div className="absolute inset-0 flex items-end p-8 lg:p-10">
              <div className="space-y-3">
                <h2 className="max-w-sm font-playfair text-2xl font-normal leading-tight text-[#e6e2d7] lg:text-3xl">
                  {t('joinTitle')}
                </h2>
                <p className="max-w-sm text-sm font-light leading-relaxed text-[#e6e2d7]/80 lg:text-base">
                  {t('description')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center border-t border-[#e6e2d7]/10 bg-[#102027] p-8 lg:border-l lg:border-t-0 lg:p-10 lg:pl-12">
            <FormContent />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
