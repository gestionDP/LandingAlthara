'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { contactService, ContactFormData } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

const inputClass =
  'h-12 w-full rounded-none border border-[#e6e2d7]/20 bg-transparent px-4 text-[#e6e2d7] placeholder:text-[#e6e2d7]/40 font-light tracking-editorial text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e6e2d7]/40 focus-visible:border-[#e6e2d7]/40 transition-colors';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const t = useTranslations('contactModal');
  const [formData, setFormData] = useState<ContactFormData>({
    email: '',
    phone: '',
  });
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
    const result = await contactService.submitContactForm(formData);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const FormContent = ({ showLogo = false }: { showLogo?: boolean }) => (
    <div className="space-y-8">
      

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <p className="text-xs tracking-[0.28em] text-[#e6e2d7]/50 font-light">
            {t('form.email')}
          </p>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="nombre@empresa.com"
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs tracking-[0.28em] text-[#e6e2d7]/50 font-light">
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

        <AnimatePresence mode="wait">
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-3 px-4 border border-[#e6e2d7]/25 bg-[#e6e2d7]/5"
            >
              <p className="text-sm text-[#e6e2d7]/90 font-light text-center">
                {t('messages.success')}
              </p>
            </motion.div>
          )}
          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-3 px-4 border border-[#e6e2d7]/20 bg-[#e6e2d7]/5"
            >
              <p className="text-sm text-[#e6e2d7]/80 font-light text-center">
                {t('messages.error')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-none font-light tracking-editorial text-sm bg-[#e6e2d7] text-[#0a0a0a] hover:bg-[#e6e2d7]/90 border-0 transition-colors"
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
        <BottomSheetContent className="bg-[#0a0a0a] border-[#e6e2d7]/10 pb-10 pt-8 px-6">
          <p className="text-xs tracking-extreme-editorial text-[#e6e2d7]/60 font-light mb-6">
            SOLICITUD
          </p>
          <FormContent showLogo />
        </BottomSheetContent>
      </BottomSheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl w-full max-h-[90vh] overflow-hidden p-0 gap-0 border border-[#e6e2d7]/15 bg-[#0a0a0a] [&>button]:text-[#e6e2d7] [&>button]:opacity-70 [&>button]:hover:opacity-100 [&>button]:ring-offset-[#0a0a0a] [&>button]:focus-visible:ring-[#e6e2d7]/40"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{t('title')}</DialogTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
          {/* Panel izquierdo: imagen + copy */}
          <div className="relative min-h-[240px] lg:min-h-0">
            <Image
              src="/jpg/4.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/40 to-[#0a0a0a]/20" />
            <div className="absolute inset-0 flex items-end p-8 lg:p-10">
              <div className="space-y-3">
              
                <h2 className="text-2xl lg:text-3xl font-playfair font-normal text-[#e6e2d7] leading-tight max-w-sm">
                  {t('joinTitle')}
                </h2>
                <p className="text-sm lg:text-base text-[#e6e2d7]/80 font-light leading-relaxed max-w-sm">
                  {t('description')}
                </p>
              </div>
            </div>
          </div>

          {/* Panel derecho: formulario */}
          <div className="flex flex-col justify-center p-8 lg:p-10 lg:pl-12 bg-[#0a0a0a] border-t lg:border-t-0 lg:border-l border-[#e6e2d7]/10">
          
            <FormContent showLogo />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
