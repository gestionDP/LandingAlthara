'use client';

/**
 * Project data room: category navigation, search, document list with lock
 * states, NDA gate with automatic unlock (refetch after signature — no
 * manual reload anywhere).
 */
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchJson, Spinner, ErrorBox, EmptyState, Badge, FileIcon, formatBytes, formatDate } from '../../components/ui';

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
  const [category, setCategory] = useState<string>('all');
  const [ndaOpen, setNdaOpen] = useState(false);
  const [busyDoc, setBusyDoc] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetchJson<ProjectData>(`/api/dataroom/projects/${id}`);
    if (res.ok && res.data) setData(res.data);
    else setError(res.status === 404 ? 'not_found' : res.error ?? 'error');
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.documents.filter((d) => {
      if (category !== 'all' && d.categorySlug !== category) return false;
      if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data, search, category]);

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

      {/* Barra estilo biblioteca: buscador + carpetas de categorías */}
      <div className="space-y-3">
        <input
          placeholder="Buscar en esta biblioteca…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-[#1c3742]/20 bg-white px-4 py-2 text-sm shadow-sm placeholder:text-[#1c3742]/35 focus:border-[#1c3742]/50 focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-medium transition ${category === 'all' ? 'bg-[#1c3742] text-[#e6e2d7]' : 'border border-[#1c3742]/20 bg-white text-[#1c3742]/70 hover:bg-[#1c3742]/5'}`}
          >
            Todos los documentos
          </button>
          {data.categories
            .filter((c) => data.documents.some((d) => d.categorySlug === c.slug))
            .map((c) => {
              const count = data.documents.filter((d) => d.categorySlug === c.slug).length;
              return (
                <button
                  key={c.slug}
                  onClick={() => setCategory(category === c.slug ? 'all' : c.slug)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium transition ${category === c.slug ? 'bg-[#1c3742] text-[#e6e2d7]' : 'border border-[#1c3742]/20 bg-white text-[#1c3742]/70 hover:bg-[#1c3742]/5'}`}
                >
                  {c.name}
                  <span className={category === c.slug ? 'text-[#e6e2d7]/60' : 'text-[#1c3742]/40'}>{count}</span>
                </button>
              );
            })}
        </div>
      </div>

      {docError && <ErrorBox message={docError} />}

      {filtered.length === 0 ? (
        <EmptyState
          title={data.documents.length === 0 ? 'Todavía no hay documentos publicados' : 'Sin resultados'}
          subtitle={data.documents.length === 0 ? 'Recibirá una notificación cuando se publique documentación.' : 'Pruebe con otra búsqueda o categoría.'}
        />
      ) : (
        <div className="overflow-x-auto border border-[#1c3742]/10 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1c3742]/15 text-left text-[11px] uppercase tracking-wider text-[#1c3742]/50">
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Nivel</th>
                <th className="px-4 py-3">Tamaño</th>
                <th className="px-4 py-3">Versión</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id} className="border-b border-[#1c3742]/10 last:border-0 hover:bg-[#1c3742]/[0.04]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {doc.locked ? (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#1c3742]/5 text-[10px] font-bold uppercase tracking-wide text-[#1c3742]/50" title="Bloqueado" aria-hidden>NDA</span>
                      ) : (
                        <FileIcon mimeType={doc.mimeType} />
                      )}
                      <div>
                        <p className={doc.locked ? 'text-[#1c3742]/50' : 'font-medium'}>{doc.title}</p>
                        {doc.description && !doc.locked && (
                          <p className="text-xs text-[#1c3742]/50">{doc.description}</p>
                        )}
                      </div>
                      {doc.isNew && (
                        <span className="bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">Nuevo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#1c3742]/60">{doc.category ?? '—'}</td>
                  <td className="px-4 py-3"><Badge value={doc.confidentiality} /></td>
                  <td className="px-4 py-3 text-[#1c3742]/60">{doc.locked ? '—' : formatBytes(doc.sizeBytes)}</td>
                  <td className="px-4 py-3 text-[#1c3742]/60">{doc.locked ? '—' : `v${doc.versionNumber ?? 1}`}</td>
                  <td className="px-4 py-3 text-[#1c3742]/60">{formatDate(doc.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {doc.locked ? (
                      <span className="text-xs text-[#8a5a33]/90">
                        {doc.lockReason === 'nda_required' ? 'Requiere NDA' : 'No disponible'}
                      </span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openDoc(doc, 'preview')}
                          disabled={busyDoc === doc.id}
                          className="border border-[#1c3742]/30 px-3 py-1 text-xs hover:bg-[#1c3742]/5 disabled:opacity-40"
                        >
                          Ver
                        </button>
                        {doc.canDownload && (
                          <button
                            onClick={() => openDoc(doc, 'download')}
                            disabled={busyDoc === doc.id}
                            className="bg-[#1c3742] px-3 py-1 text-xs font-semibold text-[#e6e2d7] disabled:opacity-40"
                          >
                            Descargar
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasLockedDocs && ndaPending && (
        <p className="text-xs text-[#1c3742]/50">
          Los documentos bloqueados se desbloquearan automaticamente al firmar el NDA.
        </p>
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
