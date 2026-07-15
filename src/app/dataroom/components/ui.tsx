'use client';

import { Trash2 } from 'lucide-react';

/** Shared UI primitives for the dataroom — light, Drive-like, Althara palette. */
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export async function fetchJson<T = unknown>(
  url: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => null)) as T | null;
    return {
      ok: res.ok,
      status: res.status,
      data,
      error: !res.ok ? ((data as { error?: string; reason?: string } | null)?.error ??
        (data as { reason?: string } | null)?.reason ?? `error_${res.status}`) : undefined,
    };
  } catch {
    return { ok: false, status: 0, data: null, error: 'network_error' };
  }
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#1c3742]/60">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1c3742]/20 border-t-[#1c3742]" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="border border-red-300 bg-red-50 p-6 text-center rounded-lg">
      <p className="text-sm text-red-800">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 border border-red-300 px-4 py-1.5 text-xs text-red-700 hover:bg-red-100 rounded-md"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#1c3742]/20 bg-white/60 py-16 text-center rounded-lg">
      {icon}
      <p className="font-medium text-[#1c3742]">{title}</p>
      {subtitle && <p className="max-w-md text-sm text-[#1c3742]/55">{subtitle}</p>}
    </div>
  );
}

/* Paleta Althara: los estados "pendiente" usan el bronce de marca, nunca amarillo. */
const BADGE_STYLES: Record<string, string> = {
  active: 'bg-[#1c3742] text-[#e6e2d7] border-[#1c3742]',
  signed: 'bg-[#1c3742] text-[#e6e2d7] border-[#1c3742]',
  published: 'bg-[#1c3742] text-[#e6e2d7] border-[#1c3742]',
  pending: 'bg-[#1c3742]/5 text-[#c08552] border-[#c08552]/45',
  pending_validation: 'bg-[#1c3742]/5 text-[#c08552] border-[#c08552]/45',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  invited: 'bg-[#1c3742]/5 text-[#c08552] border-[#c08552]/45',
  pending_signature: 'bg-[#1c3742]/5 text-[#c08552] border-[#c08552]/45',
  required: 'bg-[#1c3742]/5 text-[#c08552] border-[#c08552]/45',
  registration_started: 'bg-[#1c3742]/5 text-[#c08552] border-[#c08552]/45',
  draft: 'bg-[#1c3742]/5 text-[#1c3742]/70 border-[#1c3742]/15',
  not_required: 'bg-[#1c3742]/5 text-[#1c3742]/70 border-[#1c3742]/15',
  suspended: 'bg-red-100 text-red-800 border-red-300',
  disabled: 'bg-red-100 text-red-800 border-red-300',
  revoked: 'bg-red-100 text-red-800 border-red-300',
  expired: 'bg-red-100 text-red-800 border-red-300',
  archived: 'bg-[#1c3742]/5 text-[#1c3742]/50 border-[#1c3742]/15',
};

/** Etiquetas en español para TODOS los valores internos (nunca mostrar variables). */
export const STATUS_LABELS: Record<string, string> = {
  active: 'Activo', invited: 'Invitado', draft: 'Borrador', suspended: 'Suspendido',
  pending_validation: 'Pendiente validación', rejected: 'Rechazado',
  disabled: 'Desactivado', revoked: 'Revocado', expired: 'Caducado', archived: 'Archivado',
  published: 'Publicado', signed: 'NDA firmado', pending_signature: 'NDA pendiente',
  required: 'NDA requerido', not_required: 'Sin NDA', invitation_expired: 'Invitación caducada',
  invitation_revoked: 'Invitación revocada', registration_started: 'Registro iniciado',
  temporarily_unavailable: 'Pausado', closed: 'Cerrado', generic: 'General',
  sensitive: 'Confidencial', full: 'Acceso completo', pending: 'Pendiente', used: 'Utilizada',
};
const BADGE_LABELS_ES = STATUS_LABELS;

/** Etiquetas de acciones de auditoría/actividad. */
export const ACTION_LABELS: Record<string, string> = {
  'investor.created': 'Inversor creado',
  'investor.updated': 'Inversor editado',
  'investor.suspended': 'Inversor suspendido',
  'investor.reactivated': 'Inversor reactivado',
  'investor.disabled': 'Inversor desactivado',
  'investor.deleted': 'Inversor eliminado',
  'invitation.sent': 'Invitación enviada',
  'invitation.resent': 'Invitación reenviada',
  'invitation.revoked': 'Invitación revocada',
  'invitation.validated': 'Invitación validada',
  'invitation.validation_failed': 'Validación de invitación fallida',
  'registration.completed': 'Registro completado',
  'kyc.submitted': 'KYC enviado',
  'kyc.validated': 'KYC validado',
  'kyc.rejected': 'KYC rechazado',
  'auth.login': 'Inicio de sesión',
  'auth.denied': 'Acceso denegado',
  'project.created': 'Proyecto creado',
  'project.updated': 'Proyecto editado',
  'project.deleted': 'Proyecto eliminado',
  'project.access_granted': 'Acceso a proyecto concedido',
  'project.access_revoked': 'Acceso a proyecto revocado',
  'project.invitation_accepted': 'Invitación a proyecto aceptada',
  'project.invitation_declined': 'Invitación a proyecto rechazada',
  'nda.opened': 'NDA abierto',
  'nda.signed': 'NDA firmado',
  'nda.version_created': 'Nueva versión de NDA',
  'document.uploaded': 'Documento subido',
  'document.published': 'Documento publicado',
  'document.versioned': 'Documento versionado',
  'document.archived': 'Documento archivado',
  'document.deleted': 'Documento eliminado',
  'document.renamed': 'Documento renombrado',
  'review.approved': 'Visado aprobado',
  'review.rejected': 'Visado rechazado',
  'document.viewed': 'Documento visualizado',
  'document.downloaded': 'Documento descargado',
  'document.access_denied': 'Acceso a documento denegado',
  'permission.changed': 'Permiso modificado',
  'email.sent': 'Email enviado',
  'email.failed': 'Email fallido',
  'notification.sent': 'Notificación enviada',
};

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export function Badge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-0.5 text-[11px] font-medium rounded-full ${BADGE_STYLES[value] ?? 'bg-[#1c3742]/5 text-[#1c3742]/70 border-[#1c3742]/15'}`}
    >
      {BADGE_LABELS_ES[value] ?? value}
    </span>
  );
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Icono por tipo de archivo, estilo SharePoint. Prioriza el mimeType; si no
 * está disponible, infiere el tipo por la extensión del nombre de archivo.
 */
export function FileIcon({ mimeType, fileName }: { mimeType?: string | null; fileName?: string | null }) {
  const m = (mimeType ?? '').toLowerCase();
  const ext = (fileName ?? '').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? '';
  const is = (mimeMatch: boolean, exts: string[]) => mimeMatch || exts.includes(ext);

  const [label, bg, color] =
    is(m.includes('pdf'), ['pdf']) ? ['PDF', 'bg-red-50', 'text-red-700'] :
    is(m.includes('spreadsheet') || m.includes('csv') || m.includes('excel'), ['xlsx', 'xls', 'csv']) ? ['XLS', 'bg-[#1c3742]/8', 'text-[#1c3742]'] :
    is(m.includes('presentation') || m.includes('powerpoint'), ['pptx', 'ppt']) ? ['PPT', 'bg-[#1c3742]/5', 'text-[#c08552]'] :
    is(m.includes('word'), ['docx', 'doc']) ? ['DOC', 'bg-blue-50', 'text-blue-700'] :
    is(m.startsWith('image/'), ['png', 'jpg', 'jpeg', 'webp', 'gif']) ? ['IMG', 'bg-purple-50', 'text-purple-700'] :
    ['FILE', 'bg-[#1c3742]/5', 'text-[#1c3742]/70'];
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${bg} ${color} text-[10px] font-bold uppercase tracking-wide`} aria-hidden>
      {label}
    </span>
  );
}

/**
 * Etiquetas claras para el NIVEL DE ACCESO de un inversor a un proyecto.
 * (Distinto de la confidencialidad del documento — ver STATUS_LABELS.)
 */
export const ACCESS_LEVEL_LABELS: Record<string, string> = {
  full: 'Ve toda la documentación',
  generic: 'Solo lo compartido',
};
export function accessLevelLabel(level: string): string {
  return ACCESS_LEVEL_LABELS[level] ?? level;
}
/** Descripción larga del nivel de acceso, para tooltips/ayudas. */
export const ACCESS_LEVEL_HINTS: Record<string, string> = {
  full: 'Ve toda la documentación del proyecto por defecto (salvo lo que le bloquees).',
  generic: 'No ve nada por defecto: solo los documentos que le compartas expresamente.',
};

/* ------------------------- Biblioteca (SharePoint) ------------------------ */

export function FolderGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

export function SearchGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

/** Carpeta de categoría, estilo SharePoint. */
export function FolderChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
        active ? 'bg-[#1c3742] text-[#e6e2d7]' : 'text-[#1c3742]/75 hover:bg-[#1c3742]/[0.06]'
      }`}
    >
      <FolderGlyph className={`h-4 w-4 ${active ? 'text-[#e6e2d7]/80' : 'text-[#c08552]'}`} />
      {label}
      <span className={active ? 'text-[#e6e2d7]/55' : 'text-[#1c3742]/40'}>{count}</span>
    </button>
  );
}

/** Conmutador lista / cuadrícula, estilo SharePoint. */
export function ViewToggle({ view, onChange }: { view: 'list' | 'grid'; onChange: (v: 'list' | 'grid') => void }) {
  const cls = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center border border-[#1c3742]/20 ${active ? 'bg-[#1c3742] text-[#e6e2d7]' : 'text-[#1c3742]/60 hover:bg-[#1c3742]/[0.06]'}`;
  return (
    <div className="flex shrink-0 overflow-hidden rounded-md">
      <button type="button" aria-label="Vista de lista" onClick={() => onChange('list')} className={cls(view === 'list')}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><rect x="3" y="5" width="18" height="2" /><rect x="3" y="11" width="18" height="2" /><rect x="3" y="17" width="18" height="2" /></svg>
      </button>
      <button type="button" aria-label="Vista de cuadrícula" onClick={() => onChange('grid')} className={`${cls(view === 'grid')} -ml-px`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="8" /><rect x="3" y="13" width="8" height="8" /><rect x="13" y="13" width="8" height="8" /></svg>
      </button>
    </div>
  );
}

/** Icono de carpeta relleno, estilo SharePoint (carpeta amarilla clásica). */
export function FolderIconFilled({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" fill="#F2C24B" />
      <path d="M3 9h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" fill="#F7D67A" />
    </svg>
  );
}

export interface MenuItem { label: string; onClick: () => void; danger?: boolean }

/**
 * Menú de acciones "⋮" estilo Drive: se abre al hacer clic y PERMANECE abierto
 * (no depende del hover); se cierra al hacer clic fuera o con Escape.
 */
export function KebabMenu({ items, label = 'Más acciones' }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const width = 208;

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    // Se cierra al hacer scroll o redimensionar (como Drive) → nunca alarga la página.
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const menuH = Math.min(items.length * 40 + 8, 340);
      const openUp = r.bottom + menuH > window.innerHeight - 8;
      setPos({
        top: openUp ? Math.max(8, r.top - menuH - 4) : r.bottom + 4,
        left: Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8)),
      });
    }
    setOpen((v) => !v);
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#1c3742]/60 transition-colors hover:bg-[#1c3742]/10 hover:text-[#1c3742]"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" />
        </svg>
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{ position: 'fixed', top: pos.top, left: pos.left, width }}
          className="z-[60] border border-[#1c3742]/15 bg-white py-1 rounded-lg"
        >
          {items.map((it, i) => (
            <button
              key={i}
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); setOpen(false); it.onClick(); }}
              className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[#1c3742]/[0.06] ${it.danger ? 'text-red-700' : 'text-[#1c3742]'}`}
            >
              {it.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}

/** Carga un script externo una sola vez y devuelve el global que expone. */
function loadScript(url: string, globalName: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as Record<string, unknown>;
    if (w[globalName]) return resolve(w[globalName]);
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    s.onload = () => resolve(w[globalName]);
    s.onerror = () => reject(new Error('script_load_failed'));
    document.body.appendChild(s);
  });
}

/**
 * Visor de documentos incrustado (estilo Microsoft/Drive): PDF e imágenes
 * inline; Word (.docx) y Excel (.xlsx/.csv) se renderizan en el navegador
 * (mammoth / SheetJS). PowerPoint y otros ofrecen descarga. Sin salir del portal.
 */
/** Fondo repetido en diagonal con el texto de marca de agua (email + fecha). */
function watermarkBg(text: string): React.CSSProperties {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='200'>` +
    `<text x='10' y='150' fill='rgba(28,55,66,0.14)' font-size='14' font-family='Arial, sans-serif' ` +
    `transform='rotate(-30 10 150)'>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`;
  return {
    backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
    backgroundRepeat: 'repeat',
  };
}

export function DocViewer({ title, src, mimeType, fileName, watermark, onClose, onDownload, onDelete }: {
  title: string; src: string; mimeType?: string | null; fileName?: string | null;
  watermark?: string | null;
  onClose: () => void; onDownload?: () => void; onDelete?: () => void;
}) {
  const hint = `${mimeType ?? ''} ${fileName ?? ''} ${src}`.toLowerCase();
  const isImage = (mimeType ?? '').startsWith('image/') || /\.(png|jpe?g|webp|gif)(\?|%|$)/.test(hint);
  const isPdf = (mimeType ?? '').includes('pdf') || /\.pdf(\?|%|$)/.test(hint);
  const isDocx = (mimeType ?? '').includes('wordprocessingml') || /\.docx(\?|%|$)/.test(hint);
  const isSheet = (mimeType ?? '').includes('spreadsheetml') || (mimeType ?? '').includes('ms-excel') || /\.(xlsx|xls|csv)(\?|%|$)/.test(hint);

  const [state, setState] = useState<'ready' | 'loading' | 'unsupported'>(isPdf || isImage ? 'ready' : 'loading');
  const [html, setHtml] = useState('');
  const [rows, setRows] = useState<string[][] | null>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);

  useEffect(() => {
    if (isPdf || isImage) { setState('ready'); return; }
    let cancelled = false;
    (async () => {
      try {
        if (isDocx) {
          const mammoth = await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js', 'mammoth') as {
            convertToHtml: (i: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
          };
          const buf = await (await fetch(src)).arrayBuffer();
          const out = await mammoth.convertToHtml({ arrayBuffer: buf });
          if (!cancelled) { setHtml(out.value); setState('ready'); }
        } else if (isSheet) {
          const XLSX = await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'XLSX') as {
            read: (d: ArrayBuffer, o: { type: string }) => { SheetNames: string[]; Sheets: Record<string, unknown> };
            utils: { sheet_to_json: (ws: unknown, o: { header: 1 }) => string[][] };
          };
          const buf = await (await fetch(src)).arrayBuffer();
          const wb = XLSX.read(buf, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          if (!cancelled) { setRows(XLSX.utils.sheet_to_json(ws, { header: 1 })); setState('ready'); }
        } else {
          setState('unsupported');
        }
      } catch {
        if (!cancelled) setState('unsupported');
      }
    })();
    return () => { cancelled = true; };
  }, [src, isPdf, isImage, isDocx, isSheet]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#102027]/85" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-[#e6e2d7]">
        <p className="truncate text-sm font-medium">{title}</p>
        <div className="flex items-center gap-2">
          {onDownload && (
            <button onClick={onDownload} className="border border-[#e6e2d7]/40 px-3 py-1.5 text-xs transition-colors hover:bg-white/10 rounded-md">Descargar</button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              aria-label="Eliminar documento"
              title="Eliminar documento"
              className="flex items-center gap-1.5 border border-red-400/50 px-3 py-1.5 text-xs text-red-200 transition-colors hover:bg-red-500/20 rounded-md"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Eliminar
            </button>
          )}
          <button onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition-colors hover:bg-white/10">✕</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2 sm:px-6 sm:pb-6">
        {isImage ? (
          <div className="flex h-full items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={title} className="max-h-full max-w-full rounded-lg object-contain" />
          </div>
        ) : isPdf ? (
          <iframe src={src} title={title} className="h-full w-full rounded-lg border-0 bg-white" />
        ) : state === 'loading' ? (
          <div className="flex h-full items-center justify-center"><Spinner label="Preparando la vista previa…" /></div>
        ) : state === 'ready' && isDocx ? (
          <div
            className="mx-auto max-w-3xl bg-white p-8 text-sm leading-relaxed text-[#1c3742] rounded-lg [&_a]:text-[#c08552] [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-semibold [&_img]:my-2 [&_img]:max-w-full [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[#1c3742]/15 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-[#1c3742]/15 [&_th]:bg-[#1c3742]/5 [&_th]:px-2 [&_th]:py-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : state === 'ready' && isSheet && rows ? (
          <div className="mx-auto max-w-5xl overflow-auto bg-white p-2 rounded-lg">
            <table className="w-full border-collapse text-xs">
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={i === 0 ? 'bg-[#1c3742]/5 font-semibold' : ''}>
                    {r.map((c, j) => <td key={j} className="border border-[#1c3742]/15 px-2 py-1 text-[#1c3742]">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-[#e6e2d7]/85">
            <p className="text-sm">La vista previa de este tipo de archivo no está disponible aquí.</p>
            {onDownload && (
              <button onClick={onDownload} className="bg-[#e6e2d7] px-4 py-2 text-sm font-semibold text-[#102027] rounded-md">Descargar para verlo</button>
            )}
          </div>
        )}
      </div>

      {/* Marca de agua visual para formatos sin marca incrustada (no PDF). El PDF
          ya la lleva dentro del archivo. Cubre el área visible, no bloquea clics. */}
      {watermark && !isPdf && (
        <div className="pointer-events-none absolute inset-0 z-40" style={watermarkBg(watermark)} aria-hidden />
      )}
    </div>
  );
}

/** Buscador con icono, estilo command bar de SharePoint. */
export function LibrarySearch({ value, onChange, placeholder = 'Buscar en esta biblioteca…' }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:w-72">
      <SearchGlyph className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1c3742]/40" />
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#1c3742]/20 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-[#1c3742]/35 focus:border-[#1c3742]/50 focus:outline-none rounded-md"
      />
    </div>
  );
}

/* --------------------------- Doble visado (visual) ------------------------ */

export type VisadoStatus = 'pending' | 'approved' | 'rejected';

const VISADO_META: Record<VisadoStatus, { label: string; icon: string; fill: string; text: string; dot: string }> = {
  approved: { label: 'Aprobado', icon: '✓', fill: 'bg-[#2e9e5a]', text: 'text-[#2e9e5a]', dot: 'bg-[#2e9e5a]' },
  rejected: { label: 'Rechazado', icon: '✗', fill: 'bg-red-600', text: 'text-red-600', dot: 'bg-red-600' },
  pending: { label: 'Pendiente', icon: '⏳', fill: 'bg-[#c08552]', text: 'text-[#c08552]', dot: 'bg-[#c08552]' },
};

/** Frase-resumen del estado combinado del doble visado. */
export function visadoCaption(legal: VisadoStatus, tax: VisadoStatus): { text: string; tone: 'ok' | 'bad' | 'wait' } {
  if (legal === 'approved' && tax === 'approved') return { text: 'Disponible para inversores', tone: 'ok' };
  if (legal === 'rejected' || tax === 'rejected') return { text: 'Rechazado — requiere corrección', tone: 'bad' };
  if (legal === 'approved') return { text: 'Aprobado por abogado · Pendiente de fiscal', tone: 'wait' };
  if (tax === 'approved') return { text: 'Aprobado por fiscal · Pendiente de abogado', tone: 'wait' };
  return { text: 'Pendiente de abogado y fiscal', tone: 'wait' };
}

/**
 * Barra de progreso del doble visado: dos tramos (Abogado, Fiscal), cada uno
 * coloreado por su estado, con una frase-resumen debajo. Reutilizada en el
 * portal del revisor y en el panel de administración.
 */
export function VisadoProgress({
  legalStatus, taxStatus, compact = false,
}: { legalStatus: string; taxStatus: string; compact?: boolean }) {
  const legal = (['pending', 'approved', 'rejected'].includes(legalStatus) ? legalStatus : 'pending') as VisadoStatus;
  const tax = (['pending', 'approved', 'rejected'].includes(taxStatus) ? taxStatus : 'pending') as VisadoStatus;
  const cap = visadoCaption(legal, tax);
  const capColor = cap.tone === 'ok' ? 'text-[#2e9e5a]' : cap.tone === 'bad' ? 'text-red-600' : 'text-[#c08552]';
  const seg = (role: 'Abogado' | 'Fiscal', s: VisadoStatus) => (
    <div className="flex-1">
      <div className={`h-1.5 w-full rounded-full ${s === 'pending' ? 'bg-[#c08552]/25' : VISADO_META[s].fill}`} />
      {!compact && (
        <div className="mt-1 flex items-center gap-1">
          <span className={`text-[11px] ${VISADO_META[s].text}`}>{VISADO_META[s].icon}</span>
          <span className="text-[11px] text-[#1c3742]/70">{role}</span>
          <span className={`text-[11px] ${VISADO_META[s].text}`}>· {VISADO_META[s].label}</span>
        </div>
      )}
    </div>
  );
  return (
    <div>
      <div className="flex items-center gap-1.5">{seg('Abogado', legal)}{seg('Fiscal', tax)}</div>
      <p className={`mt-1 text-[11px] font-medium ${capColor}`}>{cap.text}</p>
    </div>
  );
}

/** Indicador compacto en línea (para filas densas): Abogado ✓ · Fiscal ⏳. */
export function VisadoInline({ legalStatus, taxStatus }: { legalStatus: string; taxStatus: string }) {
  const norm = (v: string): VisadoStatus => (['pending', 'approved', 'rejected'].includes(v) ? v : 'pending') as VisadoStatus;
  const l = norm(legalStatus); const t = norm(taxStatus);
  return (
    <span className="inline-flex items-center gap-2 text-[11px]">
      <span className="inline-flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-full ${VISADO_META[l].dot}`} />Abogado {VISADO_META[l].icon}</span>
      <span className="inline-flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-full ${VISADO_META[t].dot}`} />Fiscal {VISADO_META[t].icon}</span>
    </span>
  );
}
