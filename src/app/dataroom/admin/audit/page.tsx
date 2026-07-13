'use client';

/** Admin — immutable audit trail viewer with filters + pagination. */
import { useCallback, useEffect, useState } from 'react';
import { fetchJson, Spinner, ErrorBox, EmptyState } from '../../components/ui';

interface AuditRow {
  id: string; actorType: string; actorEmail: string | null; action: string;
  entityType: string; entityId: string | null; result: string;
  metadata: Record<string, unknown> | null; ip: string | null; createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  'investor.created': 'Inversor creado',
  'investor.updated': 'Inversor editado',
  'investor.suspended': 'Inversor suspendido',
  'investor.reactivated': 'Inversor reactivado',
  'investor.disabled': 'Inversor desactivado',
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
  'project.access_granted': 'Acceso a proyecto concedido',
  'project.access_revoked': 'Acceso a proyecto revocado',
  'nda.opened': 'NDA abierto',
  'nda.signed': 'NDA firmado',
  'nda.version_created': 'Nueva versión de NDA',
  'document.uploaded': 'Documento subido',
  'document.published': 'Documento publicado',
  'document.versioned': 'Documento versionado',
  'document.archived': 'Documento archivado',
  'document.viewed': 'Documento visualizado',
  'document.downloaded': 'Documento descargado',
  'document.access_denied': 'Acceso a documento denegado',
  'permission.changed': 'Permiso modificado',
  'email.sent': 'Email enviado',
  'email.failed': 'Email fallido',
  'notification.sent': 'Notificación enviada',
};

const ACTIONS = ['', ...Object.keys(ACTION_LABELS)];

export default function AdminAudit() {
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 100;

  const load = useCallback(async () => {
    setError(null);
    const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (action) qs.set('action', action);
    const res = await fetchJson<{ events: AuditRow[] }>(`/api/dataroom/admin/audit?${qs}`);
    if (res.ok && res.data) setRows(res.data.events);
    else setError(res.error ?? 'error');
  }, [action, offset]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-playfair text-2xl">Auditoría</h1>
        <select value={action} onChange={(e) => { setAction(e.target.value); setOffset(0); }}
          className="border border-[#1c3742]/25 bg-white px-3 py-2 text-sm">
          {ACTIONS.map((a) => <option key={a} value={a}>{a ? ACTION_LABELS[a] : 'Todas las acciones'}</option>)}
        </select>
      </div>

      {error && <ErrorBox message="No se ha podido cargar la auditoría." onRetry={load} />}
      {!rows && !error && <Spinner label="Cargando eventos…" />}
      {rows && rows.length === 0 && <EmptyState title="Sin eventos" />}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto border border-[#1c3742]/10 bg-white shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1c3742]/15 text-left text-[10px] uppercase tracking-wider text-[#1c3742]/50">
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Acción</th>
                <th className="px-3 py-2">Entidad</th>
                <th className="px-3 py-2">Resultado</th>
                <th className="px-3 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#1c3742]/10 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 text-[#1c3742]/60">
                    {new Date(r.createdAt).toLocaleString('es-ES')}
                  </td>
                  <td className="px-3 py-2">{r.actorEmail ?? r.actorType}</td>
                  <td className="px-3 py-2">{ACTION_LABELS[r.action] ?? r.action}</td>
                  <td className="px-3 py-2 text-[#1c3742]/60">
                    {r.entityType}{r.entityId ? ` · ${r.entityId.slice(0, 8)}` : ''}
                  </td>
                  <td className={`px-3 py-2 font-medium ${r.result === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>{r.result === 'success' ? 'Correcto' : r.result === 'denied' ? 'Denegado' : 'Error'}</td>
                  <td className="px-3 py-2 text-[#1c3742]/50">{r.ip ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex gap-2">
        <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}
          className="border border-[#1c3742]/30 px-3 py-1.5 text-xs disabled:opacity-30">← Anteriores</button>
        <button disabled={!rows || rows.length < limit} onClick={() => setOffset(offset + limit)}
          className="border border-[#1c3742]/30 px-3 py-1.5 text-xs disabled:opacity-30">Siguientes →</button>
      </div>
    </div>
  );
}
