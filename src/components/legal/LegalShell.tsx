import Link from 'next/link';

/**
 * Contenedor común de las páginas legales.
 * Estilo neutro e independiente del diseño del sitio para garantizar
 * legibilidad (fondo claro, tipografía del sistema del sitio).
 */
export default function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24">
        <Link
          href="/"
          className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-800"
        >
          ← Volver al inicio
        </Link>
        <h1 className="mt-6 text-3xl font-bold leading-tight md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500">Última actualización: {updated}</p>
        <div className="legal-prose mt-10 space-y-4 text-[15px] leading-relaxed text-neutral-800 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_a]:underline [&_a]:underline-offset-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-100 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-neutral-300 [&_td]:p-2 [&_td]:align-top">
          {children}
        </div>
      </div>
    </main>
  );
}
