'use client';

/**
 * REVISOR — vista global: todos los documentos de todos los proyectos, con su
 * estado de visado. Solo lectura + vista previa (para consultar cualquier
 * documento, esté pendiente, aprobado o rechazado).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchJson, Spinner, ErrorBox, EmptyState, FileIcon, DocViewer, Badge, formatDate, VisadoInline,
} from '../../components/ui';
import { useDataroomSearch, useToast } from '../../DataroomShell';

interface Item {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  legalStatus: string;
  legalReason: string | null;
  taxStatus: string;
  taxReason: string | null;
  projectId: string;
  projectName: string;
  projectStatus: string;
  categoryName: string | null;
}

export default function ReviewAllPage() {
  const toast = useToast();
  const search = useDataroomSearch().toLowerCase();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewBusy, setPreviewBusy] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ title: string; src: string; mimeType?: string | null; fileName?: string | null } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetchJson<{ items: Item[] }>('/api/dataroom/review/all');
    if (res.ok && res.data) setItems(res.data.items);
    else if (res.status === 403) setError('forbidden');
    else setError(res.error ?? 'error');
  }, []);

  useEffect(() => { load(); }, [load]);

  async function preview(item: Item) {
    setPreviewBusy(item.id);
    const res = await fetchJson<{ url: string; mimeType: string; fileName: string }>(
      `/api/dataroom/review/documents/${item.id}/file?kind=preview`,
    );
    setPreviewBusy(null);
    if (res.ok && res.data?.url) {
      setViewer({ title: item.title, src: res.data.url, mimeType: res.data.mimeType, fileName: res.data.fileName });
    } else {
      toast('No se ha podido abrir la vista previa.', 'error');
    }
  }

  // Agrupar por proyecto (aplicando el buscador global por nombre de doc/proyecto/carpeta).
  const groups = useMemo(() => {
    if (!items) return [];
    const filtered = search
      ? items.filter((i) =>
          i.title.toLowerCase().includes(search) ||
          i.projectName.toLowerCase().includes(search) ||
          (i.categoryName ?? '').toLowerCase().includes(search))
      : items;
    const map = new Map<string, { id: string; name: string; status: string; docs: Item[] }>();
    for (const it of filtered) {
      const g = map.get(it.projectId) ?? { id: it.projectId, name: it.projectName, status: it.projectStatus, docs: [] };
      g.docs.push(it);
      map.set(it.projectId, g);
    }
    return [...map.values()];
  }, [items, search]);

  if (error === 'forbidden') {
    return <ErrorBox message="Su cuenta no tiene permisos de revisión en este portal." />;
  }
  if (error) return <ErrorBox message="No hemos podido cargar los documentos." onRetry={load} />;
  if (!items) return <Spinner label="Cargando documentos…" />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c08552]">Revisión · Todo</p>
        <h1 className="mt-1 font-playfair text-3xl">Todos los documentos</h1>
        <p className="mt-1 text-sm text-[#1c3742]/60">
          Consulte cualquier documento de cualquier proyecto, esté pendiente, aprobado o rechazado.
          Para aprobar o rechazar, use <span className="font-medium">Revisión</span>.
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState title="No hay documentos" subtitle="Cuando se suban documentos aparecerán aquí." />
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.id} className="rounded-lg border border-[#1c3742]/10 bg-white">
              <div className="flex items-center gap-2 border-b border-[#1c3742]/10 px-4 py-3">
                <h2 className="font-playfair text-lg">{g.name}</h2>
                <Badge value={g.status} />
                <span className="ml-auto text-[11px] text-[#1c3742]/50">{g.docs.length} doc{g.docs.length !== 1 ? 's' : ''}</span>
              </div>
              <ul className="divide-y divide-[#1c3742]/8">
                {g.docs.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <FileIcon fileName={d.title} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1c3742]">{d.title}</p>
                      <p className="text-[11px] text-[#1c3742]/50">
                        {d.categoryName ?? 'Sin carpeta'} · {formatDate(d.updatedAt)}
                      </p>
                      {(d.legalStatus === 'rejected' && d.legalReason) && (
                        <p className="text-[11px] text-red-600">Motivo (abogado): {d.legalReason}</p>
                      )}
                      {(d.taxStatus === 'rejected' && d.taxReason) && (
                        <p className="text-[11px] text-red-600">Motivo (fiscal): {d.taxReason}</p>
                      )}
                    </div>
                    <VisadoInline legalStatus={d.legalStatus} taxStatus={d.taxStatus} />
                    <button
                      onClick={() => preview(d)}
                      disabled={previewBusy === d.id}
                      className="shrink-0 rounded-md border border-[#1c3742]/25 px-3 py-1.5 text-xs font-medium text-[#1c3742] transition-colors hover:bg-[#1c3742]/5 disabled:opacity-40"
                    >
                      {previewBusy === d.id ? '…' : 'Vista previa'}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {viewer && (
        <DocViewer
          title={viewer.title}
          src={viewer.src}
          mimeType={viewer.mimeType}
          fileName={viewer.fileName}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}
