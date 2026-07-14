import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import DataroomShell from './DataroomShell';

export const metadata: Metadata = {
  title: 'Althara — Portal de inversores',
  description: 'Portal privado de inversores de Althara.',
  robots: { index: false, follow: false },
};

/** Portal con marco estilo SharePoint (barra superior + cabecera + sidebar). */
export default function DataroomLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInUrl="/dataroom/sign-in" afterSignOutUrl="/dataroom/sign-in">
      <DataroomShell>{children}</DataroomShell>
    </ClerkProvider>
  );
}
