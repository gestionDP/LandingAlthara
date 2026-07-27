/**
 * Envío de la solicitud de acceso (09 · Acceso).
 *
 * ALT-WEB-2026-01 v1.2 §03: se retira `investorType`. Alimentaba los seis
 * perfiles de segmentación que el documento elimina.
 *
 * §04.I: la solicitud ya no sale a Formspree. Va a `/api/access-request`, que
 * la registra en la misma base de datos y con la misma auditoría que el resto,
 * de modo que el compromiso de respuesta en 24 horas es comprobable.
 */
export interface ContactFormData {
  email: string;
  phone: string;
}

export interface ContactResponse {
  success: boolean;
  message?: string;
}

export const contactService = {
  async submitContactForm(
    formData: ContactFormData,
    locale: 'es' | 'en' = 'es',
  ): Promise<ContactResponse> {
    try {
      const response = await fetch('/api/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          locale,
          consent: true,
        }),
      });

      if (response.ok) return { success: true };

      if (response.status === 429) {
        return { success: false, message: 'rate_limited' };
      }
      return { success: false, message: 'send_failed' };
    } catch (error) {
      console.error('Error enviando solicitud de acceso:', error);
      return { success: false, message: 'network_error' };
    }
  },
};
