'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { contactService, ContactFormData } from '@/lib/api';
import { useTranslations } from 'next-intl';

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
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

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
      setFormData({
        email: '',
        phone: '',
      });
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
      }, 2000);
    } else {
      setSubmitStatus('error');
    }

    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const FormContent = ({ showLogo = false }: { showLogo?: boolean }) => (
    <div className="space-y-6">
      {showLogo && (
        <div className="flex justify-center mb-6">
          <Image
            src="/svg/logo.svg"
            alt="Althara Logo"
            width={200}
            height={50}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder={t('form.email')}
            className="h-12"
          />
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t('form.phone')}
            className="h-12"
          />
        </div>

        {submitStatus === 'success' && (
          <div className="p-3 bg-green-50 border border-green-200">
            <p className="text-green-700 text-sm font-medium text-center">
              {t('messages.success')}
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200">
            <p className="text-red-700 text-sm font-medium text-center">
              {t('messages.error')}
            </p>
          </div>
        )}

        <div className="pt-6 pb-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-[#e6e2d7]"
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
        <BottomSheetContent className="pb-8">
          <FormContent showLogo={true} />
        </BottomSheetContent>
      </BottomSheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">{t('title')}</DialogTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
          <div className="relative ">
            <Image
              src="/jpg/4.jpg"
              alt="Althara - Plataforma de inversión premium"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-althara-dark-blue/20"></div>
            <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-12">
              <div className="text-center text-[#e6e2d7] px-6 lg:px-8">
                <h2 className="text-3xl lg:text-4xl font-light mb-4 leading-tight">
                  {t('joinTitle')}
                </h2>
                <p className="text-base lg:text-lg leading-relaxed opacity-90">
                  {t('description')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12 flex flex-col justify-center bg-althara-dark-blue">
            <FormContent showLogo={true} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
