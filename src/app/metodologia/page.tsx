import type { Metadata } from 'next';
import MethodologyContent from './MethodologyContent';

export const metadata: Metadata = {
  title: 'Metodología · Althara',
  description:
    'Definición, fecha y universo de cálculo de las cifras publicadas por Althara. Documento versionado.',
  alternates: { canonical: '/metodologia' },
  robots: { index: true, follow: true },
};

export default function MetodologiaPage() {
  return <MethodologyContent />;
}
