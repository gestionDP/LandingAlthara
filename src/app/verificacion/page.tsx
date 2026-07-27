import type { Metadata } from 'next';
import VerificationForm from './VerificationForm';

export const metadata: Metadata = {
  title: 'Documento de verificación · Althara',
  description:
    'Solicite el documento que define, fecha y firma cada cifra publicada por Althara.',
  alternates: { canonical: '/verificacion' },
  // Capa 1: accesible desde cualquier página, pero no es contenido a indexar.
  robots: { index: false, follow: true },
};

export default async function VerificacionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <VerificationForm initialError={error} />;
}
