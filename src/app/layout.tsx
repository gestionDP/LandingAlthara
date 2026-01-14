import type { Metadata } from 'next';
import { Montserrat, Playfair_Display } from 'next/font/google';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';
import MessagesProvider from '@/components/MessagesProvider';
import { headers } from 'next/headers';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Althara - Matching Inteligente para Activos de Lujo Off-Market',
  description:
    'Plataforma exclusiva que conecta vendedores discretos con compradores cualificados mediante matching inteligente para activos premium. Inmuebles, joyas, arte y más.',
  keywords:
    'inversión inmobiliaria, activos premium, coinversión, Mallorca, propiedades de lujo, matching inteligente',
  icons: {
    icon: '/svg/logo.svg',
    shortcut: '/svg/logo.svg',
    apple: '/svg/logo.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? '';
  const cookieLocale = cookieHeader
    .split(';')
    .map((c: string) => c.trim())
    .find((c: string) => c.startsWith('locale='))
    ?.split('=')[1];
  const locale = cookieLocale === 'en' ? 'en' : 'es';

  return (
    <html lang={locale}>
      <body
        className={`${montserrat.variable} ${playfairDisplay.variable} font-montserrat antialiased`}
      >
        <MessagesProvider>
          <CustomCursor />
          {children}
        </MessagesProvider>
      </body>
    </html>
  );
}
