'use client';

/** Admin — investor detail: data, invitations, project access, NDA, activity timeline. */
import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJson, Spinner, ErrorBox, Badge, STATUS_LABELS, actionLabel, formatDate } from '../../../components/ui';

interface Detail {
  investor: {
    id: string; email: string; firstName: string | null; lastName: string | null;
    company: string | null; phone: string | null; country: string | null;
    investorType: string | null; language: string; status: string;
    internalNotes: string | null; invitedAt: string | null; activatedAt: string | null;
    lastAccessAt: string | null; termsVersion: string | null;
  };
  invitations: { id: string; status: string; expiresAt: string; createdAt: string }[];
  assignments: { access: { projectId: string; status: string; accessLevel: string; grantedAt: string }; projectName: string; projectStatus: string }[];
  signatures: { id: string; projectId: string; status: string; signedAt: string; signerFullName: string; hasCopy: string | null }[];
  recentDownloads: { documentId: string; kind: string; watermarked: boolean; createdAt: string }[];
  timeline: { id: string; action: string; result: string; createdAt: string; actorEmail: string | null }[];
}

interface ProjectOption { id: string; name: string; status: string }

export default function AdminInvestorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<Detail | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [grantProject, setGrantProject] = useState('');
  const [grantLevel, setGrantLevel] = useState<'full' | 'generic'>('full');

  const load = useCallback(async () => {
    const [d, p] = await Promise.all([
      fetchJson<Detail>(`/api/dataroom/admin/investors/${id}`),
      fetchJson<{ projects: ProjectOption[] }>(`/api/dataroom/admin/projects`),
    ]);
    if (d.ok && d.data) setData(d.data);
    else setError(d.error ?? 'error');
    if (p.ok && p.data) setProjects(p.data.projects);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function action(name: string, body: Record<string, unknown>) {
    setBusy(name);
    setMsg(null);
    const res = await fetchJson(`/api/dataroom/admin/investors/${id}`, {
      method: 'PATCH', body: JSON.stringify(body),
    });
    setBusy(null);
    if (res.ok) { setMsg('Acción completada.'); load(); }
    else setMsg(`Error: ${res.error}`);
  }

  async function grant() {
    if (!grantProject) return;
    setBusy('grant');
    const res = await fetchJson(`/api/dataroom/admin/investors/${id}/projects`, {
      method: 'POST', body: JSON.stringify({ projectId: grantProject, accessLevel: grantLevel, notify: true }),
    });
    setBusy(null);
    if (res.ok) { setGrantProject(''); load(); } else setMsg(`Error: ${res.error}`);
  }

  async function revoke(projectId: string) {
    if (!confirm('¿Retirar el acceso a este proyecto? La revocación es inmediata.')) return;
    setBusy(`revoke:${projectId}`);
    const res = await fetchJson(`/api/dataroom/admin/investors/${id}/projects`, {
      method: 'DELETE', body: JSON.stringify({ projectId, notify: true }),
    });
    setBusy(null);
    if (res.ok) load(); else setMsg(`Error: ${res.error}`);
  }

  async function deleteInvestor() {
    if (!confirm('¿Eliminar este inversor? Perderá el acceso al instante y sus invitaciones quedarán revocadas. El histórico se conserva en auditoría.')) return;
    setBusy('delete');
    const res = await fetchJson(`/api/dataroom/admin/investors/${id}`, { method: 'DELETE' });
    setBusy(null);
    if (res.ok) router.push('/dataroom/admin/investors');
    else setMsg(`Error: ${res.error}`);
  }

  if (error) return <ErrorBox message="Inversor no encontrado." />;
  if (!data) return <Spinner label="Cargando ficha…" />;

  const inv = data.investor;
  const section = 'border border-[#1c3742]/15 bg-white p-5';
  const h = 'mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50';
  const btn = 'border border-[#1c3742]/30 px-3 py-1.5 text-xs hover:bg-[#1c3742]/5 disabled:opacity-40';

  return (
    <div className="space-y-6">
      <Link href="/dataroom/admin/investors" className="text-xs text-[#1c3742]/50 hover:text-[#1c3742]">← Inversores</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-playfair text-2xl">{[inv.firstName, inv.lastName].filter(Boolean).join(' ') || inv.email}</h1>
        <Badge value={inv.status} />
      </div>
      {msg && <p className="text-sm text-[#8a5a33]">{msg}</p>}

      <div className="flex flex-wrap gap-2">
        {(inv.status === 'draft' || inv.status === 'invitation_expired' || inv.status === 'invitation_revoked' || inv.status === 'disabled') && (
          <button className={btn} disabled={!!busy} onClick={() => action('invite', { action: 'invite' })}>Enviar invitación</button>
        )}
        {inv.status === 'invited' && (
          <>
            <button className={btn} disabled={!!busy} onClick={() => action('resend', { action: 'resend_invitation' })}>Reenviar invitación</button>
            <button className={btn} disabled={!!busy} onClick={() => action('revoke_inv', { action: 'revoke_invitation' })}>Revocar invitación</button>
          </>
        )}
        {inv.status === 'active' && (
          <button className={btn} disabled={!!busy} onClick={() => action('suspend', { action: 'suspend' })}>Suspender</button>
        )}
        {inv.status === 'suspended' && (
          <button className={btn} disabled={!!busy} onClick={() => action('reactivate', { action: 'reactivate' })}>Reactivar</button>
        )}
        {inv.status !== 'disabled' && (
          <button className={`${btn} border-red-300 text-red-700`} disabled={!!busy}
            onClick={() => confirm('¿Desactivar definitivamente? Se revocarán sus sesiones.') && action('disable', { action: 'disable' })}>
            Desactivar
          </button>
        )}
        <button
          className="ml-auto border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-40"
          disabled={!!busy}
          onClick={deleteInvestor}
        >
          Eliminar inversor
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={section}>
          <h2 className={h}>Datos</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-[#1c3742]/50">Email</dt><dd>{inv.email}</dd>
            <dt className="text-[#1c3742]/50">Teléfono</dt><dd>{inv.phone ?? '—'}</dd>
            <dt className="text-[#1c3742]/50">Empresa</dt><dd>{inv.company ?? '—'}</dd>
            <dt className="text-[#1c3742]/50">País</dt><dd>{inv.country ?? '—'}</dd>
            <dt className="text-[#1c3742]/50">Tipo</dt><dd>{inv.investorType ?? '—'}</dd>
            <dt className="text-[#1c3742]/50">Idioma</dt><dd>{inv.language}</dd>
            <dt className="text-[#1c3742]/50">Activado</dt><dd>{formatDate(inv.activatedAt)}</dd>
            <dt className="text-[#1c3742]/50">Último acceso</dt><dd>{formatDate(inv.lastAccessAt)}</dd>
            <dt className="text-[#1c3742]/50">Términos</dt><dd>{inv.termsVersion ?? '—'}</dd>
          </dl>
          {inv.internalNotes && (
            <p className="mt-3 bg-[#faf9f5] p-3 text-xs text-[#1c3742]/70">{inv.internalNotes}</p>
          )}
        </section>

        <section className={section}>
          <h2 className={h}>Proyectos asignados</h2>
          <div className="mb-3 flex gap-2">
            <select value={grantProject} onChange={(e) => setGrantProject(e.target.value)}
              className="flex-1 border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-1.5 text-xs">
              <option value="">Asignar proyecto…</option>
              {projects
                .filter((p) => !data.assignments.some((a) => a.access.projectId === p.id && a.access.status === 'active'))
                .map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={grantLevel} onChange={(e) => setGrantLevel(e.target.value as 'full' | 'generic')}
              className="border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-1.5 text-xs">
              <option value="full">Acceso completo</option>
              <option value="generic">Solo genérico</option>
            </select>
            <button onClick={grant} disabled={!grantProject || !!busy} className={btn}>Asignar</button>
          </div>
          {data.assignments.length === 0 ? (
            <p className="text-sm text-[#1c3742]/50">Sin proyectos asignados.</p>
          ) : (
            <ul className="space-y-2">
              {data.assignments.map((a) => (
                <li key={a.access.projectId} className="flex items-center justify-between gap-2 bg-[#faf9f5] px-3 py-2 text-sm">
                  <div>
                    <Link href={`/dataroom/admin/projects/${a.access.projectId}`} className="hover:underline">{a.projectName}</Link>
                    <span className="ml-2 text-xs text-[#1c3742]/40">{STATUS_LABELS[a.access.accessLevel] ?? a.access.accessLevel} · desde {formatDate(a.access.grantedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge value={a.access.status} />
                    {a.access.status === 'active' && (
                      <button onClick={() => revoke(a.access.projectId)} disabled={!!busy}
                        className="text-xs text-red-700 hover:underline">Revocar</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={section}>
          <h2 className={h}>Invitaciones</h2>
          {data.invitations.length === 0 ? <p className="text-sm text-[#1c3742]/50">Sin invitaciones.</p> : (
            <ul className="space-y-1 text-sm">
              {data.invitations.map((i) => (
                <li key={i.id} className="flex items-center justify-between bg-[#faf9f5] px-3 py-2">
                  <span className="text-xs text-[#1c3742]/60">Creada {formatDate(i.createdAt)} · caduca {formatDate(i.expiresAt)}</span>
                  <Badge value={i.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={section}>
          <h2 className={h}>NDA firmados</h2>
          {data.signatures.length === 0 ? <p className="text-sm text-[#1c3742]/50">Sin firmas registradas.</p> : (
            <ul className="space-y-1 text-sm">
              {data.signatures.map((s) => (
                <li key={s.id} className="flex items-center justify-between bg-[#faf9f5] px-3 py-2">
                  <span className="text-xs text-[#1c3742]/60">{s.signerFullName} · {formatDate(s.signedAt)}</span>
                  <div className="flex items-center gap-2">
                    <Badge value={s.status} />
                    {s.hasCopy && (
                      <button
                        className="text-xs text-[#1c3742]/70 hover:underline"
                        onClick={async () => {
                          const res = await fetchJson<{ url: string }>(`/api/dataroom/admin/projects/${s.projectId}?ndaCopy=${s.id}`);
                          if (res.ok && res.data?.url) window.open(res.data.url, '_blank', 'noopener');
                        }}
                      >
                        Copia firmada
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${section} lg:col-span-2`}>
          <h2 className={h}>Actividad reciente</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs text-[#1c3742]/50">Accesos a documentos</p>
              {data.recentDownloads.length === 0 ? <p className="text-sm text-[#1c3742]/50">Sin accesos.</p> : (
                <ul className="space-y-1 text-xs text-[#1c3742]/70">
                  {data.recentDownloads.map((d, i) => (
                    <li key={i}>{formatDate(d.createdAt)} — {d.kind === 'download' ? 'Descarga' : 'Vista'}{d.watermarked ? ' (marca de agua)' : ''}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs text-[#1c3742]/50">Timeline</p>
              <ul className="space-y-1 text-xs text-[#1c3742]/70">
                {data.timeline.map((t) => (
                  <li key={t.id}>
                    {formatDate(t.createdAt)} — {actionLabel(t.action)}
                    {t.result !== 'success' && <span className="text-red-700"> ({t.result})</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
