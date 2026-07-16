/** Abre un documento en el visor incrustado vía stream same-origin (sin CORS). */

export type PreviewViewerState = {
  title: string;
  src: string;
  mimeType: string | null;
  fileName: string | null;
  revoke: string;
  docId: string;
};

export async function openDataroomPreview(
  docId: string,
  title: string,
  apiBase = `/api/dataroom/review/documents/${docId}/file`,
): Promise<PreviewViewerState | null> {
  const res = await fetch(`${apiBase}?kind=preview&stream=1`, { cache: 'no-store' });
  if (!res.ok) return null;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const mimeType = res.headers.get('content-type')?.split(';')[0]?.trim() ?? blob.type ?? null;
  const cd = res.headers.get('content-disposition') ?? '';
  const fileName = cd.match(/filename="([^"]+)"/i)?.[1] ?? null;
  return { title, src: url, mimeType, fileName, revoke: url, docId };
}

export function closeDataroomPreview(viewer: PreviewViewerState | null, onClose: () => void) {
  if (viewer?.revoke) {
    const revoke = viewer.revoke;
    setTimeout(() => URL.revokeObjectURL(revoke), 100);
  }
  onClose();
}

export function downloadDataroomDocument(
  docId: string,
  apiBase = `/api/dataroom/review/documents/${docId}/file`,
) {
  window.open(`${apiBase}?kind=download&stream=1`, '_blank', 'noopener');
}
