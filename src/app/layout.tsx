import type { Metadata } from 'next';
import { Montserrat, Playfair_Display } from 'next/font/google';
import './globals.css';
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

// ALT-WEB-2026-01 v1.2 §03: el title y la description antiguos hablaban de
// «matching inteligente» y de «joyas, arte y más» — vocabulario de producto
// tecnológico y de perímetro que la firma no opera.
export const metadata: Metadata = {
  metadataBase: new URL('https://althara.es'),
  title: 'Althara — Inversión inmobiliaria off-market',
  description:
    'Originación propia, verificación documental y gestión integral del activo hasta su salida. Palma de Mallorca. Operaciones en Baleares, Cataluña, Cantabria y Andalucía.',
  keywords:
    'inversión inmobiliaria off-market, originación, verificación documental, gestión de activos, Baleares, Cataluña, Andalucía',
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
          {children}
        </MessagesProvider>
      </body>
    </html>
  );
}
