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
import { Trash2 } from 'lucide-react';
import {
  fetchJson, Spinner, ErrorBox, Badge, STATUS_LABELS, actionLabel, formatDate, formatBytes,
  FileIcon, accessLevelLabel, ACCESS_LEVEL_HINTS, FolderGlyph, FolderIconFilled, LibrarySearch, ViewToggle,
  KebabMenu, DocViewer, VisadoProgress, VisadoInline, type MenuItem,
} from '../../../components/ui';
import { useDataroomSearch, useToast } from '../../../DataroomShell';
import { closeDataroomPreview, openDataroomPreview, type PreviewViewerState } from '../../../lib/preview';
import { FOLDER_CONTENTS } from '@/dataroom/core/standard-folders';
import { uploadProjectDocuments, summarizeUploadOutcome, type BatchUploadProgress } from '@/dataroom/lib/batch-upload-client';

interface Detail {
  project: {
    id: string; name: string; description: string | null; internalCode: string | null;
    status: string; investmentType: string | null; ownerName: string | null;
    ndaRequired: boolean; ndaPolicy: string; updatedAt: string;
  };
  investors: { access: { status: string; accessLevel: string; grantedAt: string }; investorId: string; email: string; firstName: string | null; lastName: string | null; investorStatus: string }[];
  documents: { id: string; title: string; status: string; confidentiality: string; downloadable: boolean; requiresNda: boolean; updatedAt: string; categoryId: string | null; legalStatus: string; taxStatus: string; legalReason: string | null; taxReason: string | null }[];
  categories: { id: string; name: string; slug: string; level: number; parentId: string | null }[];
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
  const [viewer, setViewer] = useState<PreviewViewerState | null>(null);
  const [detailsDoc, setDetailsDoc] = useState<{ id: string; title: string } | null>(null);
  const [movingDoc, setMovingDoc] = useState<{ id: string; title: string } | null>(null);
  const [tab, setTab] = useState<'docs' | 'investors' | 'nda' | 'activity'>('docs');
  const [sort, setSort] = useState<{ key: 'name' | 'status' | 'modified'; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [newFolder, setNewFolder] = useState<{ name: string; level: 1 | 2 } | null>(null);
  const [folderBusy, setFolderBusy] = useState(false);
  const toast = useToast();

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

  // Navegación por carpetas (categorías) estilo SharePoint, con orden por columna.
  const docNav = useMemo(() => {
    const allDocs = data?.documents ?? [];
    const cats = data?.categories ?? [];
    const q = (docSearch.trim() || globalSearch.trim()).toLowerCase();
    const searching = q.length > 0;
    const catById = new Map(cats.map((c) => [c.id, c]));

    const breadcrumb: { id: string; name: string }[] = [];
    if (docFolder && !searching) {
      let cur: string | null = docFolder;
      while (cur) {
        const c = catById.get(cur);
        if (!c) break;
        breadcrumb.unshift({ id: c.id, name: c.name });
        cur = c.parentId;
      }
    }

    const folderMeta = (c: (typeof cats)[number]) => {
      const count = allDocs.filter((d) => d.categoryId === c.id).length;
      const expected = FOLDER_CONTENTS[c.name]?.length ?? null;
      return { id: c.id, name: c.name, level: c.level, count, expected };
    };

    const allFolders = cats.map(folderMeta);
    const currentCat = docFolder ? catById.get(docFolder) : undefined;
    const currentName = currentCat?.name ?? null;
    const currentLevel = currentCat?.level ?? null;

    // Progreso global del data room (solo carpetas estándar raíz con contenido esperado).
    const standard = allFolders.filter((f) => f.expected != null && !catById.get(f.id)?.parentId);
    const expectedTotal = standard.reduce((s, f) => s + (f.expected ?? 0), 0);
    const uploadedTotal = standard.reduce((s, f) => s + Math.min(f.count, f.expected ?? 0), 0);
    const overall = expectedTotal > 0 ? Math.round((uploadedTotal / expectedTotal) * 100) : 0;

    let folders: { id: string; name: string; count: number; level: number; expected: number | null }[] = [];
    let rawDocs = allDocs;
    if (searching) rawDocs = allDocs.filter((d) => d.title.toLowerCase().includes(q));
    else if (docFolder) {
      folders = cats.filter((c) => c.parentId === docFolder).map(folderMeta);
      rawDocs = allDocs.filter((d) => d.categoryId === docFolder);
    } else {
      folders = cats.filter((c) => !c.parentId).map(folderMeta);
      rawDocs = allDocs.filter((d) => !d.categoryId);
    }

    const docs = [...rawDocs].sort((a, b) => {
      const av = sort.key === 'name' ? a.title.toLowerCase() : sort.key === 'status' ? a.status : a.updatedAt;
      const bv = sort.key === 'name' ? b.title.toLowerCase() : sort.key === 'status' ? b.status : b.updatedAt;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return { folders, docs, currentName: searching ? null : currentName, currentLevel: searching ? null : currentLevel, breadcrumb: searching ? [] : breadcrumb, overall, expectedTotal, uploadedTotal };
  }, [data, docSearch, globalSearch, docFolder, sort]);

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
    const opened = await openDataroomPreview(id, title, `/api/dataroom/admin/documents/${id}/file`);
    if (opened) setViewer(opened);
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
    if (res.ok) {
      toast('Documento eliminado.');
      setViewer((v) => (v?.docId === docId ? null : v));
      load();
    } else toast(`Error: ${res.error}`, 'error');
  }

  function toggleSort(key: 'name' | 'status' | 'modified') {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  }

  function toggleSelect(docId: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(docId)) n.delete(docId); else n.add(docId);
      return n;
    });
  }

  async function renameDoc(docId: string, current: string) {
    const title = window.prompt('Nuevo nombre del documento:', current);
    if (!title || title.trim() === '' || title.trim() === current) return;
    const res = await fetchJson(`/api/dataroom/admin/documents/${docId}`, {
      method: 'PATCH', body: JSON.stringify({ action: 'rename', title: title.trim() }),
    });
    if (res.ok) { toast('Documento renombrado.'); load(); } else toast('No se pudo renombrar.', 'error');
  }

  async function bulkAction(kind: 'archive' | 'delete' | 'download') {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (kind === 'download') { for (const did of ids) await downloadDoc(did); return; }
    if (kind === 'delete' && !confirm(`¿Eliminar ${ids.length} documento(s)? Dejarán de ser visibles.`)) return;
    setBulkBusy(true);
    let ok = 0;
    for (const did of ids) {
      const res = kind === 'delete'
        ? await fetchJson(`/api/dataroom/admin/documents/${did}`, { method: 'DELETE' })
        : await fetchJson(`/api/dataroom/admin/documents/${did}`, { method: 'PATCH', body: JSON.stringify({ action: 'archive' }) });
      if (res.ok) ok++;
    }
    setBulkBusy(false);
    setSelected(new Set());
    await load();
    toast(`${ok} de ${ids.length} documento(s) ${kind === 'delete' ? 'eliminados' : 'archivados'}.`, ok === ids.length ? 'ok' : 'error');
  }

  async function submitCreateFolder() {
    if (!newFolder || !newFolder.name.trim()) return;
    setFolderBusy(true);
    const res = await fetchJson(`/api/dataroom/admin/projects/${id}/categories`, {
      method: 'POST',
      body: JSON.stringify({
        name: newFolder.name.trim(),
        level: newFolder.level,
        ...(docFolder ? { parentId: docFolder } : {}),
      }),
    });
    setFolderBusy(false);
    if (res.ok) {
      toast(docFolder ? `Subcarpeta creada dentro de «${docNav.currentName}».` : `Carpeta creada (Nivel ${newFolder.level}).`);
      setNewFolder(null);
      load();
    } else toast('No se pudo crear la carpeta.', 'error');
  }

  async function restoreStandardFolders() {
    setFolderBusy(true);
    const res = await fetchJson<{ created: number }>(`/api/dataroom/admin/projects/${id}/categories`, {
      method: 'POST', body: JSON.stringify({ restoreStandard: true }),
    });
    setFolderBusy(false);
    if (res.ok) {
      const n = res.data?.created ?? 0;
      toast(n > 0 ? `Estructura estándar restaurada (${n} carpeta${n > 1 ? 's' : ''}).` : 'La estructura estándar ya estaba completa.');
      load();
    } else toast('No se pudo restaurar la estructura.', 'error');
  }

  async function setFolderLevel(catId: string, level: number) {
    const res = await fetchJson(`/api/dataroom/admin/categories/${catId}`, { method: 'PATCH', body: JSON.stringify({ level }) });
    if (res.ok) { toast(`Carpeta marcada como Nivel ${level}.`); load(); } else toast('No se pudo cambiar el nivel.', 'error');
  }

  async function renameFolder(catId: string, current: string) {
    const name = window.prompt('Nuevo nombre de la carpeta:', current);
    if (!name || !name.trim() || name.trim() === current) return;
    const res = await fetchJson(`/api/dataroom/admin/categories/${catId}`, { method: 'PATCH', body: JSON.stringify({ name: name.trim() }) });
    if (res.ok) { toast('Carpeta renombrada.'); load(); } else toast('No se pudo renombrar.', 'error');
  }

  async function deleteFolder(catId: string, name: string) {
    if (!confirm(`¿Eliminar la carpeta «${name}»? Sus documentos pasarán a la raíz (no se borran).`)) return;
    const res = await fetchJson(`/api/dataroom/admin/categories/${catId}`, { method: 'DELETE' });
    if (res.ok) { toast('Carpeta eliminada.'); if (docFolder === catId) setDocFolder(null); load(); } else toast('No se pudo eliminar.', 'error');
  }

  async function moveDoc(docId: string, categoryId: string | null) {
    const res = await fetchJson(`/api/dataroom/admin/documents/${docId}`, { method: 'PATCH', body: JSON.stringify({ action: 'move', categoryId }) });
    if (res.ok) { toast('Documento movido.'); setMovingDoc(null); load(); } else toast('No se pudo mover.', 'error');
  }

  async function uploadDropped(files: File[]) {
    if (files.length === 0) return;
    if (!docFolder) {
      toast('Abra primero una carpeta y suelte los archivos dentro (así quedan ordenados).', 'error');
      return;
    }
    setBulkBusy(true);
    try {
      const outcome = await uploadProjectDocuments(id, files, {
        categoryId: docFolder,
        confidentiality: 'sensitive',
        downloadable: true,
        requiresNda: true,
        publish: false,
      });
      const okN = outcome.results.filter((r) => r.ok).length;
      toast(`${okN} archivo(s) subido(s) como borrador. Revísalos y publícalos.`, okN ? 'ok' : 'error');
      load();
    } catch {
      toast('Error de red al subir.', 'error');
    }
    setBulkBusy(false);
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
    { label: 'Asignar inversores', done: assignedInvestors.length > 0, action: () => setTab('investors'), cta: 'Ir' },
    { label: 'Subir y publicar documentos', done: publishedDocs.length > 0, action: () => setTab('docs'), cta: 'Ir' },
    { label: 'Activar el proyecto', done: p.status === 'active', action: () => patch({ action: 'update', data: { status: 'active' } }, 'Proyecto activado.'), cta: 'Activar' },
  ];
  const setupPending = steps.some((s) => !s.done);

  const section = 'border border-[#1c3742]/10 bg-white p-5 rounded-lg';
  const h = 'mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50';

  const SortBtn = ({ label, k }: { label: string; k: 'name' | 'status' | 'modified' }) => (
    <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider hover:text-[#1c3742]">
      {label}
      <span className="text-[10px] text-[#c08552]">{sort.key === k ? (sort.dir === 'asc' ? '▲' : '▼') : ''}</span>
    </button>
  );

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
          className="border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-1 text-xs rounded-md"
        >
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>)}
        </select>
        <button
          onClick={deleteProject}
          disabled={busy}
          className="ml-auto border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-40 rounded-md"
        >
          Eliminar proyecto
        </button>
      </div>
      {msg && <p className="text-sm font-medium text-[#8a5a33]">{msg}</p>}

      {/* Flujo guiado de puesta en marcha */}
      {setupPending && (
        <div className="border border-[#c08552]/40 bg-[#c08552]/10 p-5 rounded-lg">
          <p className="text-sm font-semibold text-[#1c3742]">Puesta en marcha del proyecto</p>
          <p className="mt-1 text-xs text-[#1c3742]/60">
            Los inversores solo verán el proyecto cuando esté <strong>Activo</strong>, tenga inversores asignados y documentos publicados.
          </p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={i} className={`flex items-center gap-3 border p-3 text-sm rounded-md ${s.done ? 'border-[#1c3742]/30 bg-[#1c3742]/5' : 'border-[#1c3742]/15 bg-white'}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold rounded-full ${s.done ? 'bg-[#1c3742] text-[#e6e2d7]' : 'bg-[#1c3742]/10 text-[#1c3742]'}`}>
                  {s.done ? '✓' : i + 1}
                </span>
                <span className={s.done ? 'text-[#1c3742] font-medium' : 'text-[#1c3742]'}>{s.label}</span>
                {!s.done && s.action && (
                  <button onClick={s.action} className="ml-auto shrink-0 bg-[#1c3742] px-2.5 py-1 text-[11px] font-semibold text-[#e6e2d7] rounded-md">
                    {s.cta}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Pestañas estilo SharePoint */}
      <div className="flex gap-1 overflow-x-auto border-b border-[#1c3742]/15">
        {([
          ['docs', `Documentos (${data.documents.length})`],
          ['investors', `Inversores (${activeInvestors.length})`],
          ['nda', 'NDA'],
          ['activity', 'Actividad'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === key ? 'border-[#c08552] text-[#1c3742]' : 'border-transparent text-[#1c3742]/55 hover:text-[#1c3742]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Inversores — asignación directa desde el proyecto */}
      {tab === 'investors' && (
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
              <li key={i.investorId} className="flex items-center justify-between gap-2 bg-[#faf9f5] px-3 py-2 rounded-md">
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
      )}

      {/* NDA (global, común a todo el portal) */}
      {tab === 'nda' && (
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
          <p className="mt-2 border border-[#c08552]/40 bg-[#c08552]/10 p-3 text-xs text-[#8a5a33] rounded-md">
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
                  <li key={s.id} className="flex flex-wrap items-center gap-2 border border-[#1c3742]/10 bg-[#faf9f5] px-3 py-2 text-sm rounded-md">
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
      )}

      {/* Documentos: subida + biblioteca */}
      {tab === 'docs' && (
      <div className="space-y-5">
      <UploadPanel projectId={id} categories={data.categories} investors={activeInvestors}
        currentFolderId={docFolder} currentFolderName={docNav.currentName} currentFolderLevel={docNav.currentLevel} onUploaded={load} />

      {/* Biblioteca de documentos — estilo SharePoint (carpetas navegables) */}
      <section
        className="relative border border-[#1c3742]/10 bg-white rounded-lg"
        onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
        onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadDropped(Array.from(e.dataTransfer.files ?? [])); }}
      >
        {selected.size > 0 ? (
          <div className="flex flex-wrap items-center gap-3 border-b border-[#1c3742]/10 bg-[#1c3742]/[0.05] px-3 py-2.5 text-sm">
            <button onClick={() => setSelected(new Set())} aria-label="Cancelar selección" className="text-[#1c3742]/60 hover:text-[#1c3742]">✕</button>
            <span className="font-medium text-[#1c3742]">{selected.size} seleccionado(s)</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <button disabled={bulkBusy} onClick={() => bulkAction('download')} className="border border-[#1c3742]/25 px-3 py-1.5 text-xs hover:bg-[#1c3742]/5 disabled:opacity-40 rounded-md">Descargar</button>
              <button disabled={bulkBusy} onClick={() => bulkAction('archive')} className="border border-[#1c3742]/25 px-3 py-1.5 text-xs hover:bg-[#1c3742]/5 disabled:opacity-40 rounded-md">Archivar</button>
              <button disabled={bulkBusy} onClick={() => bulkAction('delete')} className="border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-40 rounded-md">Eliminar</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 border-b border-[#1c3742]/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-1.5 text-sm">
              <FolderGlyph className="h-5 w-5 shrink-0 text-[#c08552]" />
              <button type="button" onClick={() => { setDocFolder(null); setDocSearch(''); }} className="font-medium text-[#1c3742] hover:underline">Documentos</button>
              {docNav.breadcrumb.map((crumb, i) => (
                <span key={crumb.id} className="flex min-w-0 items-center gap-1.5">
                  <span className="text-[#1c3742]/35">›</span>
                  {i === docNav.breadcrumb.length - 1 ? (
                    <span className="truncate font-medium text-[#1c3742]">{crumb.name}</span>
                  ) : (
                    <button type="button" onClick={() => setDocFolder(crumb.id)} className="truncate font-medium text-[#1c3742] hover:underline">{crumb.name}</button>
                  )}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {data.documents.length > 0 && <LibrarySearch value={docSearch} onChange={setDocSearch} />}
              <button onClick={restoreStandardFolders} disabled={folderBusy}
                title="Crea las carpetas estándar (0. Bienvenida … 8. Anexos) que falten en este proyecto."
                className="whitespace-nowrap border border-[#1c3742]/25 px-3 py-2 text-xs font-medium hover:bg-[#1c3742]/5 rounded-md disabled:opacity-40">
                Restaurar estándar
              </button>
              <button onClick={() => setNewFolder({ name: '', level: (docNav.currentLevel ?? 2) as 1 | 2 })}
                title={docNav.currentName ? `Crear subcarpeta dentro de «${docNav.currentName}»` : 'Crear carpeta en la raíz del proyecto'}
                className="whitespace-nowrap border border-[#1c3742]/25 px-3 py-2 text-xs font-medium hover:bg-[#1c3742]/5 rounded-md">
                {docNav.currentName ? '+ Subcarpeta' : '+ Carpeta'}
              </button>
              <ViewToggle view={docView} onChange={setDocView} />
            </div>
          </div>
        )}

        {/* Progreso global del data room (en la raíz) */}
        {!docNav.currentName && !docSearch && docNav.expectedTotal > 0 && (
          <div className="border-b border-[#1c3742]/10 px-4 py-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-[#1c3742]/60">
              <span>Completitud del data room (según el árbol estándar)</span>
              <span className="font-medium text-[#1c3742]">{docNav.overall}% · {docNav.uploadedTotal}/{docNav.expectedTotal} elementos</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#1c3742]/10">
              <div className="h-full rounded-full bg-[#c08552] transition-all" style={{ width: `${docNav.overall}%` }} />
            </div>
          </div>
        )}
        {/* Contenido esperado de la carpeta abierta (guía del spec) */}
        {docNav.currentName && FOLDER_CONTENTS[docNav.currentName] && (
          <div className="border-b border-[#1c3742]/10 bg-[#faf9f5] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1c3742]/55">Contenido esperado en esta carpeta</p>
            <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
              {FOLDER_CONTENTS[docNav.currentName].map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-[#1c3742]/70">
                  <span className="mt-0.5 text-[#c08552]">•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.categories.length === 0 && data.documents.length === 0 ? (
          <p className="p-4 text-sm text-[#1c3742]/50">Todavía no hay carpetas ni documentos. Use «Restaurar estándar» para crear el árbol.</p>
        ) : docNav.folders.length === 0 && docNav.docs.length === 0 ? (
          <p className="p-4 text-sm text-[#1c3742]/50">
            {docSearch
              ? 'Sin resultados para la búsqueda.'
              : docNav.currentName
                ? <>Esta carpeta está vacía. Pulse <strong>«+ Subcarpeta»</strong> (arriba a la derecha) para crear una por proyecto (Manacor, Cala Gamba…), o suba documentos con el panel de arriba.</>
                : 'Esta carpeta está vacía. Súbale documentos con el panel de arriba.'}
          </p>
        ) : docView === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
            {docNav.folders.map((f) => (
              <div key={f.id} className="flex items-center gap-2 border border-[#1c3742]/12 bg-white p-3 transition-colors hover:bg-[#1c3742]/[0.03] rounded-lg">
                <button type="button" onClick={() => setDocFolder(f.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <FolderIconFilled className="h-10 w-10 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[#1c3742]">{f.name}</span>
                    <span className="block text-[11px] text-[#1c3742]/45">
                      {f.count}{f.expected != null ? `/${f.expected}` : ''} elemento(s) · Nivel {f.level}
                    </span>
                    {f.expected != null && (
                      <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-[#1c3742]/10">
                        <span className="block h-full rounded-full bg-[#c08552]" style={{ width: `${Math.min(100, Math.round((f.count / Math.max(f.expected, 1)) * 100))}%` }} />
                      </span>
                    )}
                  </span>
                </button>
                <KebabMenu items={[
                  { label: 'Cambiar nombre', onClick: () => renameFolder(f.id, f.name) },
                  { label: f.level === 1 ? 'Marcar como Nivel 2 (NDA)' : 'Marcar como Nivel 1 (solo vista)', onClick: () => setFolderLevel(f.id, f.level === 1 ? 2 : 1) },
                  { label: 'Eliminar carpeta', danger: true, onClick: () => deleteFolder(f.id, f.name) },
                ]} />
              </div>
            ))}
            {docNav.docs.map((d) => (
              <AdminDocRow key={d.id} view="grid" d={d} selected={selected.has(d.id)} onToggleSelect={toggleSelect} onRename={renameDoc} onMove={(did, t) => setMovingDoc({ id: did, title: t })} onDetails={(did, t) => setDetailsDoc({ id: did, title: t })} onPreview={openPreview} onDownload={downloadDoc} onShare={setShareDoc} docAction={docAction} deleteDoc={deleteDoc} reload={load} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1c3742]/10 bg-[#1c3742]/[0.03] text-left text-[11px] uppercase tracking-wider text-[#1c3742]/55">
                  <th className="w-10 px-3 py-2.5">
                    <input
                      type="checkbox"
                      aria-label="Seleccionar todo"
                      checked={docNav.docs.length > 0 && docNav.docs.every((d) => selected.has(d.id))}
                      onChange={(e) => setSelected(e.target.checked ? new Set(docNav.docs.map((d) => d.id)) : new Set())}
                    />
                  </th>
                  <th className="px-4 py-2.5"><SortBtn label="Nombre" k="name" /></th>
                  <th className="px-4 py-2.5"><SortBtn label="Estado" k="status" /></th>
                  <th className="px-4 py-2.5"><SortBtn label="Modificado" k="modified" /></th>
                  <th className="px-4 py-2.5 font-semibold">Modificado por</th>
                  <th className="w-10 px-2 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {docNav.folders.map((f) => (
                  <tr key={f.id} onClick={() => setDocFolder(f.id)} className="cursor-pointer border-b border-[#1c3742]/[0.07] hover:bg-[#1c3742]/[0.04]">
                    <td className="px-3 py-2.5" />
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <FolderIconFilled className="h-8 w-8 shrink-0" />
                        <span className="truncate font-medium text-[#1c3742] hover:underline">{f.name}</span>
                        <span className="text-xs text-[#1c3742]/40">{f.count}{f.expected != null ? `/${f.expected}` : ''}</span>
                        {f.expected != null && (
                          <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-[#1c3742]/10 sm:block">
                            <span className="block h-full rounded-full bg-[#c08552]" style={{ width: `${Math.min(100, Math.round((f.count / Math.max(f.expected, 1)) * 100))}%` }} />
                          </span>
                        )}
                        <span className="text-[10px] uppercase tracking-wider text-[#c08552]">Nivel {f.level}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5" />
                    <td className="px-4 py-2.5 text-[#1c3742]/60">—</td>
                    <td className="px-4 py-2.5 text-[#1c3742]/60">Althara</td>
                    <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end">
                        <KebabMenu items={[
                          { label: 'Cambiar nombre', onClick: () => renameFolder(f.id, f.name) },
                          { label: f.level === 1 ? 'Marcar como Nivel 2 (NDA)' : 'Marcar como Nivel 1 (solo vista)', onClick: () => setFolderLevel(f.id, f.level === 1 ? 2 : 1) },
                          { label: 'Eliminar carpeta', danger: true, onClick: () => deleteFolder(f.id, f.name) },
                        ]} />
                      </div>
                    </td>
                  </tr>
                ))}
                {docNav.docs.map((d) => (
                  <AdminDocRow key={d.id} view="list" d={d} selected={selected.has(d.id)} onToggleSelect={toggleSelect} onRename={renameDoc} onMove={(did, t) => setMovingDoc({ id: did, title: t })} onDetails={(did, t) => setDetailsDoc({ id: did, title: t })} onPreview={openPreview} onDownload={downloadDoc} onShare={setShareDoc} docAction={docAction} deleteDoc={deleteDoc} reload={load} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {dragOver && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-lg border-2 border-dashed border-[#c08552] bg-[#c08552]/10 text-sm font-medium text-[#8a5a33]">
            Suelte los archivos para subirlos {docNav.currentName ? `a «${docNav.currentName}»` : 'aquí'}
          </div>
        )}
      </section>
      </div>
      )}

      {tab === 'activity' && (
      <section className={section}>
        <h2 className={h}>Actividad</h2>
        <ul className="max-h-[60vh] space-y-1 overflow-auto pr-1 text-xs text-[#1c3742]/70">
          {data.activity.map((a) => (
            <li key={a.id}>
              {formatDate(a.createdAt)} — {actionLabel(a.action)}
              {a.actorEmail ? ` · ${a.actorEmail}` : ''}
              {a.result !== 'success' && <span className="text-red-700"> (denegado)</span>}
            </li>
          ))}
        </ul>
      </section>
      )}

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
          fileName={viewer.fileName}
          onClose={() => closeDataroomPreview(viewer, () => setViewer(null))}
          onDownload={() => downloadDoc(viewer.docId)}
          onDelete={() => deleteDoc(viewer.docId, viewer.title)}
        />
      )}
      {detailsDoc && (
        <DetailsPanel doc={detailsDoc} onClose={() => setDetailsDoc(null)} onChanged={load} />
      )}
      {newFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102027]/50 p-4" onClick={() => setNewFolder(null)}>
          <div className="w-full max-w-md border border-[#1c3742]/20 bg-white rounded-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#1c3742]/15 px-5 py-4">
              <h2 className="font-playfair text-lg leading-tight">{docNav.currentName ? 'Nueva subcarpeta' : 'Nueva carpeta'}</h2>
              <button onClick={() => setNewFolder(null)} aria-label="Cerrar" className="text-[#1c3742]/60 hover:text-[#1c3742]">✕</button>
            </div>
            <div className="space-y-4 p-5">
              <p className="rounded-md border border-[#1c3742]/10 bg-[#faf9f5] px-3 py-2 text-xs text-[#1c3742]/65">
                {docNav.currentName ? (
                  <>Se creará <strong>dentro de «{docNav.currentName}»</strong> (hereda Nivel {docNav.currentLevel}). Use esto para subcarpetas por proyecto: Cala Gamba, Manacor, Sa Pobla, Sant Ignasi…</>
                ) : (
                  <>El <strong>árbol estándar</strong> (0 · Bienvenida … 8 · Q&amp;A) se crea solo; no hace falta
                  escribirlo. Si falta alguna, use <strong>«Restaurar estándar»</strong>. Entre primero en una carpeta
                  (p. ej. «4 · Colateral») y pulse <strong>«+ Carpeta»</strong> para crear subcarpetas ahí.</>
                )}
              </p>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#1c3742]/60">Nombre de la carpeta</label>
                <input
                  autoFocus
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitCreateFolder(); }}
                  placeholder="Ej.: 9. Otros"
                  className="w-full rounded-md border border-[#1c3742]/25 bg-white px-3 py-2 text-sm focus:border-[#1c3742]/50 focus:outline-none"
                />
              </div>
              <div>
                <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#1c3742]/60">Nivel de acceso</span>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-start gap-2 rounded-md border border-[#1c3742]/15 p-3 text-sm">
                    <input type="radio" name="level" checked={newFolder.level === 1} onChange={() => setNewFolder({ ...newFolder, level: 1 })} className="mt-0.5" />
                    <span><strong>Nivel 1</strong> — Bienvenida / resumen. Visible tras verificar identidad, <strong>sin</strong> NDA, solo lectura.</span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2 rounded-md border border-[#1c3742]/15 p-3 text-sm">
                    <input type="radio" name="level" checked={newFolder.level === 2} onChange={() => setNewFolder({ ...newFolder, level: 2 })} className="mt-0.5" />
                    <span><strong>Nivel 2</strong> — Confidencial. <strong>Requiere NDA</strong> firmado para verse.</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setNewFolder(null)} disabled={folderBusy} className="rounded-md border border-[#1c3742]/25 px-4 py-2 text-xs font-medium text-[#1c3742] hover:bg-[#1c3742]/5 disabled:opacity-40">Cancelar</button>
                <button onClick={submitCreateFolder} disabled={folderBusy || !newFolder.name.trim()} className="rounded-md bg-[#1c3742] px-4 py-2 text-xs font-semibold text-[#e6e2d7] hover:bg-[#c08552] disabled:opacity-40">
                  {folderBusy ? 'Creando…' : 'Crear carpeta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {movingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102027]/50 p-4" onClick={() => setMovingDoc(null)}>
          <div className="w-full max-w-sm border border-[#1c3742]/20 bg-white rounded-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#1c3742]/15 px-5 py-4">
              <div className="min-w-0">
                <h2 className="font-playfair text-lg leading-tight">Mover a carpeta</h2>
                <p className="mt-0.5 truncate text-xs text-[#1c3742]/55">{movingDoc.title}</p>
              </div>
              <button onClick={() => setMovingDoc(null)} aria-label="Cerrar" className="text-[#1c3742]/60 hover:text-[#1c3742]">✕</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <button onClick={() => moveDoc(movingDoc.id, null)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-[#1c3742]/[0.06]">
                <FolderGlyph className="h-5 w-5 text-[#c08552]" /> Raíz (sin carpeta)
              </button>
              {flattenCategoryTree(data.categories).map(({ cat, depth }) => (
                <button key={cat.id} onClick={() => moveDoc(movingDoc.id, cat.id)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-[#1c3742]/[0.06]">
                  <FolderIconFilled className="h-5 w-5 shrink-0" />
                  <span style={{ paddingLeft: depth * 12 }}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface DocDetail {
  document: {
    id: string; title: string; status: string; confidentiality: string; downloadable: boolean; requiresNda: boolean;
    currentVersionId: string | null; createdAt: string; updatedAt: string;
    legalStatus: string; legalReason: string | null; legalReviewedBy: string | null; legalReviewedAt: string | null;
    taxStatus: string; taxReason: string | null; taxReviewedBy: string | null; taxReviewedAt: string | null;
  };
  versions: { id: string; versionNumber: number; originalName: string; mimeType: string; sizeBytes: number; status: string; versionComment: string | null; uploadedBy: string | null; createdAt: string }[];
  permissions: { perm: { investorId: string; effect: string; canDownload: boolean }; email: string }[];
  accessLog: { kind: string; watermarked: boolean; createdAt: string; email: string }[];
}

/** Panel lateral de detalles + historial de versiones (estilo panel «i» de SharePoint). */
function DetailsPanel({ doc, onClose, onChanged }: {
  doc: { id: string; title: string };
  onClose: () => void;
  onChanged: () => void;
}) {
  const [data, setData] = useState<DocDetail | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetchJson<DocDetail>(`/api/dataroom/admin/documents/${doc.id}`);
    if (res.ok && res.data) setData(res.data);
  }, [doc.id]);
  useEffect(() => { load(); }, [load]);

  async function restore(versionId: string) {
    if (!confirm('¿Restaurar esta versión como la actual? La versión vigente pasará a histórico.')) return;
    setBusy(true);
    const res = await fetchJson(`/api/dataroom/admin/documents/${doc.id}`, {
      method: 'PATCH', body: JSON.stringify({ action: 'restore_version', versionId }),
    });
    setBusy(false);
    if (res.ok) { await load(); onChanged(); }
  }

  const hh = 'mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1c3742]/45';
  const cur = data?.document.currentVersionId;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#102027]/40" onClick={onClose}>
      <aside className="flex h-full w-full max-w-md flex-col rounded-l-lg border-l border-[#1c3742]/15 bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-[#1c3742]/15 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <FileIcon fileName={doc.title} />
            <p className="truncate font-playfair text-lg">{doc.title}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-[#1c3742]/60 hover:text-[#1c3742]">✕</button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
          {!data ? (
            <Spinner label="Cargando detalles…" />
          ) : (
            <>
              <section>
                <h3 className={hh}>Detalles</h3>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <dt className="text-[#1c3742]/50">Estado</dt><dd><Badge value={data.document.status} /></dd>
                  <dt className="text-[#1c3742]/50">Nivel</dt><dd><Badge value={data.document.confidentiality} /></dd>
                  <dt className="text-[#1c3742]/50">Requiere NDA</dt><dd>{data.document.requiresNda ? 'Sí' : 'No'}</dd>
                  <dt className="text-[#1c3742]/50">Descarga</dt><dd>{data.document.downloadable ? 'Permitida' : 'Solo vista'}</dd>
                  <dt className="text-[#1c3742]/50">Creado</dt><dd>{formatDate(data.document.createdAt)}</dd>
                  <dt className="text-[#1c3742]/50">Modificado</dt><dd>{formatDate(data.document.updatedAt)}</dd>
                </dl>
              </section>

              <section>
                <h3 className={hh}>Doble visado</h3>
                {(() => {
                  const doc = data.document;
                  const available = doc.legalStatus === 'approved' && doc.taxStatus === 'approved';
                  const reviewDetail = (role: string, status: string, reviewedBy: string | null, reviewedAt: string | null, reason: string | null) => (
                    <div className="border border-[#1c3742]/10 bg-[#faf9f5] px-3 py-2 text-sm rounded-md">
                      <span className="font-medium text-[#1c3742]">{role}</span>
                      {reviewedBy || reviewedAt ? (
                        <p className="mt-1 text-[11px] text-[#1c3742]/50">
                          {reviewedBy ? reviewedBy : 'Revisor no registrado'}
                          {reviewedAt ? ` · ${formatDate(reviewedAt)}` : ''}
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-[#1c3742]/45">Sin revisar todavía.</p>
                      )}
                      {status === 'rejected' && reason && (
                        <p className="mt-1 border-l-2 border-red-300 pl-2 text-xs text-red-700">Motivo: {reason}</p>
                      )}
                    </div>
                  );
                  return (
                    <>
                      <VisadoProgress legalStatus={doc.legalStatus} taxStatus={doc.taxStatus} />
                      <div className="mt-3 space-y-2">
                        {reviewDetail('Abogado', doc.legalStatus, doc.legalReviewedBy, doc.legalReviewedAt, doc.legalReason)}
                        {reviewDetail('Fiscal', doc.taxStatus, doc.taxReviewedBy, doc.taxReviewedAt, doc.taxReason)}
                      </div>
                      <p className="mt-2 text-sm">
                        <span className="text-[#1c3742]/50">Disponible para inversores: </span>
                        <span className={`font-semibold ${available ? 'text-[#2e9e5a]' : 'text-red-700'}`}>
                          {available ? 'Sí' : 'No'}
                        </span>
                      </p>
                      <p className="mt-1 text-[11px] text-[#1c3742]/45">
                        Para corregir un rechazo, suba una nueva versión del documento (reinicia el visado).
                      </p>
                    </>
                  );
                })()}
              </section>

              <section>
                <h3 className={hh}>Historial de versiones ({data.versions.length})</h3>
                <ul className="space-y-2">
                  {data.versions.map((v) => (
                    <li key={v.id} className="border border-[#1c3742]/10 bg-[#faf9f5] px-3 py-2 text-sm rounded-md">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">v{v.versionNumber}</span>
                        {v.id === cur ? (
                          <span className="bg-[#1c3742] px-2 py-0.5 text-[10px] font-semibold text-[#e6e2d7] rounded-md">Actual</span>
                        ) : (
                          <button
                            onClick={() => restore(v.id)}
                            disabled={busy}
                            className="border border-[#1c3742]/25 px-2 py-0.5 text-[11px] hover:bg-[#1c3742]/5 disabled:opacity-40 rounded-md"
                          >
                            Restaurar
                          </button>
                        )}
                        <span className="ml-auto text-xs text-[#1c3742]/50">{formatDate(v.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-xs text-[#1c3742]/55">
                        {formatBytes(v.sizeBytes)}{v.versionComment ? ` · ${v.versionComment}` : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className={hh}>Permisos por inversor</h3>
                {data.permissions.length === 0 ? (
                  <p className="text-sm text-[#1c3742]/50">Sin permisos específicos (aplica el nivel de acceso de cada inversor).</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {data.permissions.map((p, i) => (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <span className="truncate">{p.email}</span>
                        <span className={p.perm.effect === 'allow' ? 'text-[#1c3742]' : 'text-red-700'}>
                          {p.perm.effect === 'allow' ? 'Compartido' : 'Bloqueado'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h3 className={hh}>Accesos recientes</h3>
                {data.accessLog.length === 0 ? (
                  <p className="text-sm text-[#1c3742]/50">Todavía sin accesos.</p>
                ) : (
                  <ul className="space-y-1 text-xs text-[#1c3742]/70">
                    {data.accessLog.slice(0, 15).map((a, i) => (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <span className="truncate">{a.email} · {a.kind === 'download' ? 'descarga' : 'vista'}</span>
                        <span className="text-[#1c3742]/45">{formatDate(a.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
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
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col border border-[#1c3742]/20 bg-white rounded-lg">
        <div className="flex items-start justify-between gap-3 border-b border-[#1c3742]/15 px-5 py-4">
          <div>
            <h2 className="font-playfair text-lg leading-tight">Compartir archivo</h2>
            <p className="mt-0.5 truncate text-xs text-[#1c3742]/55">{doc.title}</p>
          </div>
          <button onClick={onClose} className="text-[#1c3742]/60 hover:text-[#1c3742]" aria-label="Cerrar">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-4 text-xs text-[#1c3742]/60">
            Elige quién puede ver este archivo. <strong>Según su acceso</strong> sigue el nivel del
            inversor; <strong>Compartido</strong> se lo compartes siempre; <strong>Oculto</strong> se lo
            escondes aunque vea toda la documentación.
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
                  <li key={i.investorId} className="flex flex-wrap items-center justify-between gap-2 border border-[#1c3742]/10 px-3 py-2 rounded-md">
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
                    <div className="flex shrink-0 border border-[#1c3742]/20 rounded-md overflow-hidden" aria-busy={savingId === i.investorId}>
                      <button className={seg(current === 'allow')} onClick={() => setEffect(i.investorId, 'allow')}>Compartido</button>
                      <button className={`${seg(!current)} border-x border-[#1c3742]/15`} onClick={() => setEffect(i.investorId, 'clear')}>Según su acceso</button>
                      <button className={seg(current === 'deny')} onClick={() => setEffect(i.investorId, 'deny')}>Oculto</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex justify-end border-t border-[#1c3742]/15 px-5 py-3">
          <button onClick={onClose} className="bg-[#1c3742] px-5 py-2 text-sm font-semibold text-[#e6e2d7] rounded-md">Hecho</button>
        </div>
      </div>
    </div>
  );
}

type AdminDoc = Detail['documents'][number];

/** Documento estilo SharePoint: clic en el nombre abre el visor; menú ⋮ persistente. Lista o cuadrícula. */
function AdminDocRow({ d, view, selected, onToggleSelect, onRename, onMove, onDetails, onPreview, onDownload, onShare, docAction, deleteDoc, reload }: {
  d: AdminDoc;
  view: 'list' | 'grid';
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onRename: (id: string, current: string) => void;
  onMove: (id: string, title: string) => void;
  onDetails: (id: string, title: string) => void;
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
    { label: 'Cambiar nombre', onClick: () => onRename(d.id, d.title) },
    { label: 'Mover a carpeta', onClick: () => onMove(d.id, d.title) },
    { label: 'Compartir', onClick: () => onShare({ id: d.id, title: d.title, confidentiality: d.confidentiality }) },
    { label: 'Detalles e historial', onClick: () => onDetails(d.id, d.title) },
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

  const deleteBtn = (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); deleteDoc(d.id, d.title); }}
      aria-label={`Eliminar ${d.title}`}
      title="Eliminar documento"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#1c3742]/45 transition-colors hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 className="h-4 w-4" aria-hidden />
    </button>
  );

  if (view === 'grid') {
    return (
      <div className={`group flex flex-col border bg-white rounded-lg transition-colors hover:border-[#1c3742]/25 ${selected ? 'border-[#c08552]' : 'border-[#1c3742]/12'}`}>
        <button type="button" onClick={() => onPreview(d.id, d.title)} className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
          <FileIcon fileName={d.title} />
        </button>
        <div className="flex items-center gap-2 border-t border-[#1c3742]/10 px-3 py-2">
          <input type="checkbox" checked={selected} onChange={() => onToggleSelect(d.id)} aria-label={`Seleccionar ${d.title}`} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[#1c3742]">{d.title}</p>
            <VisadoInline legalStatus={d.legalStatus} taxStatus={d.taxStatus} />
          </div>
          {hiddenInput}
          {deleteBtn}
          <KebabMenu items={items} />
        </div>
      </div>
    );
  }

  return (
    <tr className={`group border-b border-[#1c3742]/[0.07] last:border-0 hover:bg-[#1c3742]/[0.04] ${selected ? 'bg-[#1c3742]/[0.05]' : ''}`}>
      <td className="px-3 py-2.5">
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(d.id)} aria-label={`Seleccionar ${d.title}`} />
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-3">
          <FileIcon fileName={d.title} />
          <button type="button" onClick={() => onPreview(d.id, d.title)} className="min-w-0 text-left">
            <p className="truncate font-medium text-[#1c3742] hover:underline">{d.title}</p>
            <VisadoInline legalStatus={d.legalStatus} taxStatus={d.taxStatus} />
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
        <div className="flex items-center justify-end gap-1">
          {deleteBtn}
          <KebabMenu items={items} />
        </div>
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
      <p className="border border-[#c08552]/40 bg-[#c08552]/10 p-3 text-xs text-[#8a5a33] rounded-md">
        Todavía no hay inversores dados de alta. Créelos primero en la pestaña{' '}
        <Link href="/dataroom/admin/investors" className="underline">Inversores</Link>.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={investorId} onChange={(e) => setInvestorId(e.target.value)}
        className="min-w-56 flex-1 border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-2 text-sm sm:flex-none rounded-md">
        <option value="">Añadir inversor al proyecto…</option>
        {options.map((i) => (
          <option key={i.id} value={i.id}>
            {[i.firstName, i.lastName].filter(Boolean).join(' ') || i.email} ({i.email}) — {STATUS_LABELS[i.status] ?? i.status}
          </option>
        ))}
      </select>
      <select value={level} onChange={(e) => setLevel(e.target.value as 'full' | 'generic')}
        title={ACCESS_LEVEL_HINTS[level]}
        className="border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-2 text-sm rounded-md">
        <option value="full">Ve toda la documentación</option>
        <option value="generic">Solo lo que yo le comparta</option>
      </select>
      <button onClick={grant} disabled={!investorId || busy}
        className="bg-[#1c3742] px-4 py-2 text-sm font-semibold text-[#e6e2d7] disabled:opacity-40 rounded-md">
        {busy ? 'Asignando…' : 'Dar acceso'}
      </button>
    </div>
  );
}

/** Lista de carpetas en orden de árbol (raíz → hijos) para selects y diálogos. */
function flattenCategoryTree(categories: { id: string; name: string; parentId: string | null }[]) {
  const byParent = new Map<string | null, typeof categories>();
  for (const c of categories) {
    const key = c.parentId ?? null;
    const list = byParent.get(key) ?? [];
    list.push(c);
    byParent.set(key, list);
  }
  const out: { cat: (typeof categories)[number]; depth: number }[] = [];
  function walk(parentId: string | null, depth: number) {
    for (const cat of byParent.get(parentId) ?? []) {
      out.push({ cat, depth });
      walk(cat.id, depth + 1);
    }
  }
  walk(null, 0);
  return out;
}

/** Ajustes de acceso por defecto según el nivel de la carpeta (spec). */
function levelDefaults(level: number | null | undefined) {
  if (level === 1) return { requiresNda: false, confidentiality: 'generic', downloadable: false };
  if (level === 2) return { requiresNda: true, confidentiality: 'sensitive' };
  return {};
}

function UploadPanel({ projectId, categories, investors, currentFolderId, currentFolderName, currentFolderLevel, onUploaded }: {
  projectId: string;
  categories: { id: string; name: string; level: number; parentId: string | null }[];
  investors: Detail['investors'];
  currentFolderId: string | null;
  currentFolderName: string | null;
  currentFolderLevel: number | null;
  onUploaded: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [meta, setMeta] = useState({
    categoryId: '', confidentiality: 'sensitive', downloadable: true, requiresNda: true,
    publish: true, notify: false, restrict: false,
  });
  // El destino sigue a la carpeta abierta (como en Drive) y los ajustes de
  // acceso se alinean con su NIVEL (spec): Nivel 1 = sin NDA, solo visualización;
  // Nivel 2 = confidencial, requiere NDA.
  useEffect(() => {
    if (!currentFolderId) return;
    setMeta((m) => ({ ...m, categoryId: currentFolderId, ...levelDefaults(currentFolderLevel) }));
  }, [currentFolderId, currentFolderLevel]);
  const targetCat = categories.find((c) => c.id === meta.categoryId) ?? null;
  const [selectedInvestors, setSelectedInvestors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<BatchUploadProgress | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function upload() {
    if (files.length === 0) return;
    if (!meta.categoryId) {
      setResult('Elija una carpeta antes de subir (así la documentación queda ordenada).');
      return;
    }
    setBusy(true);
    setResult(null);
    setProgress({ done: 0, total: files.length, current: files[0]?.name });
    try {
      const outcome = await uploadProjectDocuments(
        projectId,
        files,
        {
          categoryId: meta.categoryId || undefined,
          confidentiality: meta.confidentiality,
          downloadable: meta.downloadable,
          requiresNda: meta.requiresNda,
          publish: meta.publish,
          notify: meta.notify,
          restrictToInvestorIds: meta.restrict && selectedInvestors.length ? selectedInvestors : undefined,
        },
        setProgress,
      );
      setResult(summarizeUploadOutcome(outcome));
      if (outcome.results.some((r) => r.ok)) {
        setFiles([]);
        if (fileRef.current) fileRef.current.value = '';
        onUploaded();
      }
    } catch {
      setResult('Error de red durante la subida.');
    }
    setProgress(null);
    setBusy(false);
  }

  const totalBytes = files.reduce((s, f) => s + f.size, 0);

  function removeQueuedFile(index: number) {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0 && fileRef.current) fileRef.current.value = '';
      return next;
    });
  }

  const check = 'flex items-center gap-2 text-xs text-[#1c3742]/70';
  return (
    <section className="border border-[#1c3742]/10 bg-white p-5 rounded-lg">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50">Subir documentos</h2>
        {targetCat ? (
          <span className="rounded-full border border-[#1c3742]/15 bg-[#1c3742]/5 px-2.5 py-0.5 text-[11px] text-[#1c3742]/70">
            Subiendo a: <strong>{targetCat.name}</strong>
            {targetCat.level === 1 && ' · Nivel 1 (sin NDA, solo visualización)'}
            {targetCat.level === 2 && ' · Nivel 2 (confidencial, requiere NDA)'}
          </span>
        ) : (
          <span className="text-[11px] text-[#c08552]">Entre en una carpeta (abajo) o elija una para fijar el destino.</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.pptx,.csv,.png,.jpg,.jpeg,.webp"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-[#1c3742] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#e6e2d7]"
        />
        <select value={meta.categoryId}
          onChange={(e) => {
            const cat = categories.find((c) => c.id === e.target.value);
            setMeta((m) => ({ ...m, categoryId: e.target.value, ...levelDefaults(cat?.level) }));
          }}
          title="Carpeta donde se guardará el documento. Es obligatorio para mantener el orden."
          className={`border bg-[#faf9f5] px-2 py-1.5 text-xs rounded-md ${meta.categoryId ? 'border-[#1c3742]/25' : 'border-[#c08552]/60'}`}>
          <option value="">Elegir carpeta… *</option>
          {flattenCategoryTree(categories).map(({ cat, depth }) => (
            <option key={cat.id} value={cat.id}>{`${'\u00a0'.repeat(depth * 2)}${depth > 0 ? '↳ ' : ''}${cat.name}`}</option>
          ))}
        </select>
      </div>

      {/* Solo 2 decisiones reales: ¿se descarga? y ¿para quién? La confidencialidad
          y el NDA los define el NIVEL de la carpeta, no el admin. */}
      <div className="mt-3 flex flex-wrap gap-4">
        <label className={check} title="Si lo desmarca, el inversor solo podrá verlo en pantalla (con marca de agua), no descargarlo."><input type="checkbox" checked={meta.downloadable} onChange={(e) => setMeta({ ...meta, downloadable: e.target.checked })} />Se puede descargar</label>
        <label className={check} title="Deja el documento listo. Aun así no lo verá el inversor hasta que abogado y fiscal lo aprueben."><input type="checkbox" checked={meta.publish} onChange={(e) => setMeta({ ...meta, publish: e.target.checked })} />Publicar ya</label>
        <label className={check} title="Envía un único email a los inversores avisando de la documentación nueva."><input type="checkbox" checked={meta.notify} onChange={(e) => setMeta({ ...meta, notify: e.target.checked })} />Avisar por email</label>
      </div>

      <div className="mt-3">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[#1c3742]/55">¿Para quién?</span>
        <div className="flex flex-wrap gap-4">
          <label className={check}><input type="radio" name="audience" checked={!meta.restrict} onChange={() => setMeta({ ...meta, restrict: false })} />Todos los inversores con acceso al proyecto</label>
          <label className={check}><input type="radio" name="audience" checked={meta.restrict} onChange={() => setMeta({ ...meta, restrict: true })} />Solo estos inversores…</label>
        </div>
      </div>
      {meta.restrict && (
        investors.length === 0 ? (
          <p className="mt-2 border border-[#c08552]/40 bg-[#c08552]/10 p-3 text-xs text-[#8a5a33] rounded-md">
            Este proyecto aún no tiene inversores asignados: primero dé acceso a algún inversor
            (panel «Inversores con acceso») y luego podrá compartir documentos con personas concretas.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-3 bg-[#faf9f5] p-3 rounded-md">
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

      {/* Resumen en cristiano de lo que va a pasar */}
      {targetCat && (
        <p className="mt-3 rounded-md border border-[#1c3742]/10 bg-[#faf9f5] px-3 py-2 text-xs text-[#1c3742]/75">
          Irá a <strong>«{targetCat.name}»</strong>.{' '}
          {targetCat.level === 1
            ? 'Nivel 1: visible tras verificar identidad, sin NDA.'
            : 'Nivel 2: confidencial, requiere NDA firmado.'}{' '}
          {meta.downloadable ? 'Se puede descargar.' : 'Solo visualización (con marca de agua).'}{' '}
          {meta.restrict ? 'Visible solo para los inversores que elijas.' : 'Visible para todos los inversores con acceso al proyecto.'}{' '}
          No aparecerá para el inversor hasta que <strong>abogado y fiscal</strong> lo aprueben.
        </p>
      )}
      {files.length > 0 && (
        <div className="mt-2 text-xs text-[#1c3742]/60">
          <p className="mb-1.5">
            <strong>{files.length}</strong> archivo(s) · {formatBytes(totalBytes)} en total
          </p>
          <ul className="max-h-44 space-y-1 overflow-y-auto rounded-md border border-[#1c3742]/10 bg-[#faf9f5] p-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${f.lastModified}-${i}`} className="flex items-center gap-2 rounded px-1 py-0.5 hover:bg-white">
                <span className="min-w-0 flex-1 truncate text-[#1c3742]/80">{f.name}</span>
                <span className="shrink-0 tabular-nums text-[#1c3742]/40">{formatBytes(f.size)}</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeQueuedFile(i)}
                  aria-label={`Quitar ${f.name}`}
                  title="Quitar de la selección"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[#1c3742]/40 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          {progress && (
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-[11px] text-[#1c3742]/55">
                <span className="truncate">Subiendo {progress.done + 1}/{progress.total}{progress.current ? ` · ${progress.current}` : ''}</span>
                <span>{Math.round((progress.done / Math.max(progress.total, 1)) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1c3742]/10">
                <div className="h-full rounded-full bg-[#c08552] transition-all" style={{ width: `${Math.round((progress.done / Math.max(progress.total, 1)) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      )}
      {result && <p className="mt-2 text-xs font-medium text-[#8a5a33]">{result}</p>}
      <button onClick={upload} disabled={busy || files.length === 0 || !meta.categoryId}
        title={!meta.categoryId ? 'Elija una carpeta primero' : undefined}
        className="mt-3 bg-[#1c3742] px-4 py-2 text-sm font-semibold text-[#e6e2d7] disabled:opacity-40 rounded-md">
        {busy ? (progress ? `Subiendo ${progress.done}/${progress.total}…` : 'Subiendo…') : files.length > 1 ? `Subir ${files.length} archivos` : 'Subir'}
      </button>
    </section>
  );
}


