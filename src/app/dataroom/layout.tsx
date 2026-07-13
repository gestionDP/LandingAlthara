import type { Metadata } from 'next';
import { ClerkProvider, SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Althara — Portal de inversores',
  description: 'Portal privado de inversores de Althara.',
  robots: { index: false, follow: false },
};

/**
 * Shell del portal estilo Drive: barra superior clara, contenido sobre
 * fondo crema Althara. El texto usa el azul tinta de la marca.
 */
export default function DataroomLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInUrl="/dataroom/sign-in" afterSignOutUrl="/dataroom/sign-in">
      <div className="min-h-screen bg-[#f4f2ec] text-[#1c3742]">
        <header className="sticky top-0 z-40 border-b border-[#1c3742]/10 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <Link href="/dataroom" className="flex items-center gap-3">
              <Image
                src="/svg/logoFull.svg"
                alt="Althara"
                width={110}
                height={28}
                style={{ height: 'auto' }}
              />
              <span className="hidden bg-[#1c3742]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1c3742]/60 sm:inline">
                Portal de inversores
              </span>
            </Link>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</main>
        <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4 text-[11px] text-[#1c3742]/40 md:px-6">
          Contenido confidencial. El acceso y las descargas quedan registrados.
        </footer>
      </div>
    </ClerkProvider>
  );
}
