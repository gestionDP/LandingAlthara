/**
 * Per-investor watermarking for sensitive downloadable PDFs (pdf-lib, pure JS).
 * Non-PDF formats or oversized files fall back to a plain signed URL — the
 * download is audited either way.
 */
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { maskEmail } from '../core/naming.ts';
import { MAX_WATERMARK_BYTES } from '../config';

export function canWatermark(mimeType: string, sizeBytes: number): boolean {
  return mimeType === 'application/pdf' && sizeBytes <= MAX_WATERMARK_BYTES;
}

/**
 * Formats a Date into a stable, human-readable UTC timestamp such as
 * "2026-07-14 15:32 UTC" (deterministic — derived from toISOString).
 */
function formatWatermarkTimestamp(date: Date): string {
  return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

export async function watermarkPdf(input: {
  pdf: Buffer;
  investorName: string;
  investorEmail: string;
  downloadId: string;
  /** When the download was served. Defaults to now. Kept optional so existing callers are unaffected. */
  timestamp?: Date;
}): Promise<Buffer> {
  const doc = await PDFDocument.load(input.pdf, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const timestampLabel = formatWatermarkTimestamp(input.timestamp ?? new Date());
  const stamp = [
    'CONFIDENCIAL — ALTHARA',
    `${input.investorName} · ${maskEmail(input.investorEmail)} · ${timestampLabel}`,
    `${timestampLabel} · ${input.downloadId.slice(0, 8)}`,
  ].join('   |   ');

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    // Diagonal center watermark
    page.drawText(stamp, {
      x: width * 0.08,
      y: height / 2,
      size: Math.max(9, Math.min(13, width / 60)),
      font,
      color: rgb(0.55, 0.55, 0.55),
      opacity: 0.28,
      rotate: degrees(30),
      maxWidth: width * 1.2,
    });
    // Footer line
    page.drawText(stamp, {
      x: 24,
      y: 14,
      size: 6.5,
      font,
      color: rgb(0.45, 0.45, 0.45),
      opacity: 0.8,
    });
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
