/**
 * Generates the archived signed copy of an NDA (pdf-lib): full agreement
 * text + signature evidence block. Stored privately in GCS.
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function buildSignedNdaPdf(input: {
  title: string;
  bodyText: string;
  version: number;
  bodySha256: string;
  signerFullName: string;
  signerEmail: string;
  projectName: string;
  signedAtIso: string;
  ip?: string | null;
  signatureId: string;
}): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageSize: [number, number] = [595, 842]; // A4
  const margin = 56;
  const width = pageSize[0] - margin * 2;
  let page = doc.addPage(pageSize);
  let y = pageSize[1] - margin;

  const write = (text: string, opts: { size?: number; bold?: boolean; gap?: number } = {}) => {
    const size = opts.size ?? 10;
    const f = opts.bold ? bold : font;
    const words = text.split(/\s+/);
    let line = '';
    const lines: string[] = [];
    for (const w of words) {
      const candidate = line ? `${line} ${w}` : w;
      if (f.widthOfTextAtSize(candidate, size) > width) {
        lines.push(line);
        line = w;
      } else line = candidate;
    }
    if (line) lines.push(line);
    for (const l of lines) {
      if (y < margin + 40) {
        page = doc.addPage(pageSize);
        y = pageSize[1] - margin;
      }
      page.drawText(l, { x: margin, y, size, font: f, color: rgb(0.1, 0.15, 0.18) });
      y -= size * 1.45;
    }
    y -= opts.gap ?? 4;
  };

  write('ALTHARA — ACUERDO DE CONFIDENCIALIDAD (NDA)', { size: 14, bold: true, gap: 8 });
  write(`${input.title} — Proyecto: ${input.projectName} — Versión ${input.version}`, {
    size: 11,
    bold: true,
    gap: 12,
  });

  for (const paragraph of input.bodyText.split(/\n\n+/)) {
    write(paragraph.replace(/\n/g, ' '), { gap: 6 });
  }

  y -= 12;
  write('REGISTRO DE FIRMA ELECTRÓNICA (click-wrap)', { size: 11, bold: true, gap: 6 });
  write(`Firmante: ${input.signerFullName} <${input.signerEmail}>`);
  write(`Fecha y hora (UTC): ${input.signedAtIso}`);
  if (input.ip) write(`Dirección IP: ${input.ip}`);
  write(`Identificador de firma: ${input.signatureId}`);
  write(`SHA-256 del texto aceptado: ${input.bodySha256}`, { gap: 10 });
  write(
    'El firmante declaró haber leído y aceptado íntegramente el presente acuerdo mediante el mecanismo de aceptación del portal privado de inversores de Althara.',
    { size: 9 },
  );

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
