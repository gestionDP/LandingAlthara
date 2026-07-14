'use client';

/** Investor portal home: greeting, project cards, notifications, recent access. */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJson, Spinner, ErrorBox, EmptyState, Badge, formatDate, FolderIconFilled } from './components/ui';

interface PortalData {
  investor: { firstName: string | null; email: string; status: string };
  projects: {
    id: string; name: string; description: string | null; status: string;
    investmentType: string | null; documentCount: number; newDocumentCount: number;
    accessStatus: string; ndaState: string; updatedAt: string;
  }[];
  notifications: { id: string; type: string; payload: { projectName?: string; count?: number } | null; createdAt: string; readAt: string | null }[];
  recentAccess: { documentId: string; kind: string; createdAt: string }[];
  pendingInvitations: { projectId: string; name: string; investmentType: string | null; description: string | null; grantedAt: string; accessLevel: string }[];
}

export default function DataroomHome() {
  const router = useRouter();
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [respBusy, setRespBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchJson<PortalData & { admin?: boolean; linked?: boolean; pendingActivation?: boolean }>('/api/dataroom/me');
    if (res.ok && res.data?.admin) {
      router.replace('/dataroom/admin');
      return;
    }
    if (res.ok && res.data?.linked) {
      // Cuenta recién vinculada: recargamos el portal.
      const retry = await fetchJson<PortalData>('/api/dataroom/me');
      if (retry.ok && retry.data) { setData(retry.data); setLoading(false); return; }
    }
    if (res.ok && res.data?.pendingActivation) {
      setError('pending_activation');
      setLoading(false);
      return;
    }
    if (res.ok && res.data) setData(res.data);
    else if (res.status === 403) setError('forbidden');
    else setError(res.error ?? 'error');
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function respondInvitation(projectId: string, action: 'accept' | 'reject') {
    setRespBusy(projectId);
    const res = await fetchJson(`/api/dataroom/projects/${projectId}/access`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
    setRespBusy(null);
    if (res.ok) load();
  }

  if (loading) return <Spinner label="Cargando su portal…" />;
  if (error === 'pending_activation') {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-10 text-center">
        <h1 className="font-playfair text-2xl">Su invitación está pendiente de activar</h1>
        <p className="text-sm text-[#1c3742]/70">
          Ha iniciado sesión, pero su cuenta de inversor aún no está activada. Abra el email
          de invitación de Althara y pulse <strong>«Activar mi cuenta»</strong> para completar
          sus datos. Si el enlace ha caducado, pida a su gestor que se lo reenvíe.
        </p>
      </div>
    );
  }
  if (error === 'forbidden' || (error && error.startsWith('account_'))) {
    return (
      <ErrorBox message="Su cuenta no tiene acceso activo al portal de inversores. Si cree que se trata de un error, contacte con su gestor en Althara." />
    );
  }
  if (error || !data) return <ErrorBox message="No hemos podido cargar su portal." onRetry={load} />;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-playfair text-3xl">
            Bienvenido{data.investor.firstName ? `, ${data.investor.firstName}` : ''}
          </h1>
          <p className="mt-1 text-sm text-[#1c3742]/60">
            Cuenta <Badge value={data.investor.status} /> · {data.investor.email}
          </p>
        </div>
        <Link
          href="/dataroom/profile"
          className="border border-[#1c3742]/25 px-4 py-2 text-xs font-medium text-[#1c3742] transition-colors hover:bg-[#1c3742]/5"
        >
          Mi perfil
        </Link>
      </div>

      {data.pendingInvitations.length > 0 && (
        <section className="border border-[#c08552]/40 bg-[#c08552]/[0.06] p-5">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a5a33]">
            Invitaciones pendientes
          </h2>
          <p className="mb-4 text-sm text-[#1c3742]/60">
            Le han invitado a estos proyectos. Acéptelos para acceder a su documentación.
          </p>
          <ul className="space-y-3">
            {data.pendingInvitations.map((inv) => (
              <li key={inv.projectId} className="flex flex-wrap items-center justify-between gap-3 border border-[#1c3742]/10 bg-white p-4">
                <div className="min-w-0">
                  <p className="font-playfair text-lg leading-snug">{inv.name}</p>
                  <p className="text-[11px] uppercase tracking-wider text-[#1c3742]/50">
                    {inv.investmentType ?? 'Proyecto de inversión'} · invitación del {formatDate(inv.grantedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => respondInvitation(inv.projectId, 'accept')}
                    disabled={respBusy === inv.projectId}
                    className="bg-[#1c3742] px-4 py-2 text-xs font-semibold text-[#e6e2d7] transition-colors hover:bg-[#c08552] disabled:opacity-40"
                  >
                    {respBusy === inv.projectId ? '…' : 'Aceptar'}
                  </button>
                  <button
                    onClick={() => respondInvitation(inv.projectId, 'reject')}
                    disabled={respBusy === inv.projectId}
                    className="border border-[#1c3742]/25 px-4 py-2 text-xs font-medium text-[#1c3742] transition-colors hover:bg-[#1c3742]/5 disabled:opacity-40"
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50">
          Sus proyectos
        </h2>
        {data.projects.length === 0 ? (
          <EmptyState
            title="Todavía no tiene proyectos asignados"
            subtitle="Cuando Althara le asigne un proyecto, aparecerá aquí y recibirá una notificación por email."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.projects.map((p) => (
              <Link
                key={p.id}
                href={`/dataroom/projects/${p.id}`}
                className="group flex flex-col border border-[#1c3742]/10 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <FolderIconFilled className="h-10 w-10 shrink-0" />
                    <h3 className="font-playfair text-lg leading-snug">{p.name}</h3>
                  </div>
                  {p.newDocumentCount > 0 && (
                    <span className="bg-[#1c3742] px-2 py-0.5 text-[10px] font-semibold text-[#e6e2d7]">
                      {p.newDocumentCount} nuevo{p.newDocumentCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {p.investmentType && (
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-[#1c3742]/50">{p.investmentType}</p>
                )}
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-[#1c3742]/70">
                  {p.description ?? 'Sin descripción.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <Badge value={p.status} />
                  <Badge value={p.ndaState} />
                  <span className="ml-auto text-[#1c3742]/50">
                    {p.documentCount} doc{p.documentCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="mt-4 text-xs font-medium text-[#1c3742]/70 group-hover:text-[#1c3742]">
                  Abrir data room →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50">
            Notificaciones
          </h2>
          {data.notifications.length === 0 ? (
            <p className="text-sm text-[#1c3742]/50">Sin notificaciones recientes.</p>
          ) : (
            <ul className="space-y-2">
              {data.notifications.map((n) => (
                <li key={n.id} className="border border-[#1c3742]/10 bg-white px-4 py-2.5 text-sm">
                  {n.type === 'new_documents' || n.type === 'new_version'
                    ? `${n.payload?.count ?? 1} documento(s) nuevo(s) en ${n.payload?.projectName ?? 'un proyecto'}`
                    : n.type}
                  <span className="ml-2 text-xs text-[#1c3742]/40">{formatDate(n.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50">
            Sus accesos recientes
          </h2>
          {data.recentAccess.length === 0 ? (
            <p className="text-sm text-[#1c3742]/50">Todavía no ha consultado documentos.</p>
          ) : (
            <ul className="space-y-2">
              {data.recentAccess.map((a, i) => (
                <li key={i} className="border border-[#1c3742]/10 bg-white px-4 py-2.5 text-sm">
                  {a.kind === 'download' ? 'Descarga' : 'Previsualización'} de documento
                  <span className="ml-2 text-xs text-[#1c3742]/40">{formatDate(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
