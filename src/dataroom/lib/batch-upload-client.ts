/** Subida de muchos archivos uno a uno (evita 413 por límite de tamaño del request). */

export type ProjectUploadMeta = {
  categoryId?: string;
  confidentiality: string;
  downloadable: boolean;
  requiresNda: boolean;
  publish: boolean;
  notify?: boolean;
  restrictToInvestorIds?: string[];
};

export type UploadFileResult = {
  fileName: string;
  ok: boolean;
  documentId?: string;
  error?: string;
};

export type BatchUploadProgress = {
  done: number;
  total: number;
  current?: string;
};

export type BatchUploadOutcome = {
  results: UploadFileResult[];
  notified: number;
};

export async function uploadProjectDocuments(
  projectId: string,
  files: File[],
  meta: ProjectUploadMeta,
  onProgress?: (progress: BatchUploadProgress) => void,
): Promise<BatchUploadOutcome> {
  const results: UploadFileResult[] = [];
  const publishedIds: string[] = [];
  const baseMeta = { ...meta, notify: false };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.({ done: i, total: files.length, current: file.name });

    const form = new FormData();
    form.append('files', file);
    form.append('meta', JSON.stringify(baseMeta));

    try {
      const res = await fetch(`/api/dataroom/admin/projects/${projectId}/documents`, { method: 'POST', body: form });
      const body = await res.json().catch(() => null);
      if (res.ok && body?.results?.[0]) {
        const r = body.results[0] as UploadFileResult;
        results.push(r);
        if (r.ok && r.documentId && meta.publish) publishedIds.push(r.documentId);
      } else {
        results.push({ fileName: file.name, ok: false, error: body?.error ?? String(res.status) });
      }
    } catch {
      results.push({ fileName: file.name, ok: false, error: 'network_error' });
    }
  }

  onProgress?.({ done: files.length, total: files.length });

  let notified = 0;
  if (meta.notify && publishedIds.length > 0) {
    try {
      const res = await fetch(`/api/dataroom/admin/projects/${projectId}/documents/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds: publishedIds }),
      });
      const body = await res.json().catch(() => null);
      if (res.ok) notified = body?.notified ?? 0;
    } catch { /* upload ok; notification is best-effort */ }
  }

  return { results, notified };
}

export function summarizeUploadOutcome(outcome: BatchUploadOutcome): string {
  const ok = outcome.results.filter((r) => r.ok).length;
  const failed = outcome.results.filter((r) => !r.ok);
  const parts = [`${ok} archivo(s) subido(s)`];
  if (failed.length) {
    const codes = [...new Set(failed.map((f) => f.error ?? 'error'))].slice(0, 3).join(', ');
    parts.push(`${failed.length} con error (${codes})`);
  }
  if (outcome.notified) parts.push(`${outcome.notified} inversor(es) notificado(s)`);
  return parts.join(' · ');
}
