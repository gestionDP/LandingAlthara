import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import MessagesProvider from "@/components/MessagesProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Althara - Matching Inteligente para Activos de Lujo Off-Market",
  description:
    "Plataforma exclusiva que conecta vendedores discretos con compradores cualificados mediante matching inteligente para activos premium. Inmuebles, joyas, arte y más.",
  keywords:
    "inversión inmobiliaria, activos premium, coinversión, Mallorca, propiedades de lujo, matching inteligente",
  icons: {
    icon: "/svg/logo.svg",
    shortcut: "/svg/logo.svg",
    apple: "/svg/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} font-montserrat antialiased`}>
        <MessagesProvider>
          <CustomCursor />
          {children}
        </MessagesProvider>
      </body>
    </html>
  );
}
