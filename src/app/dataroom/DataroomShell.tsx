'use client';

/**
 * Marco del portal estilo SharePoint: barra superior (suite bar) con lanzador
 * de aplicaciones y buscador REAL, cabecera de sitio y navegación lateral.
 * El buscador expone su texto por contexto; las páginas con listas lo usan
 * para filtrar. Se reinicia al cambiar de sección.
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, UserButton } from '@clerk/nextjs';

const ADMIN_NAV = [
  { href: '/dataroom/admin', label: 'Inicio' },
  { href: '/dataroom/admin/projects', label: 'Proyectos' },
  { href: '/dataroom/admin/investors', label: 'Inversores' },
  { href: '/dataroom/admin/nda', label: 'NDA' },
  { href: '/dataroom/admin/audit', label: 'Auditoría' },
  { href: '/dataroom/admin/guide', label: 'Guía' },
];
const INVESTOR_NAV = [
  { href: '/dataroom', label: 'Inicio' },
  { href: '/dataroom/profile', label: 'Mi perfil' },
  { href: '/dataroom/guide', label: 'Guía' },
];
const REVIEWER_NAV = [
  { href: '/dataroom/review', label: 'Revisión' },
  { href: '/dataroom/review/guide', label: 'Guía' },
];

/** Contexto del buscador de la barra superior. */
const SearchContext = createContext('');
export function useDataroomSearch() {
  return useContext(SearchContext);
}

/** Avisos tipo toast (esquina inferior). */
type Toast = { id: number; msg: string; kind: 'ok' | 'error' };
const ToastContext = createContext<(msg: string, kind?: 'ok' | 'error') => void>(() => {});
export function useToast() {
  return useContext(ToastContext);
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export default function DataroomShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const isAdmin = pathname.startsWith('/dataroom/admin');
  const isReviewer = pathname.startsWith('/dataroom/review');
  const nav = isAdmin ? ADMIN_NAV : isReviewer ? REVIEWER_NAV : INVESTOR_NAV;
  const home = isAdmin ? '/dataroom/admin' : isReviewer ? '/dataroom/review' : '/dataroom';
  const isActive = (href: string) => (href === home ? pathname === href : pathname.startsWith(href));

  const [query, setQuery] = useState('');
  useEffect(() => { setQuery(''); }, [pathname]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((msg: string, kind: 'ok' | 'error' = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
    <SearchContext.Provider value={query}>
      <div className="flex min-h-screen flex-col bg-[#f4f2ec] text-[#1c3742]">
        {/* Suite bar */}
        <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-2 bg-[#1c3742] px-4 text-[#e6e2d7]">
          <Link href={home} className="text-sm font-semibold tracking-wide">Althara</Link>
          <div className="mx-auto hidden w-full max-w-xl px-4 md:block">
            <label className="flex items-center gap-2 rounded-md bg-white/10 px-3 text-sm text-[#e6e2d7] focus-within:bg-white/20">
              <SearchIcon />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en el portal"
                className="w-full bg-transparent py-1.5 placeholder:text-[#e6e2d7]/55 focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Limpiar" className="text-[#e6e2d7]/70 hover:text-[#e6e2d7]">✕</button>
              )}
            </label>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <a href="mailto:info@althara.es" aria-label="Ayuda"
              className="hidden h-9 w-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-white/10 sm:flex">?</a>
            <SignedIn><div className="pl-1"><UserButton /></div></SignedIn>
          </div>
        </header>

        {/* Site header */}
        <div className="shrink-0 border-b border-[#1c3742]/10 bg-white">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#1c3742] text-xs font-bold tracking-wide text-[#e6e2d7]">AL</span>
            <div className="min-w-0">
              <p className="font-playfair text-lg leading-tight">Portal de inversores</p>
              <p className="text-[11px] text-[#1c3742]/50">Althara · Documentación confidencial{isAdmin ? ' · Backoffice' : isReviewer ? ' · Revisión' : ''}</p>
            </div>
          </div>
        </div>

        {/* Nav horizontal en móvil */}
        <SignedIn>
          <nav className="flex gap-1 overflow-x-auto border-b border-[#1c3742]/10 bg-white px-2 py-1 md:hidden">
            {nav.map((n) => (
              <Link key={n.href} href={n.href}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${isActive(n.href) ? 'bg-[#1c3742]/[0.06] font-medium text-[#1c3742]' : 'text-[#1c3742]/70'}`}>
                {n.label}
              </Link>
            ))}
          </nav>
        </SignedIn>

        {/* Cuerpo: sidebar (a ras y a toda la altura) + contenido */}
        <div className="flex flex-1">
          <SignedIn>
            <aside className="hidden w-60 shrink-0 border-r border-[#1c3742]/10 bg-white md:block">
              <nav className="sticky top-12 px-3 py-3">
                {nav.map((n) => (
                  <Link key={n.href} href={n.href}
                    className={`block border-l-2 px-4 py-2.5 text-sm transition-colors ${
                      isActive(n.href)
                        ? 'border-[#c08552] bg-[#1c3742]/[0.05] font-medium text-[#1c3742]'
                        : 'border-transparent text-[#1c3742]/70 hover:bg-[#1c3742]/[0.04]'
                    }`}>
                    {n.label}
                  </Link>
                ))}
              </nav>
            </aside>
          </SignedIn>
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
            <footer className="px-4 pb-8 pt-4 text-[11px] text-[#1c3742]/40 md:px-8">
              Contenido confidencial. El acceso y las descargas quedan registrados.
            </footer>
          </div>
        </div>

        {/* Toasts */}
        <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto min-w-56 max-w-sm border px-4 py-3 text-sm rounded-lg ${
                t.kind === 'error'
                  ? 'border-red-300 bg-red-50 text-red-800'
                  : 'border-[#1c3742]/15 bg-[#1c3742] text-[#e6e2d7]'
              }`}
            >
              {t.msg}
            </div>
          ))}
        </div>
      </div>
    </SearchContext.Provider>
    </ToastContext.Provider>
  );
}
