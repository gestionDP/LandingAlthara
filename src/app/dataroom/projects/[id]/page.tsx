'use client';

/**
 * Project data room: category navigation, search, document list with lock
 * states, NDA gate with automatic unlock (refetch after signature — no
 * manual reload anywhere).
 */
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchJson, Spinner, ErrorBox, EmptyState, Badge, FileIcon, formatDate, FolderGlyph, FolderIconFilled, LibrarySearch, ViewToggle, KebabMenu, DocViewer } from '../../components/ui';
import { useDataroomSearch } from '../../DataroomShell';

interface Doc {
  id: string; title: string; description: string | null; category: string | null;
  categorySlug: string | null; confidentiality: string; updatedAt: string; isNew: boolean;
  locked: boolean; lockReason?: string; canDownload: boolean;
  mimeType?: string | null; sizeBytes?: number | null; versionNumber?: number | null;
}

interface ProjectData {
  project: { id: string; name: string; description: string | null; status: string; investmentType: string | null; updatedAt: string; ndaRequired: boolean };
  ndaState: string;
  categories: { name: string; slug: string }[];
  documents: Doc[];
}

interface NdaPayload {
  state: string;
  version: { id: string; version: number; title: string; bodyText: string } | null;
}

export default function ProjectDataRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [ndaOpen, setNdaOpen] = useState(false);
  const [busyDoc, setBusyDoc] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ title: string; src: string; mimeType?: string | null; canDownload: boolean; docId: string; revoke?: string } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetchJson<ProjectData>(`/api/dataroom/projects/${id}`);
    if (res.ok && res.data) setData(res.data);
    else setError(res.status === 404 ? 'not_found' : res.error ?? 'error');
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const globalSearch = useDataroomSearch();

  // Navegación por carpetas (categorías) estilo SharePoint.
  const nav = useMemo(() => {
    if (!data) return { folders: [] as { slug: string; name: string; count: number }[], docs: [] as Doc[], currentName: null as string | null };
    const q = (search.trim() || globalSearch.trim()).toLowerCase();
    const searching = q.length > 0;
    const catsWithDocs = data.categories
      .filter((c) => data.documents.some((d) => d.categorySlug === c.slug))
      .map((c) => ({ slug: c.slug, name: c.name, count: data.documents.filter((d) => d.categorySlug === c.slug).length }));
    const currentName = folder ? (data.categories.find((c) => c.slug === folder)?.name ?? null) : null;

    if (searching) {
      return { folders: [], docs: data.documents.filter((d) => d.title.toLowerCase().includes(q)), currentName };
    }
    if (folder) {
      return { folders: [], docs: data.documents.filter((d) => d.categorySlug === folder), currentName };
    }
    // Raíz: carpetas + documentos sin categoría.
    return { folders: catsWithDocs, docs: data.documents.filter((d) => !d.categorySlug), currentName: null };
  }, [data, search, globalSearch, folder]);

  async function openDoc(doc: Doc, kind: 'preview' | 'download') {
    setBusyDoc(doc.id);
    setDocError(null);
    try {
      const res = await fetch(`/api/dataroom/documents/${doc.id}/${kind}`, { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setDocError(
          res.status === 423
            ? 'Debe firmar el NDA para acceder a este documento.'
            : body?.error === 'rate_limited'
              ? 'Demasiadas solicitudes, espere un momento.'
              : 'Documento no disponible.',
        );
        return;
      }
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const { url } = await res.json();
        window.open(url, '_blank', 'noopener');
      } else {
        // Watermarked stream
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        if (kind === 'download') a.download = doc.title;
        else a.target = '_blank';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 30_000);
      }
    } finally {
      setBusyDoc(null);
    }
  }

  async function openPreview(doc: Doc) {
    if (doc.locked) return;
    setBusyDoc(doc.id);
    setDocError(null);
    try {
      const res = await fetch(`/api/dataroom/documents/${doc.id}/preview`, { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setDocError(
          res.status === 423
            ? 'Debe firmar el NDA para acceder a este documento.'
            : body?.error === 'rate_limited'
              ? 'Demasiadas solicitudes, espere un momento.'
              : 'Documento no disponible.',
        );
        return;
      }
      const ct = res.headers.get('content-type') ?? '';
      if (ct.includes('application/json')) {
        const { url } = await res.json();
        setViewer({ title: doc.title, src: url, mimeType: doc.mimeType, canDownload: doc.canDownload, docId: doc.id });
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setViewer({ title: doc.title, src: url, mimeType: doc.mimeType ?? ct, canDownload: doc.canDownload, docId: doc.id, revoke: url });
      }
    } finally {
      setBusyDoc(null);
    }
  }

  function closeViewer() {
    if (viewer?.revoke) { const r = viewer.revoke; setTimeout(() => URL.revokeObjectURL(r), 1000); }
    setViewer(null);
  }

  if (loading) return <Spinner label="Cargando data room…" />;
  if (error === 'not_found')
    return <ErrorBox message="Este proyecto no existe o no tiene acceso a él." />;
  if (error || !data) return <ErrorBox message="No se ha podido cargar el proyecto." onRetry={load} />;

  const ndaPending = data.ndaState === 'pending_signature' || data.ndaState === 'required';
  const ndaBlocked = data.ndaState === 'expired' || data.ndaState === 'revoked';
  const hasLockedDocs = data.documents.some((d) => d.locked && d.lockReason === 'nda_required');

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dataroom" className="text-xs text-[#1c3742]/50 hover:text-[#1c3742]">← Volver a mis proyectos</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-playfair text-3xl">{data.project.name}</h1>
          <Badge value={data.project.status} />
          <Badge value={data.ndaState} />
        </div>
        {data.project.description && (
          <p className="mt-2 max-w-3xl text-sm text-[#1c3742]/70">{data.project.description}</p>
        )}
        <p className="mt-1 text-xs text-[#1c3742]/40">
          Última actualización: {formatDate(data.project.updatedAt)}
        </p>
      </div>

      {data.project.status === 'temporarily_unavailable' && (
        <ErrorBox message="Este proyecto está temporalmente no disponible. La documentación volverá a estar accesible en breve." />
      )}

      {ndaPending && (
        <div className="flex flex-col items-start gap-3 border border-[#c08552]/40 bg-[#c08552]/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-[#6d4526]">Documentación confidencial bloqueada</p>
            <p className="mt-1 text-sm text-[#8a5a33]/90">
              Para acceder a la documentación sensible de este proyecto debe firmar el acuerdo de confidencialidad (NDA).
            </p>
          </div>
          <button
            onClick={() => setNdaOpen(true)}
            className="shrink-0 bg-[#c08552] px-5 py-2 text-sm font-semibold text-white"
          >
            Revisar y firmar NDA
          </button>
        </div>
      )}
      {ndaBlocked && (
        <ErrorBox message="El acceso a la documentación sensible está bloqueado. El acuerdo de confidencialidad ha cambiado o su firma ha sido revocada. Contacte con su gestor en Althara." />
      )}

      {docError && <ErrorBox message={docError} />}

      {/* Biblioteca de documentos — estilo SharePoint (carpetas navegables) */}
      <div className="border border-[#1c3742]/12 bg-white shadow-sm">
        {/* Command bar + breadcrumb */}
        <div className="flex flex-col gap-3 border-b border-[#1c3742]/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-1.5 text-sm">
            <FolderGlyph className="h-5 w-5 shrink-0 text-[#c08552]" />
            <button type="button" onClick={() => { setFolder(null); setSearch(''); }} className="font-medium text-[#1c3742] hover:underline">
              Documentos
            </button>
            {nav.currentName && (
              <>
                <span className="text-[#1c3742]/35">›</span>
                <span className="truncate font-medium text-[#1c3742]">{nav.currentName}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <LibrarySearch value={search} onChange={setSearch} />
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>

        {nav.folders.length === 0 && nav.docs.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={data.documents.length === 0 ? 'Todavía no hay documentos publicados' : search ? 'Sin resultados' : 'Esta carpeta está vacía'}
              subtitle={data.documents.length === 0 ? 'Recibirá una notificación cuando se publique documentación.' : 'Pruebe con otra búsqueda o carpeta.'}
            />
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
            {nav.folders.map((f) => (
              <button key={f.slug} type="button" onClick={() => setFolder(f.slug)}
                className="flex items-center gap-3 border border-[#1c3742]/12 bg-white p-3 text-left transition-colors hover:bg-[#1c3742]/[0.03]">
                <FolderIconFilled className="h-10 w-10 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[#1c3742]">{f.name}</span>
                  <span className="block text-[11px] text-[#1c3742]/45">{f.count} elemento(s)</span>
                </span>
              </button>
            ))}
            {nav.docs.map((doc) => (
              <div key={doc.id} className="group flex flex-col border border-[#1c3742]/12 bg-white transition-shadow hover:shadow-md">
                <button type="button" onClick={() => openPreview(doc)} disabled={doc.locked || busyDoc === doc.id}
                  className="flex flex-1 flex-col items-center justify-center gap-3 p-6 disabled:cursor-default">
                  {doc.locked
                    ? <span className="flex h-12 w-12 items-center justify-center bg-[#1c3742]/5 text-xs font-bold text-[#1c3742]/50" aria-hidden>NDA</span>
                    : <FileIcon mimeType={doc.mimeType} fileName={doc.title} />}
                </button>
                <div className="flex items-center justify-between gap-1 border-t border-[#1c3742]/10 px-3 py-2">
                  <p className={`truncate text-xs ${doc.locked ? 'text-[#1c3742]/50' : 'font-medium text-[#1c3742]'}`}>{doc.title}</p>
                  {doc.locked
                    ? <span className="shrink-0 text-[10px] text-[#c08552]">NDA</span>
                    : <KebabMenu items={[
                        { label: 'Vista previa', onClick: () => openPreview(doc) },
                        ...(doc.canDownload ? [{ label: 'Descargar', onClick: () => openDoc(doc, 'download') }] : []),
                      ]} />}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1c3742]/10 bg-[#1c3742]/[0.03] text-left text-[11px] uppercase tracking-wider text-[#1c3742]/55">
                  <th className="px-4 py-2.5 font-semibold">Nombre</th>
                  <th className="px-4 py-2.5 font-semibold">Modificado</th>
                  <th className="px-4 py-2.5 font-semibold">Modificado por</th>
                  <th className="w-10 px-2 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {nav.folders.map((f) => (
                  <tr key={f.slug} onClick={() => setFolder(f.slug)}
                    className="cursor-pointer border-b border-[#1c3742]/[0.07] hover:bg-[#1c3742]/[0.04]">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <FolderIconFilled className="h-8 w-8 shrink-0" />
                        <span className="truncate font-medium text-[#1c3742] hover:underline">{f.name}</span>
                        <span className="text-xs text-[#1c3742]/40">{f.count}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[#1c3742]/60">—</td>
                    <td className="px-4 py-2.5 text-[#1c3742]/60">Althara</td>
                    <td className="px-2 py-2.5" />
                  </tr>
                ))}
                {nav.docs.map((doc) => (
                  <tr key={doc.id} className="group border-b border-[#1c3742]/[0.07] last:border-0 hover:bg-[#1c3742]/[0.04]">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        {doc.locked ? (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#1c3742]/5 text-[10px] font-bold uppercase tracking-wide text-[#1c3742]/50" title="Bloqueado" aria-hidden>NDA</span>
                        ) : (
                          <FileIcon mimeType={doc.mimeType} fileName={doc.title} />
                        )}
                        <button type="button" onClick={() => openPreview(doc)} disabled={doc.locked || busyDoc === doc.id} className="min-w-0 text-left disabled:cursor-default">
                          <p className={doc.locked ? 'truncate text-[#1c3742]/50' : 'truncate font-medium text-[#1c3742] hover:underline'}>{doc.title}</p>
                          {doc.description && !doc.locked && (
                            <p className="truncate text-xs text-[#1c3742]/50">{doc.description}</p>
                          )}
                        </button>
                        {doc.confidentiality === 'sensitive' && !doc.locked && (
                          <span className="shrink-0 text-[10px] uppercase tracking-wider text-[#c08552]" title="Confidencial">Confidencial</span>
                        )}
                        {doc.isNew && (
                          <span className="shrink-0 bg-[#1c3742] px-2 py-0.5 text-[10px] font-semibold text-[#e6e2d7]">Nuevo</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[#1c3742]/60">{formatDate(doc.updatedAt)}</td>
                    <td className="px-4 py-2.5 text-[#1c3742]/60">Althara</td>
                    <td className="px-2 py-2.5">
                      {doc.locked ? (
                        <span className="block text-right text-xs text-[#c08552]">{doc.lockReason === 'nda_required' ? 'NDA' : '—'}</span>
                      ) : (
                        <div className="flex justify-end">
                          <KebabMenu items={[
                            { label: 'Vista previa', onClick: () => openPreview(doc) },
                            ...(doc.canDownload ? [{ label: 'Descargar', onClick: () => openDoc(doc, 'download') }] : []),
                          ]} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasLockedDocs && ndaPending && (
        <p className="text-xs text-[#1c3742]/50">
          Los documentos bloqueados se desbloquearan automaticamente al firmar el NDA.
        </p>
      )}

      {viewer && (
        <DocViewer
          title={viewer.title}
          src={viewer.src}
          mimeType={viewer.mimeType}
          onClose={closeViewer}
          onDownload={
            viewer.canDownload
              ? () => { const d = data?.documents.find((x) => x.id === viewer.docId); if (d) openDoc(d, 'download'); }
              : undefined
          }
        />
      )}

      {ndaOpen && (
        <NdaModal
          projectId={id}
          onClose={() => setNdaOpen(false)}
          onSigned={() => {
            setNdaOpen(false);
            load(); // automatic unlock — no manual reload
          }}
        />
      )}
    </div>
  );
}

function NdaModal({ projectId, onClose, onSigned }: { projectId: string; onClose: () => void; onSigned: () => void }) {
  const [payload, setPayload] = useState<NdaPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetchJson<NdaPayload>(`/api/dataroom/projects/${projectId}/nda`);
      if (res.ok && res.data) setPayload(res.data);
      else setError('No se ha podido cargar el NDA.');
      setLoading(false);
    })();
  }, [projectId]);

  async function sign() {
    if (!payload?.version) return;
    setSigning(true);
    setError(null);
    const res = await fetchJson<{ ok: boolean }>(`/api/dataroom/projects/${projectId}/nda`, {
      method: 'POST',
      body: JSON.stringify({ ndaVersionId: payload.version.id, signerFullName: fullName.trim(), accepted: true }),
    });
    setSigning(false);
    if (res.ok && res.data?.ok) onSigned();
    else setError('No se ha podido registrar la firma. Inténtelo de nuevo.');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102027]/50 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col border border-[#1c3742]/20 bg-white">
        <div className="flex items-center justify-between border-b border-[#1c3742]/15 px-6 py-4">
          <h2 className="font-playfair text-lg">Acuerdo de confidencialidad</h2>
          <button onClick={onClose} className="text-[#1c3742]/60 hover:text-[#1c3742]" aria-label="Cerrar">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <Spinner label="Cargando NDA…" />
          ) : !payload?.version ? (
            <ErrorBox message={error ?? 'El NDA de este proyecto todavía no está disponible. Contacte con su gestor.'} />
          ) : (
            <>
              <p className="mb-2 text-xs uppercase tracking-wider text-[#1c3742]/50">
                {payload.version.title} — versión {payload.version.version}
              </p>
              <div className="whitespace-pre-wrap border border-[#1c3742]/10 bg-[#faf9f5] p-4 text-xs leading-relaxed text-[#1c3742]/80">
                {payload.version.bodyText}
              </div>
            </>
          )}
        </div>
        {payload?.version && (
          <div className="space-y-3 border-t border-[#1c3742]/15 px-6 py-4">
            <input
              placeholder="Nombre y apellidos completos (firma)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-[#1c3742]/25 bg-[#faf9f5] px-3 py-2 text-sm placeholder:text-[#1c3742]/30 focus:outline-none"
            />
            <label className="flex items-start gap-2 text-xs text-[#1c3742]/70">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" />
              <span>Declaro que he leído y acepto íntegramente este acuerdo de confidencialidad. Entiendo que la firma quedará registrada con fecha, hora y evidencia técnica.</span>
            </label>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="border border-[#1c3742]/30 px-4 py-2 text-sm">Cancelar</button>
              <button
                onClick={sign}
                disabled={!accepted || fullName.trim().length < 5 || signing}
                className="bg-[#1c3742] px-5 py-2 text-sm font-semibold text-[#e6e2d7] disabled:opacity-40"
              >
                {signing ? 'Firmando…' : 'Firmar NDA'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
