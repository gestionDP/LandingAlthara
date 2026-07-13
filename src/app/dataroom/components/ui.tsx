'use client';

/** Shared UI primitives for the dataroom — light, Drive-like, Althara palette. */
import { type ReactNode } from 'react';

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
      <div className="h-8 w-8 animate-spin border-2 border-[#1c3742]/20 border-t-[#1c3742]" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="border border-red-300 bg-red-50 p-6 text-center">
      <p className="text-sm text-red-800">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 border border-red-300 px-4 py-1.5 text-xs text-red-700 hover:bg-red-100"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#1c3742]/20 bg-white/60 py-16 text-center">
      {icon}
      <p className="font-medium text-[#1c3742]">{title}</p>
      {subtitle && <p className="max-w-md text-sm text-[#1c3742]/55">{subtitle}</p>}
    </div>
  );
}

/* Paleta Althara: los estados "pendiente" usan el bronce de marca, nunca amarillo. */
const BADGE_STYLES: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  signed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  published: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  invited: 'bg-[#c08552]/15 text-[#8a5a33] border-[#c08552]/40',
  pending_signature: 'bg-[#c08552]/15 text-[#8a5a33] border-[#c08552]/40',
  required: 'bg-[#c08552]/15 text-[#8a5a33] border-[#c08552]/40',
  registration_started: 'bg-[#c08552]/15 text-[#8a5a33] border-[#c08552]/40',
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
  'auth.login': 'Inicio de sesión',
  'auth.denied': 'Acceso denegado',
  'project.created': 'Proyecto creado',
  'project.updated': 'Proyecto editado',
  'project.deleted': 'Proyecto eliminado',
  'project.access_granted': 'Acceso a proyecto concedido',
  'project.access_revoked': 'Acceso a proyecto revocado',
  'nda.opened': 'NDA abierto',
  'nda.signed': 'NDA firmado',
  'nda.version_created': 'Nueva versión de NDA',
  'document.uploaded': 'Documento subido',
  'document.published': 'Documento publicado',
  'document.versioned': 'Documento versionado',
  'document.archived': 'Documento archivado',
  'document.deleted': 'Documento eliminado',
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
      className={`inline-flex items-center border px-2.5 py-0.5 text-[11px] font-medium ${BADGE_STYLES[value] ?? 'bg-[#1c3742]/5 text-[#1c3742]/70 border-[#1c3742]/15'}`}
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

/** Icono por tipo de archivo, estilo Drive. */
export function FileIcon({ mimeType }: { mimeType?: string | null }) {
  const m = mimeType ?? '';
  const [label, bg, color] =
    m.includes('pdf') ? ['PDF', 'bg-red-50', 'text-red-700'] :
    m.includes('spreadsheet') || m.includes('csv') ? ['XLS', 'bg-emerald-50', 'text-emerald-700'] :
    m.includes('presentation') ? ['PPT', 'bg-[#c08552]/10', 'text-[#8a5a33]'] :
    m.includes('word') ? ['DOC', 'bg-blue-50', 'text-blue-700'] :
    m.startsWith('image/') ? ['IMG', 'bg-purple-50', 'text-purple-700'] :
    ['FILE', 'bg-[#1c3742]/5', 'text-[#1c3742]/70'];
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center ${bg} ${color} text-[10px] font-bold uppercase tracking-wide`} aria-hidden>
      {label}
    </span>
  );
}
