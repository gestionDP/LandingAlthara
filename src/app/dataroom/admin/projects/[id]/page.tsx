'use client';

/**
 * Admin — detalle de proyecto con flujo guiado:
 * 1) NDA → 2) Inversores → 3) Documentos → 4) Activar.
 * Todo se gestiona desde esta página: asignar/revocar inversores, subir,
 * publicar, versionar, notificar y eliminar.
 */
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchJson, Spinner, ErrorBox, Badge, STATUS_LABELS, actionLabel, formatDate, formatBytes,
  FileIcon, accessLevelLabel, ACCESS_LEVEL_HINTS, FolderGlyph, FolderIconFilled, LibrarySearch, ViewToggle,
  KebabMenu, DocViewer, type MenuItem,
} from '../../../components/ui';
import { useDataroomSearch } from '../../../DataroomShell';

interface Detail {
  project: {
    id: string; name: string; description: string | null; internalCode: string | null;
    status: string; investmentType: string | null; ownerName: string | null;
    ndaRequired: boolean; ndaPolicy: string; updatedAt: string;
  };
  investors: { access: { status: string; accessLevel: string; grantedAt: string }; investorId: string; email: string; firstName: string | null; lastName: string | null; investorStatus: string }[];
  documents: { id: string; title: string; status: string; confidentiality: string; downloadable: boolean; requiresNda: boolean; updatedAt: string; categoryId: string | null }[];
  categories: { id: string; name: string; slug: string }[];
  ndaVersions: { id: string; version: number; title: string; active: boolean; createdAt: string }[];
  signatures: { id: string; investorId: string; status: string; signedAt: string; signerFullName: string; hasCopy: string | null }[];
  activity: { id: string; action: string; result: string; createdAt: string; actorEmail: string | null }[];
}

interface InvestorOption { id: string; email: string; firstName: string | null; lastName: string | null; status: string }

const PROJECT_STATUSES = ['draft', 'active', 'temporarily_unavailable', 'closed', 'archived'];

export default function AdminProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<Detail | null>(null);
  const [allInvestors, setAllInvestors] = useState<InvestorOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [docSearch, setDocSearch] = useState('');
  const [docFolder, setDocFolder] = useState<string | null>(null);
  const [docView, setDocView] = useState<'list' | 'grid'>('list');
  const [shareDoc, setShareDoc] = useState<{ id: string; title: string; confidentiality: string } | null>(null);
  const [viewer, setViewer] = useState<{ title: string; src: string; mimeType?: string | null; docId: string } | null>(null);

  const load = useCallback(async () => {
    const [d, inv] = await Promise.all([
      fetchJson<Detail>(`/api/dataroom/admin/projects/${id}`),
      fetchJson<{ investors: InvestorOption[] }>(`/api/dataroom/admin/investors`),
    ]);
    if (d.ok && d.data) setData(d.data);
    else setError(d.error ?? 'error');
    if (inv.ok && inv.data) setAllInvestors(inv.data.investors);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const globalSearch = useDataroomSearch();

  // Navegación por carpetas (categorías) estilo SharePoint.
  const docNav = useMemo(() => {
    const docs = data?.documents ?? [];
    const cats = data?.categories ?? [];
    const q = (docSearch.trim() || globalSearch.trim()).toLowerCase();
    const searching = q.length > 0;
    const catsWithDocs = cats
      .filter((c) => docs.some((d) => d.categoryId === c.id))
      .map((c) => ({ id: c.id, name: c.name, count: docs.filter((d) => d.categoryId === c.id).length }));
    const currentName = docFolder ? (cats.find((c) => c.id === docFolder)?.name ?? null) : null;

    if (searching) return { folders: [], docs: docs.filter((d) => d.title.toLowerCase().includes(q)), currentName };
    if (docFolder) return { folders: [], docs: docs.filter((d) => d.categoryId === docFolder), currentName };
    return { folders: catsWithDocs, docs: docs.filter((d) => !d.categoryId), currentName: null };
  }, [data, docSearch, globalSearch, docFolder]);

  async function patch(body: Record<string, unknown>, okMsg = 'Guardado.') {
    setBusy(true);
    setMsg(null);
    const res = await fetchJson(`/api/dataroom/admin/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
    setBusy(false);
    if (res.ok) { setMsg(okMsg); load(); } else setMsg(`Error: ${res.error}`);
  }

  async function docAction(docId: string, action: string) {
    const res = await fetchJson(`/api/dataroom/admin/documents/${docId}`, {
      method: 'PATCH', body: JSON.stringify({ action }),
    });
    if (res.ok) load(); else setMsg(`Error: ${res.error}`);
  }

  async function openPreview(id: string, title: string) {
    setMsg(null);
    const res = await fetchJson<{ url: string; mimeType: string | null }>(`/api/dataroom/admin/documents/${id}/file?kind=preview`);
    if (res.ok && res.data?.url) setViewer({ title, src: res.data.url, mimeType: res.data.mimeType, docId: id });
    else setMsg('No se ha podido abrir el documento.');
  }

  async function downloadDoc(id: string) {
    setMsg(null);
    const res = await fetchJson<{ url: string }>(`/api/dataroom/admin/documents/${id}/file?kind=download`);
    if (res.ok && res.data?.url) window.open(res.data.url, '_blank', 'noopener');
    else setMsg('No se ha podido descargar el documento.');
  }

  async function deleteDoc(docId: string, title: string) {
    if (!confirm(`¿Eliminar «${title}»? Dejará de ser visible para todos (el registro se conserva en auditoría).`)) return;
    const res = await fetchJson(`/api/dataroom/admin/documents/${docId}`, { method: 'DELETE' });
    if (res.ok) load(); else setMsg(`Error: ${res.error}`);
  }

  async function deleteProject() {
    if (!confirm(`¿Eliminar el proyecto «${data?.project.name}»? Los inversores perderán el acceso inmediatamente.`)) return;
    setBusy(true);
    const res = await fetchJson(`/api/dataroom/admin/projects/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (res.ok) router.push('/dataroom/admin/projects');
    else setMsg(`Error: ${res.error}`);
  }

  if (error) return <ErrorBox message="Proyecto no encontrado." />;
  if (!data) return <Spinner label="Cargando proyecto…" />;

  const p = data.project;
  const activeInvestors = data.investors.filter((i) => i.access.status === 'active');
  const assignedInvestors = data.investors.filter((i) => i.access.status !== 'revoked');
  const publishedDocs = data.documents.filter((d) => d.status === 'published');
  const hasNda = data.ndaVersions.some((v) => v.active);

  // Pasos del flujo de puesta en marcha
  const steps = [
    ...(p.ndaRequired ? [{ label: 'Publicar el NDA global', done: hasNda, action: () => router.push('/dataroom/admin/nda'), cta: 'Ir al NDA' }] : []),
    { label: 'Asignar inversores', done: assignedInvestors.length > 0, cta: 'Abajo ↓' },
    { label: 'Subir y publicar documentos', done: publishedDocs.length > 0, cta: 'Abajo ↓' },
    { label: 'Activar el proyecto', done: p.status === 'active', action: () => patch({ action: 'update', data: { status: 'active' } }, 'Proyecto activado.'), cta: 'Activar' },
  ];
  const setupPending = steps.some((s) => !s.done);

  const section = 'border border-[#1c3742]/10 bg-white p-5 shadow-sm';
  const h = 'mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50';

  return (
    <div className="space-y-6">
      <Link href="/dataroom/admin/projects" className="text-xs text-[#1c3742]/50 hover:text-[#1c3742]">← Proyectos</Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-playfair text-2xl">{p.name}</h1>
        <Badge value={p.status} />
        <select
          value={p.status}
          disabled={busy}
          onChange={(e) => patch({ action: 'update', data: { status: e.target.value } }, 'Estado actualizado.')}
          className="border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-1 text-xs"
        >
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>)}
        </select>
        <button
          onClick={deleteProject}
          disabled={busy}
          className="ml-auto border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-40"
        >
          Eliminar proyecto
        </button>
      </div>
      {msg && <p className="text-sm font-medium text-[#8a5a33]">{msg}</p>}

      {/* Flujo guiado de puesta en marcha */}
      {setupPending && (
        <div className="border border-[#c08552]/40 bg-[#c08552]/10 p-5">
          <p className="text-sm font-semibold text-[#1c3742]">Puesta en marcha del proyecto</p>
          <p className="mt-1 text-xs text-[#1c3742]/60">
            Los inversores solo verán el proyecto cuando esté <strong>Activo</strong>, tenga inversores asignados y documentos publicados.
          </p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={i} className={`flex items-center gap-3 border p-3 text-sm ${s.done ? 'border-[#1c3742]/30 bg-[#1c3742]/5' : 'border-[#1c3742]/15 bg-white'}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold ${s.done ? 'bg-[#1c3742] text-[#e6e2d7]' : 'bg-[#1c3742]/10 text-[#1c3742]'}`}>
                  {s.done ? '✓' : i + 1}
                </span>
                <span className={s.done ? 'text-[#1c3742] font-medium' : 'text-[#1c3742]'}>{s.label}</span>
                {!s.done && s.action && (
                  <button onClick={s.action} className="ml-auto shrink-0 bg-[#1c3742] px-2.5 py-1 text-[11px] font-semibold text-[#e6e2d7]">
                    {s.cta}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 1. Inversores — asignación directa desde el proyecto */}
      <section className={section}>
        <h2 className={h}>Inversores con acceso ({activeInvestors.length})</h2>
        <AssignInvestor
          projectId={id}
          allInvestors={allInvestors}
          assigned={data.investors}
          onChanged={load}
          onError={(e) => setMsg(`Error: ${e}`)}
        />
        {data.investors.length === 0 ? (
          <p className="mt-3 text-sm text-[#1c3742]/50">
            Nadie tiene acceso todavía. Asigne el primer inversor con el selector de arriba.
          </p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {data.investors.map((i) => (
              <li key={i.investorId} className="flex items-center justify-between gap-2 bg-[#faf9f5] px-3 py-2">
                <Link href={`/dataroom/admin/investors/${i.investorId}`} className="hover:underline">
                  {[i.firstName, i.lastName].filter(Boolean).join(' ') || i.email}
                  <span className="ml-2 text-xs text-[#1c3742]/40" title={ACCESS_LEVEL_HINTS[i.access.accessLevel]}>
                    {accessLevelLabel(i.access.accessLevel)} · desde {formatDate(i.access.grantedAt)}
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                  <Badge value={i.access.status} />
                  {(i.access.status === 'active' || i.access.status === 'pending') && (
                    <button
                      onClick={async () => {
                        if (!confirm(i.access.status === 'pending' ? '¿Cancelar la invitación?' : '¿Retirar el acceso? Es inmediato.')) return;
                        const res = await fetchJson(`/api/dataroom/admin/investors/${i.investorId}/projects`, {
                          method: 'DELETE', body: JSON.stringify({ projectId: id, notify: true }),
                        });
                        if (res.ok) load();
                      }}
                      className="text-xs text-red-700 hover:underline"
                    >
                      {i.access.status === 'pending' ? 'Cancelar' : 'Revocar'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 2. NDA (global, común a todo el portal) */}
      <section className={section}>
        <h2 className={h}>NDA</h2>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2 text-xs text-[#1c3742]/70">
            <input
              type="checkbox"
              checked={p.ndaRequired}
              disabled={busy}
              onChange={(e) => patch({ action: 'update', data: { ndaRequired: e.target.checked } }, 'NDA actualizado.')}
            />
            Este proyecto requiere el NDA del portal
          </label>
          {p.ndaRequired && (
            <span className="text-xs text-[#1c3742]/50">
              {hasNda
                ? `NDA global publicado · ${data.signatures.filter((s) => s.status === 'signed').length} firma(s) en este proyecto`
                : 'El NDA global aún no está publicado'}
            </span>
          )}
          <Link href="/dataroom/admin/nda" className="ml-auto text-xs text-[#1c3742]/70 underline hover:text-[#1c3742]">
            Gestionar el NDA del portal →
          </Link>
        </div>
        {p.ndaRequired && !hasNda && (
          <p className="mt-2 border border-[#c08552]/40 bg-[#c08552]/10 p-3 text-xs text-[#8a5a33]">
            Sin NDA publicado, los inversores no podrán desbloquear la documentación confidencial.
          </p>
        )}
        {p.ndaRequired && (
          <div className="mt-4">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-[#1c3742]/45">Firmas del NDA en este proyecto</p>
            {data.signatures.filter((s) => s.status === 'signed').length === 0 ? (
              <p className="text-xs text-[#1c3742]/50">Todavía no hay firmas.</p>
            ) : (
              <ul className="space-y-1">
                {data.signatures.filter((s) => s.status === 'signed').map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-2 border border-[#1c3742]/10 bg-[#faf9f5] px-3 py-2 text-sm">
                    <span className="font-medium">{s.signerFullName}</span>
                    <Badge value="signed" />
                    <span className="text-xs text-[#1c3742]/50">Firmado el {formatDate(s.signedAt)}</span>
                    {s.hasCopy && <span className="ml-auto text-[11px] text-[#1c3742]/45">Copia registrada</span>}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[11px] text-[#1c3742]/45">
              El NDA es único para todo el portal: una sola firma desbloquea toda la documentación confidencial de los proyectos que lo requieren (no se firma archivo por archivo).
            </p>
          </div>
        )}
      </section>

      {/* 3. Documentos */}
      <UploadPanel projectId={id} categories={data.categories} investors={activeInvestors} onUploaded={load} />

      {/* Biblioteca de documentos — estilo SharePoint (carpetas navegables) */}
      <section className="border border-[#1c3742]/10 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#1c3742]/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-1.5 text-sm">
            <FolderGlyph className="h-5 w-5 shrink-0 text-[#c08552]" />
            <button type="button" onClick={() => { setDocFolder(null); setDocSearch(''); }} className="font-medium text-[#1c3742] hover:underline">Documentos</button>
            {docNav.currentName && (
              <>
                <span className="text-[#1c3742]/35">›</span>
                <span className="truncate font-medium text-[#1c3742]">{docNav.currentName}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {data.documents.length > 0 && <LibrarySearch value={docSearch} onChange={setDocSearch} />}
            <ViewToggle view={docView} onChange={setDocView} />
          </div>
        </div>

        {data.documents.length === 0 ? (
          <p className="p-4 text-sm text-[#1c3742]/50">Todavía no hay documentos. Súbalos con el panel de arriba.</p>
        ) : docNav.folders.length === 0 && docNav.docs.length === 0 ? (
          <p className="p-4 text-sm text-[#1c3742]/50">{docSearch ? 'Sin resultados para la búsqueda.' : 'Esta carpeta está vacía.'}</p>
        ) : docView === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
            {docNav.folders.map((f) => (
              <button key={f.id} type="button" onClick={() => setDocFolder(f.id)}
                className="flex items-center gap-3 border border-[#1c3742]/12 bg-white p-3 text-left transition-colors hover:bg-[#1c3742]/[0.03]">
                <FolderIconFilled className="h-10 w-10 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[#1c3742]">{f.name}</span>
                  <span className="block text-[11px] text-[#1c3742]/45">{f.count} elemento(s)</span>
                </span>
              </button>
            ))}
            {docNav.docs.map((d) => (
              <AdminDocRow key={d.id} view="grid" d={d} onPreview={openPreview} onDownload={downloadDoc} onShare={setShareDoc} docAction={docAction} deleteDoc={deleteDoc} reload={load} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1c3742]/10 bg-[#1c3742]/[0.03] text-left text-[11px] uppercase tracking-wider text-[#1c3742]/55">
                  <th className="px-4 py-2.5 font-semibold">Nombre</th>
                  <th className="px-4 py-2.5 font-semibold">Estado</th>
                  <th className="px-4 py-2.5 font-semibold">Modificado</th>
                  <th className="px-4 py-2.5 font-semibold">Modificado por</th>
                  <th className="w-10 px-2 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {docNav.folders.map((f) => (
                  <tr key={f.id} onClick={() => setDocFolder(f.id)} className="cursor-pointer border-b border-[#1c3742]/[0.07] hover:bg-[#1c3742]/[0.04]">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <FolderIconFilled className="h-8 w-8 shrink-0" />
                        <span className="truncate font-medium text-[#1c3742] hover:underline">{f.name}</span>
                        <span className="text-xs text-[#1c3742]/40">{f.count}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5" />
                    <td className="px-4 py-2.5 text-[#1c3742]/60">—</td>
                    <td className="px-4 py-2.5 text-[#1c3742]/60">Althara</td>
                    <td className="px-2 py-2.5" />
                  </tr>
                ))}
                {docNav.docs.map((d) => (
                  <AdminDocRow key={d.id} view="list" d={d} onPreview={openPreview} onDownload={downloadDoc} onShare={setShareDoc} docAction={docAction} deleteDoc={deleteDoc} reload={load} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={section}>
        <h2 className={h}>Actividad</h2>
        <ul className="max-h-64 space-y-1 overflow-auto pr-1 text-xs text-[#1c3742]/70">
          {data.activity.map((a) => (
            <li key={a.id}>
              {formatDate(a.createdAt)} — {actionLabel(a.action)}
              {a.actorEmail ? ` · ${a.actorEmail}` : ''}
              {a.result !== 'success' && <span className="text-red-700"> (denegado)</span>}
            </li>
          ))}
        </ul>
      </section>

      {shareDoc && (
        <ShareDialog
          doc={shareDoc}
          investors={activeInvestors}
          onClose={() => setShareDoc(null)}
        />
      )}
      {viewer && (
        <DocViewer
          title={viewer.title}
          src={viewer.src}
          mimeType={viewer.mimeType}
          onClose={() => setViewer(null)}
          onDownload={() => downloadDoc(viewer.docId)}
        />
      )}
    </div>
  );
}

/**
 * Compartir un archivo con inversores concretos (estilo Google Drive).
 * Cada inversor puede estar en "Ver" (permitido), "Bloquear" (denegado) o
 * "Automático" (según su nivel de acceso y la confidencialidad del archivo).
 */
function ShareDialog({ doc, investors, onClose }: {
  doc: { id: string; title: string; confidentiality: string };
  investors: Detail['investors'];
  onClose: () => void;
}) {
  const [perms, setPerms] = useState<Record<string, 'allow' | 'deny'>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadPerms = useCallback(async () => {
    const res = await fetchJson<{ permissions: { perm: { investorId: string; effect: 'allow' | 'deny' } }[] }>(
      `/api/dataroom/admin/documents/${doc.id}`,
    );
    const map: Record<string, 'allow' | 'deny'> = {};
    if (res.ok && res.data?.permissions) {
      for (const p of res.data.permissions) map[p.perm.investorId] = p.perm.effect;
    }
    setPerms(map);
    setLoading(false);
  }, [doc.id]);

  useEffect(() => { loadPerms(); }, [loadPerms]);

  async function setEffect(investorId: string, effect: 'allow' | 'deny' | 'clear') {
    setSavingId(investorId);
    const res = await fetchJson(`/api/dataroom/admin/documents/${doc.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'set_permission', permission: { investorId, effect } }),
    });
    if (res.ok) {
      setPerms((prev) => {
        const next = { ...prev };
        if (effect === 'clear') delete next[investorId];
        else next[investorId] = effect;
        return next;
      });
    }
    setSavingId(null);
  }

  /** Qué ve el inversor "en automático", según nivel de acceso y confidencialidad. */
  function autoEffect(accessLevel: string): 've' | 'no_ve' {
    if (accessLevel === 'full') return 've';
    return doc.confidentiality === 'generic' ? 've' : 'no_ve';
  }

  const seg = (activeState: boolean) =>
    `px-2.5 py-1 text-[11px] font-medium transition ${
      activeState ? 'bg-[#1c3742] text-[#e6e2d7]' : 'text-[#1c3742]/70 hover:bg-[#1c3742]/[0.06]'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102027]/50 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col border border-[#1c3742]/20 bg-white">
        <div className="flex items-start justify-between gap-3 border-b border-[#1c3742]/15 px-5 py-4">
          <div>
            <h2 className="font-playfair text-lg leading-tight">Compartir archivo</h2>
            <p className="mt-0.5 truncate text-xs text-[#1c3742]/55">{doc.title}</p>
          </div>
          <button onClick={onClose} className="text-[#1c3742]/60 hover:text-[#1c3742]" aria-label="Cerrar">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-4 text-xs text-[#1c3742]/60">
            Elige quién puede ver este archivo. <strong>Automático</strong> sigue el nivel de acceso del
            inversor; <strong>Ver</strong> lo comparte siempre; <strong>Bloquear</strong> se lo oculta aunque
            tenga acceso completo.
          </p>
          {loading ? (
            <Spinner label="Cargando permisos…" />
          ) : investors.length === 0 ? (
            <p className="text-sm text-[#1c3742]/50">Este proyecto todavía no tiene inversores con acceso.</p>
          ) : (
            <ul className="space-y-2">
              {investors.map((i) => {
                const current = perms[i.investorId]; // allow | deny | undefined
                const auto = autoEffect(i.access.accessLevel);
                return (
                  <li key={i.investorId} className="flex flex-wrap items-center justify-between gap-2 border border-[#1c3742]/10 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm">
                        {[i.firstName, i.lastName].filter(Boolean).join(' ') || i.email}
                      </p>
                      <p className="text-[11px] text-[#1c3742]/45">
                        {accessLevelLabel(i.access.accessLevel)}
                        {' · '}
                        {!current
                          ? `Automático: ${auto === 've' ? 've el archivo' : 'no lo ve'}`
                          : current === 'allow' ? 'Compartido' : 'Bloqueado'}
                      </p>
                    </div>
                    <div className="flex shrink-0 border border-[#1c3742]/20" aria-busy={savingId === i.investorId}>
                      <button className={seg(current === 'allow')} onClick={() => setEffect(i.investorId, 'allow')}>Ver</button>
                      <button className={`${seg(!current)} border-x border-[#1c3742]/15`} onClick={() => setEffect(i.investorId, 'clear')}>Auto</button>
                      <button className={seg(current === 'deny')} onClick={() => setEffect(i.investorId, 'deny')}>Bloquear</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex justify-end border-t border-[#1c3742]/15 px-5 py-3">
          <button onClick={onClose} className="bg-[#1c3742] px-5 py-2 text-sm font-semibold text-[#e6e2d7]">Hecho</button>
        </div>
      </div>
    </div>
  );
}

type AdminDoc = Detail['documents'][number];

/** Documento estilo SharePoint: clic en el nombre abre el visor; menú ⋮ persistente. Lista o cuadrícula. */
function AdminDocRow({ d, view, onPreview, onDownload, onShare, docAction, deleteDoc, reload }: {
  d: AdminDoc;
  view: 'list' | 'grid';
  onPreview: (id: string, title: string) => void;
  onDownload: (id: string) => void;
  onShare: (doc: { id: string; title: string; confidentiality: string }) => void;
  docAction: (id: string, action: string) => void;
  deleteDoc: (id: string, title: string) => void;
  reload: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onNewVersion(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('publish', 'true');
    form.append('comment', 'Nueva versión');
    await fetch(`/api/dataroom/admin/documents/${d.id}`, { method: 'POST', body: form });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    reload();
  }

  const items: MenuItem[] = [
    { label: 'Vista previa', onClick: () => onPreview(d.id, d.title) },
    { label: 'Descargar', onClick: () => onDownload(d.id) },
    { label: 'Compartir', onClick: () => onShare({ id: d.id, title: d.title, confidentiality: d.confidentiality }) },
    ...(d.status === 'draft' ? [{ label: 'Publicar', onClick: () => docAction(d.id, 'publish') }] : []),
    ...(d.status === 'published'
      ? [
          { label: 'Notificar a inversores', onClick: () => docAction(d.id, 'notify') },
          { label: uploading ? 'Subiendo…' : 'Subir nueva versión', onClick: () => fileRef.current?.click() },
          { label: 'Archivar', onClick: () => { if (confirm('¿Archivar documento? Dejará de ser visible.')) docAction(d.id, 'archive'); } },
        ]
      : []),
    ...(d.status === 'archived' ? [{ label: 'Republicar', onClick: () => docAction(d.id, 'publish') }] : []),
    { label: 'Eliminar', danger: true, onClick: () => deleteDoc(d.id, d.title) },
  ];

  const hiddenInput = (
    <input ref={fileRef} type="file" hidden onChange={onNewVersion} accept=".pdf,.docx,.xlsx,.pptx,.csv,.png,.jpg,.jpeg,.webp" />
  );

  if (view === 'grid') {
    return (
      <div className="group flex flex-col border border-[#1c3742]/12 bg-white transition-shadow hover:shadow-md">
        <button type="button" onClick={() => onPreview(d.id, d.title)} className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
          <FileIcon fileName={d.title} />
        </button>
        <div className="flex items-center justify-between gap-1 border-t border-[#1c3742]/10 px-3 py-2">
          <p className="truncate text-xs font-medium text-[#1c3742]">{d.title}</p>
          {hiddenInput}
          <KebabMenu items={items} />
        </div>
      </div>
    );
  }

  return (
    <tr className="group border-b border-[#1c3742]/[0.07] last:border-0 hover:bg-[#1c3742]/[0.04]">
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-3">
          <FileIcon fileName={d.title} />
          <button type="button" onClick={() => onPreview(d.id, d.title)} className="min-w-0 text-left">
            <p className="truncate font-medium text-[#1c3742] hover:underline">{d.title}</p>
          </button>
          {d.confidentiality === 'sensitive' && (
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-[#c08552]">Confidencial</span>
          )}
        </div>
      </td>
      <td className="px-4 py-2.5"><Badge value={d.status} /></td>
      <td className="px-4 py-2.5 text-[#1c3742]/60">{formatDate(d.updatedAt)}</td>
      <td className="px-4 py-2.5 text-[#1c3742]/60">Althara</td>
      <td className="px-2 py-2.5">
        {hiddenInput}
        <div className="flex justify-end"><KebabMenu items={items} /></div>
      </td>
    </tr>
  );
}

/** Selector para conceder acceso directamente desde la página del proyecto. */
function AssignInvestor({ projectId, allInvestors, assigned, onChanged, onError }: {
  projectId: string;
  allInvestors: InvestorOption[];
  assigned: Detail['investors'];
  onChanged: () => void;
  onError: (e: string) => void;
}) {
  const [investorId, setInvestorId] = useState('');
  const [level, setLevel] = useState<'full' | 'generic'>('full');
  const [busy, setBusy] = useState(false);

  const assignedActive = new Set(assigned.filter((a) => a.access.status === 'active').map((a) => a.investorId));
  const options = allInvestors.filter((i) => !assignedActive.has(i.id));

  async function grant() {
    if (!investorId) return;
    setBusy(true);
    const res = await fetchJson(`/api/dataroom/admin/investors/${investorId}/projects`, {
      method: 'POST', body: JSON.stringify({ projectId, accessLevel: level, notify: true }),
    });
    setBusy(false);
    if (res.ok) { setInvestorId(''); onChanged(); } else onError(res.error ?? 'grant_failed');
  }

  if (allInvestors.length === 0) {
    return (
      <p className="border border-[#c08552]/40 bg-[#c08552]/10 p-3 text-xs text-[#8a5a33]">
        Todavía no hay inversores dados de alta. Créelos primero en la pestaña{' '}
        <Link href="/dataroom/admin/investors" className="underline">Inversores</Link>.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={investorId} onChange={(e) => setInvestorId(e.target.value)}
        className="min-w-56 flex-1 border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-2 text-sm sm:flex-none">
        <option value="">Añadir inversor al proyecto…</option>
        {options.map((i) => (
          <option key={i.id} value={i.id}>
            {[i.firstName, i.lastName].filter(Boolean).join(' ') || i.email} ({i.email}) — {STATUS_LABELS[i.status] ?? i.status}
          </option>
        ))}
      </select>
      <select value={level} onChange={(e) => setLevel(e.target.value as 'full' | 'generic')}
        title={ACCESS_LEVEL_HINTS[level]}
        className="border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-2 text-sm">
        <option value="full">Acceso completo — todos los documentos</option>
        <option value="generic">Acceso limitado — solo documentos generales</option>
      </select>
      <button onClick={grant} disabled={!investorId || busy}
        className="bg-[#1c3742] px-4 py-2 text-sm font-semibold text-[#e6e2d7] disabled:opacity-40">
        {busy ? 'Asignando…' : 'Dar acceso'}
      </button>
    </div>
  );
}

function UploadPanel({ projectId, categories, investors, onUploaded }: {
  projectId: string;
  categories: { id: string; name: string }[];
  investors: Detail['investors'];
  onUploaded: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [meta, setMeta] = useState({
    categoryId: '', confidentiality: 'sensitive', downloadable: true, requiresNda: true,
    publish: true, notify: false, restrict: false,
  });
  const [selectedInvestors, setSelectedInvestors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function upload() {
    if (files.length === 0) return;
    setBusy(true);
    setResult(null);
    const form = new FormData();
    for (const f of files) form.append('files', f);
    form.append('meta', JSON.stringify({
      categoryId: meta.categoryId || undefined,
      confidentiality: meta.confidentiality,
      downloadable: meta.downloadable,
      requiresNda: meta.requiresNda,
      publish: meta.publish,
      notify: meta.notify,
      restrictToInvestorIds: meta.restrict && selectedInvestors.length ? selectedInvestors : undefined,
    }));
    try {
      const res = await fetch(`/api/dataroom/admin/projects/${projectId}/documents`, { method: 'POST', body: form });
      const body = await res.json().catch(() => null);
      if (res.ok && body) {
        const ok = body.results.filter((r: { ok: boolean }) => r.ok).length;
        const failed = body.results.filter((r: { ok: boolean }) => !r.ok);
        setResult(`${ok} archivo(s) subido(s)${failed.length ? ` · ${failed.length} con error (${failed.map((f: { error: string }) => f.error).join(', ')})` : ''}${body.notified ? ` · ${body.notified} inversor(es) notificado(s)` : ''}`);
        setFiles([]);
        if (fileRef.current) fileRef.current.value = '';
        onUploaded();
      } else {
        setResult(`Error: ${body?.error ?? res.status}`);
      }
    } catch {
      setResult('Error de red durante la subida.');
    }
    setBusy(false);
  }

  const check = 'flex items-center gap-2 text-xs text-[#1c3742]/70';
  return (
    <section className="border border-[#1c3742]/10 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50">Subir documentos</h2>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.pptx,.csv,.png,.jpg,.jpeg,.webp"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="text-xs file:mr-3 file:border-0 file:bg-[#1c3742] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#e6e2d7]"
        />
        <select value={meta.categoryId} onChange={(e) => setMeta({ ...meta, categoryId: e.target.value })}
          className="border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-1.5 text-xs">
          <option value="">Categoría…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={meta.confidentiality} onChange={(e) => setMeta({ ...meta, confidentiality: e.target.value, requiresNda: e.target.value === 'sensitive' })}
          title="Confidencial: solo lo ven los inversores con acceso completo. General: lo ven todos."
          className="border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-1.5 text-xs">
          <option value="sensitive">Confidencial — solo acceso completo</option>
          <option value="generic">General — visible para todos</option>
        </select>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        <label className={check}><input type="checkbox" checked={meta.requiresNda} onChange={(e) => setMeta({ ...meta, requiresNda: e.target.checked })} />Requiere NDA</label>
        <label className={check}><input type="checkbox" checked={meta.downloadable} onChange={(e) => setMeta({ ...meta, downloadable: e.target.checked })} />Descargable</label>
        <label className={check}><input type="checkbox" checked={meta.publish} onChange={(e) => setMeta({ ...meta, publish: e.target.checked })} />Publicar ya</label>
        <label className={check}><input type="checkbox" checked={meta.notify} onChange={(e) => setMeta({ ...meta, notify: e.target.checked })} />Notificar a inversores (email agrupado)</label>
        <label className={check}><input type="checkbox" checked={meta.restrict} onChange={(e) => setMeta({ ...meta, restrict: e.target.checked })} />Solo inversores concretos</label>
      </div>
      {meta.restrict && (
        investors.length === 0 ? (
          <p className="mt-2 border border-[#c08552]/40 bg-[#c08552]/10 p-3 text-xs text-[#8a5a33]">
            Este proyecto aún no tiene inversores asignados: primero dé acceso a algún inversor
            (panel «Inversores con acceso») y luego podrá restringir documentos a personas concretas.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-3 bg-[#faf9f5] p-3">
            {investors.map((i) => (
              <label key={i.investorId} className={check}>
                <input
                  type="checkbox"
                  checked={selectedInvestors.includes(i.investorId)}
                  onChange={(e) =>
                    setSelectedInvestors((prev) =>
                      e.target.checked ? [...prev, i.investorId] : prev.filter((x) => x !== i.investorId),
                    )
                  }
                />
                {[i.firstName, i.lastName].filter(Boolean).join(' ') || i.email}
              </label>
            ))}
          </div>
        )
      )}
      {files.length > 0 && (
        <p className="mt-2 text-xs text-[#1c3742]/60">
          {files.length} archivo(s): {files.map((f) => `${f.name} (${formatBytes(f.size)})`).join(', ')}
        </p>
      )}
      {result && <p className="mt-2 text-xs font-medium text-[#8a5a33]">{result}</p>}
      <button onClick={upload} disabled={busy || files.length === 0}
        className="mt-3 bg-[#1c3742] px-4 py-2 text-sm font-semibold text-[#e6e2d7] disabled:opacity-40">
        {busy ? 'Subiendo…' : 'Subir'}
      </button>
    </section>
  );
}


