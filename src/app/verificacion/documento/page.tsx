import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import DownloadPanel from './DownloadPanel';

export const metadata: Metadata = {
  title: 'Documento de verificación · Althara',
  robots: { index: false, follow: false },
};

export default async function DocumentoPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect('/verificacion?error=invalid_token');
  return <DownloadPanel token={token} />;
}
