export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  userType: "comprador" | "vendedor";
}

export interface ContactResponse {
  success: boolean;
  message?: string;
}

export const contactService = {
  async submitContactForm(formData: ContactFormData): Promise<ContactResponse> {
    try {
      const response = await fetch("https://formspree.io/f/xgvneoqp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          userType: formData.userType,
          _subject: `Nueva solicitud de ${formData.userType} - ${formData.name}`,
        }),
      });

      if (response.ok) {
        return {
          success: true,
          message: "Formulario enviado correctamente",
        };
      } else {
        return {
          success: false,
          message: "Error al enviar el formulario",
        };
      }
    } catch (error) {
      console.error("Error enviando formulario:", error);
      return {
        success: false,
        message: "Error de conexión. Inténtalo de nuevo.",
      };
    }
  },
};
