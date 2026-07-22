'use client';

/**
 * Portal del abogado — visado de documentos.
 * Cola de documentos pendientes o rechazados. Un documento no llega al inversor
 * hasta que el abogado lo aprueba.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  fetchJson, Spinner, ErrorBox, EmptyState, FileIcon, DocViewer, formatDate, VisadoProgress,
} from '../components/ui';
import { useToast } from '../DataroomShell';
import {
  closeDataroomPreview, downloadDataroomDocument, openDataroomPreview, type PreviewViewerState,
} from '../lib/preview';

interface QueueItem {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  projectId: string;
  projectName: string;
  legalStatus: string;
  legalReason: string | null;
}

interface QueueData {
  roles: ('legal')[];
  items: QueueItem[];
}

export default function ReviewPage() {
  const toast = useToast();
  const [data, setData] = useState<QueueData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [viewer, setViewer] = useState<PreviewViewerState | null>(null);
  const [previewBusy, setPreviewBusy] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchJson<QueueData>('/api/dataroom/review/queue');
    if (res.ok && res.data) setData(res.data);
    else if (res.status === 403) setError('forbidden');
    else setError(res.error ?? 'error');
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function preview(item: QueueItem) {
    setPreviewBusy(item.id);
    const opened = await openDataroomPreview(item.id, item.title);
    setPreviewBusy(null);
    if (opened) setViewer(opened);
    else toast('No se ha podido abrir la vista previa.', 'error');
  }

  async function approve(item: QueueItem) {
    setActionBusy(item.id);
    const res = await fetchJson(`/api/dataroom/review/documents/${item.id}`, {
      method: 'POST',
      body: JSON.stringify({ role: 'legal', decision: 'approve' }),
    });
    setActionBusy(null);
    if (res.ok) { toast('Documento aprobado.', 'ok'); load(); }
    else toast('No se ha podido aprobar el documento.', 'error');
  }

  async function confirmReject(item: QueueItem) {
    if (reason.trim().length < 3) {
      toast('Indique un motivo de al menos 3 caracteres.', 'error');
      return;
    }
    setActionBusy(item.id);
    const res = await fetchJson(`/api/dataroom/review/documents/${item.id}`, {
      method: 'POST',
      body: JSON.stringify({ role: 'legal', decision: 'reject', reason: reason.trim() }),
    });
    setActionBusy(null);
    if (res.ok) { toast('Documento rechazado.', 'ok'); setRejecting(null); setReason(''); load(); }
    else toast('No se ha podido rechazar el documento.', 'error');
  }

  if (loading) return <Spinner label="Cargando su cola de visado…" />;
  if (error === 'forbidden') {
    return <ErrorBox message="Su cuenta no tiene permisos de revisión en este portal. Si cree que se trata de un error, contacte con Althara." />;
  }
  if (error || !data) return <ErrorBox message="No hemos podido cargar la cola de visado." onRetry={load} />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c08552]">
          Revisión · Abogado
        </p>
        <h1 className="mt-1 font-playfair text-3xl">Documentos pendientes de su visado</h1>
        <p className="mt-1 text-sm text-[#1c3742]/60">
          Revise cada documento y apruebe o rechace. Un documento no se publica al inversor
          hasta que usted lo apruebe.
        </p>
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          title="No tiene documentos pendientes de visado"
          subtitle="Cuando Althara suba o versione un documento que requiera su visado, aparecerá aquí."
        />
      ) : (
        <ul className="space-y-3">
          {data.items.map((item) => {
            const pending = item.legalStatus === 'pending';
            const busy = actionBusy === item.id;
            const isRejecting = rejecting === item.id;
            return (
              <li key={item.id} className="rounded-lg border border-[#1c3742]/10 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <FileIcon fileName={item.title} />
                    <div className="min-w-0">
                      <p className="truncate font-playfair text-lg leading-snug">{item.title}</p>
                      <p className="text-[11px] uppercase tracking-wider text-[#1c3742]/50">
                        {item.projectName} · actualizado {formatDate(item.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => preview(item)}
                    disabled={previewBusy === item.id}
                    className="shrink-0 border border-[#1c3742]/25 px-4 py-2 text-xs font-medium text-[#1c3742] transition-colors hover:bg-[#1c3742]/5 disabled:opacity-40 rounded-md"
                  >
                    {previewBusy === item.id ? '…' : 'Vista previa'}
                  </button>
                </div>

                <div className="mt-4 max-w-md">
                  <VisadoProgress legalStatus={item.legalStatus} />
                </div>
                {item.legalStatus === 'rejected' && item.legalReason && (
                  <p className="mt-2 text-[11px] text-red-600">Motivo: {item.legalReason}</p>
                )}

                <div className="mt-4 space-y-3 border-t border-[#1c3742]/10 pt-4">
                  {!pending && (
                    <p className="text-[11px] text-[#1c3742]/55">
                      Ya no requiere su acción. En espera de que el administrador suba una versión corregida
                      (al hacerlo, el visado se reiniciará y volverá a aparecer aquí).
                    </p>
                  )}
                  {pending && (
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => approve(item)}
                          disabled={busy || isRejecting}
                          className="bg-[#1c3742] px-4 py-1.5 text-xs font-semibold text-[#e6e2d7] transition-colors hover:bg-[#c08552] disabled:opacity-40 rounded-md"
                        >
                          {busy ? '…' : 'Aprobar'}
                        </button>
                        <button
                          onClick={() => { setRejecting(item.id); setReason(''); }}
                          disabled={busy || isRejecting}
                          className="border border-red-300 px-4 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-40 rounded-md"
                        >
                          Rechazar
                        </button>
                      </div>
                      {isRejecting && (
                        <div className="mt-3">
                          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[#1c3742]/60">
                            Motivo del rechazo *
                          </label>
                          <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="Explique por qué rechaza el visado (mínimo 3 caracteres)."
                            className="w-full border border-[#1c3742]/25 bg-white px-3 py-2 text-sm focus:border-[#1c3742]/50 focus:outline-none rounded-md"
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => confirmReject(item)}
                              disabled={busy || reason.trim().length < 3}
                              className="bg-red-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-40 rounded-md"
                            >
                              {busy ? 'Enviando…' : 'Confirmar rechazo'}
                            </button>
                            <button
                              onClick={() => { setRejecting(null); setReason(''); }}
                              disabled={busy}
                              className="border border-[#1c3742]/25 px-4 py-1.5 text-xs font-medium text-[#1c3742] transition-colors hover:bg-[#1c3742]/5 disabled:opacity-40 rounded-md"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {viewer && (
        <DocViewer
          title={viewer.title}
          src={viewer.src}
          mimeType={viewer.mimeType}
          fileName={viewer.fileName}
          onClose={() => closeDataroomPreview(viewer, () => setViewer(null))}
          onDownload={() => downloadDataroomDocument(viewer.docId)}
        />
      )}
    </div>
  );
}
