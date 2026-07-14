import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateUpload,
  buildStoragePath,
  safeDownloadName,
  slugify,
  maskEmail,
} from '../core/naming.ts';

const MB = 1024 * 1024;

describe('upload validation', () => {
  it('accepts allowed types with matching MIME', () => {
    assert.deepEqual(
      validateUpload({ fileName: 'model.pdf', mimeType: 'application/pdf', sizeBytes: MB, maxBytes: 50 * MB }),
      { ok: true, ext: 'pdf' },
    );
    assert.ok(
      validateUpload({
        fileName: 'datos.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        sizeBytes: MB,
        maxBytes: 50 * MB,
      }).ok,
    );
  });
  it('rejects executables, zip (until validated), svg/html, mime mismatch, oversize, empty', () => {
    const base = { sizeBytes: MB, maxBytes: 50 * MB };
    assert.equal((validateUpload({ ...base, fileName: 'x.exe', mimeType: 'application/pdf' }) as any).error, 'blocked_extension');
    assert.equal((validateUpload({ ...base, fileName: 'x.zip', mimeType: 'application/zip' }) as any).error, 'blocked_extension');
    assert.equal((validateUpload({ ...base, fileName: 'x.svg', mimeType: 'image/svg+xml' }) as any).error, 'blocked_extension');
    assert.equal((validateUpload({ ...base, fileName: 'x.pdf', mimeType: 'text/html' }) as any).error, 'mime_mismatch');
    assert.equal((validateUpload({ ...base, fileName: 'x' , mimeType: 'application/pdf' }) as any).error, 'missing_extension');
    assert.equal((validateUpload({ fileName: 'x.pdf', mimeType: 'application/pdf', sizeBytes: 51 * MB, maxBytes: 50 * MB }) as any).error, 'file_too_large');
    assert.equal((validateUpload({ fileName: 'x.pdf', mimeType: 'application/pdf', sizeBytes: 0, maxBytes: 50 * MB }) as any).error, 'empty_file');
  });
});

describe('storage naming', () => {
  it('storage path is opaque and never contains the original filename', () => {
    const p = buildStoragePath({ tenant: 'althara', projectId: 'p1', documentId: 'd1', versionId: 'v1', ext: 'pdf' });
    assert.equal(p, 'dataroom/althara/p1/d1/v1.pdf');
  });
  it('download name is sanitized', () => {
    assert.equal(safeDownloadName('Modelo Financiero <2026> / v2', 'xlsx'), 'Modelo_Financiero_2026_v2.xlsx');
  });
  it('slugify handles accents and symbols', () => {
    assert.equal(slugify('Proyecto Sóller — Fase II'), 'proyecto-soller-fase-ii');
  });
  it('maskEmail hides most of the address', () => {
    assert.equal(maskEmail('maria.lopez@example.com'), 'm***@e***.com');
  });
});
