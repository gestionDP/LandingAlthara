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
  const [kyc, setKyc] = useState<{ state: string; submitted: boolean; rejectionReason: string | null } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setKyc(null);
    const res = await fetchJson<PortalData & { admin?: boolean; reviewer?: string; linked?: boolean; pendingActivation?: boolean; kyc?: { state: string; submitted: boolean; rejectionReason: string | null } }>('/api/dataroom/me');
    if (res.ok && res.data?.admin) {
      router.replace('/dataroom/admin');
      return;
    }
    if (res.ok && res.data?.reviewer) {
      router.replace('/dataroom/review');
      return;
    }
    if (res.ok && res.data?.linked) {
      // Cuenta recién vinculada: recargamos el portal.
      const retry = await fetchJson<PortalData>('/api/dataroom/me');
      if (retry.ok && retry.data) { setData(retry.data); setLoading(false); return; }
    }
    if (res.ok && res.data?.kyc) {
      setKyc(res.data.kyc);
      setLoading(false);
      return;
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
  if (kyc) return <KycScreen kyc={kyc} onDone={load} />;
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
          className="border border-[#1c3742]/25 px-4 py-2 text-xs font-medium text-[#1c3742] transition-colors hover:bg-[#1c3742]/5 rounded-md"
        >
          Mi perfil
        </Link>
      </div>

      {data.pendingInvitations.length > 0 && (
        <section className="border border-[#c08552]/40 bg-[#c08552]/[0.06] p-5 rounded-lg">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a5a33]">
            Invitaciones pendientes
          </h2>
          <p className="mb-4 text-sm text-[#1c3742]/60">
            Le han invitado a estos proyectos. Acéptelos para acceder a su documentación.
          </p>
          <ul className="space-y-3">
            {data.pendingInvitations.map((inv) => (
              <li key={inv.projectId} className="flex flex-wrap items-center justify-between gap-3 border border-[#1c3742]/10 bg-white p-4 rounded-lg">
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
                    className="bg-[#1c3742] px-4 py-2 text-xs font-semibold text-[#e6e2d7] transition-colors hover:bg-[#c08552] disabled:opacity-40 rounded-md"
                  >
                    {respBusy === inv.projectId ? '…' : 'Aceptar'}
                  </button>
                  <button
                    onClick={() => respondInvitation(inv.projectId, 'reject')}
                    disabled={respBusy === inv.projectId}
                    className="border border-[#1c3742]/25 px-4 py-2 text-xs font-medium text-[#1c3742] transition-colors hover:bg-[#1c3742]/5 disabled:opacity-40 rounded-md"
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
                className="group flex flex-col border border-[#1c3742]/10 bg-white p-5 rounded-lg transition duration-200 hover:-translate-y-0.5 hover:border-[#1c3742]/25"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <FolderIconFilled className="h-10 w-10 shrink-0" />
                    <h3 className="font-playfair text-lg leading-snug">{p.name}</h3>
                  </div>
                  {p.newDocumentCount > 0 && (
                    <span className="bg-[#1c3742] px-2 py-0.5 text-[10px] font-semibold text-[#e6e2d7] rounded-full">
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
                  {/* Estado del proyecto: solo si afecta al inversor (pausado/cerrado).
                      Borrador/Publicado/Activo son estados internos del admin. */}
                  {['temporarily_unavailable', 'closed', 'archived'].includes(p.status) && <Badge value={p.status} />}
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
                <li key={n.id} className="border border-[#1c3742]/10 bg-white px-4 py-2.5 text-sm rounded-md">
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
                <li key={i} className="border border-[#1c3742]/10 bg-white px-4 py-2.5 text-sm rounded-md">
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

/** Pantalla de verificación de identidad (KYC) para inversores no activos. */
function KycScreen({ kyc, onDone }: { kyc: { state: string; submitted: boolean; rejectionReason: string | null }; onDone: () => void }) {
  if (kyc.state === 'pending_validation' && kyc.submitted) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-10 text-center">
        <h1 className="font-playfair text-2xl">Identidad en revisión</h1>
        <p className="text-sm text-[#1c3742]/70">
          Hemos recibido sus datos de verificación. Althara está revisando su identidad;
          le avisaremos en cuanto su acceso esté activo.
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="font-playfair text-2xl">Verificación de identidad</h1>
        <p className="mt-1 text-sm text-[#1c3742]/60">
          Para acceder a la documentación necesitamos verificar su identidad. Sus datos se guardan cifrados y los revisa Althara.
        </p>
      </div>
      {kyc.state === 'rejected' && kyc.rejectionReason && (
        <div className="border border-red-300 bg-red-50 p-3 text-sm text-red-800 rounded-lg">
          Su verificación fue rechazada: {kyc.rejectionReason}. Corrija sus datos y vuelva a enviarlos.
        </div>
      )}
      <KycForm onDone={onDone} />
    </div>
  );
}

function KycForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ documentType: 'dni', documentNumber: '', residenceCountry: 'ES', phone: '', ticketRange: '', experience: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const input = 'w-full border border-[#1c3742]/25 bg-white px-3 py-2 text-sm focus:border-[#1c3742]/50 focus:outline-none rounded-md';
  const label = 'mb-1 block text-xs font-medium uppercase tracking-wider text-[#1c3742]/60';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (f.documentNumber.trim().length < 3) return setErr('Introduzca su número de documento.');
    if (f.phone.trim().length < 5) return setErr('Introduzca un teléfono de contacto.');
    if (f.residenceCountry.trim().length !== 2) return setErr('País de residencia en código de 2 letras (ej. ES).');
    setBusy(true);
    const res = await fetchJson('/api/dataroom/kyc', {
      method: 'POST',
      body: JSON.stringify({
        documentType: f.documentType,
        documentNumber: f.documentNumber.trim(),
        phone: f.phone.trim(),
        residenceCountry: f.residenceCountry.trim().toUpperCase(),
        investorProfile: { ticketRange: f.ticketRange || undefined, experience: f.experience || undefined },
      }),
    });
    setBusy(false);
    if (res.ok) onDone(); else setErr('No se ha podido enviar. Inténtelo de nuevo.');
  }

  return (
    <form onSubmit={submit} className="space-y-4 border border-[#1c3742]/10 bg-white p-6 rounded-lg">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Tipo de documento *</label>
          <select className={input} value={f.documentType} onChange={(e) => setF({ ...f, documentType: e.target.value })}>
            <option value="dni">DNI</option>
            <option value="nie">NIE</option>
            <option value="passport">Pasaporte</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div>
          <label className={label}>Número de documento *</label>
          <input className={input} value={f.documentNumber} onChange={(e) => setF({ ...f, documentNumber: e.target.value })} />
        </div>
        <div>
          <label className={label}>País de residencia (ISO, ej. ES) *</label>
          <input maxLength={2} className={`${input} uppercase`} value={f.residenceCountry} onChange={(e) => setF({ ...f, residenceCountry: e.target.value.toUpperCase() })} />
        </div>
        <div>
          <label className={label}>Teléfono *</label>
          <input className={input} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        </div>
        <div>
          <label className={label}>Rango de ticket (opcional)</label>
          <input className={input} value={f.ticketRange} placeholder="p. ej. 100k–500k" onChange={(e) => setF({ ...f, ticketRange: e.target.value })} />
        </div>
        <div>
          <label className={label}>Experiencia (opcional)</label>
          <input className={input} value={f.experience} onChange={(e) => setF({ ...f, experience: e.target.value })} />
        </div>
      </div>
      {err && <p className="text-sm text-red-700">{err}</p>}
      <button type="submit" disabled={busy} className="bg-[#1c3742] px-6 py-2.5 text-sm font-semibold text-[#e6e2d7] disabled:opacity-40 rounded-md">
        {busy ? 'Enviando…' : 'Enviar verificación'}
      </button>
    </form>
  );
}
