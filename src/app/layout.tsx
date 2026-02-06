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
  title: 'Althara - Matching Inteligente para Activos Off-Market',
  description:
    'Plataforma exclusiva que conecta vendedores discretos con compradores cualificados mediante matching inteligente para activos premium. Inmuebles, joyas, arte y más.',
  keywords:
    'inversión inmobiliaria, activos premium, coinversión, Mallorca, propiedades, matching inteligente',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon1.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
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
