"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { contactService, ContactFormData } from "@/lib/api";
import { useTranslations } from "next-intl";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const t = useTranslations("contactModal");
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
    userType: "comprador",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const result = await contactService.submitContactForm(formData);

    if (result.success) {
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        userType: "comprador",
      });
      setTimeout(() => {
        onClose();
        setSubmitStatus("idle");
      }, 2000);
    } else {
      setSubmitStatus("error");
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
          <div className="relative overflow-hidden">
            <Image
              src="/png/Hero.png"
              alt="Althara - Plataforma de inversión premium"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-althara-dark-blue/20"></div>
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="text-center text-white">
                <h2 className="text-4xl font-light mb-4">{t("joinTitle")}</h2>
                <p className="text-lg leading-relaxed opacity-90">
                  {t("description")}
                </p>
              </div>
            </div>
          </div>

          <div className="p-12 flex flex-col justify-center bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t("form.name")}
                  className="h-12"
                />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder={t("form.email")}
                  className="h-12"
                />
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("form.phone")}
                  className="h-12"
                />
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="h-12 w-full px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="comprador">Comprador</option>
                  <option value="vendedor">Vendedor</option>
                </select>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t("form.message")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {submitStatus === "success" && (
                <div className="p-3 bg-green-50 border border-green-200">
                  <p className="text-green-700 text-sm font-medium text-center">
                    {t("messages.success")}
                  </p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="p-3 bg-red-50 border border-red-200">
                  <p className="text-red-700 text-sm font-medium text-center">
                    {t("messages.error")}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-althara-primary hover:bg-althara-primary/90 text-white"
                >
                  {isSubmitting ? t("form.submitting") : t("form.submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
