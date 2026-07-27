import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeDocumentAccess, computeProjectVisibility, type AccessInput } from '../core/access.ts';

const allowed: AccessInput = {
  sameTenant: true,
  investorStatus: 'active',
  projectStatus: 'active',
  assignment: { status: 'active', accessLevel: 'full' },
  document: { status: 'published', confidentiality: 'sensitive', downloadable: true, requiresNda: true },
  permission: null,
  ndaState: 'signed',
};

describe('computeDocumentAccess — deny by default', () => {
  it('grants view+download on the fully-authorized case', () => {
    assert.deepEqual(computeDocumentAccess(allowed), { canView: true, canDownload: true, reason: null });
  });
  it('denies cross-tenant no matter what', () => {
    assert.equal(computeDocumentAccess({ ...allowed, sameTenant: false }).reason, 'tenant_mismatch');
  });
  it('denies suspended/disabled/invited accounts', () => {
    for (const s of ['suspended', 'disabled', 'invited', 'draft', 'registration_started'] as const)
      assert.equal(computeDocumentAccess({ ...allowed, investorStatus: s }).reason, 'account_inactive');
  });
  it('denies when project is not active', () => {
    for (const s of ['draft', 'temporarily_unavailable', 'closed', 'archived'] as const)
      assert.equal(computeDocumentAccess({ ...allowed, projectStatus: s }).reason, 'project_unavailable');
  });
  it('denies unassigned and revoked/suspended assignments (revocation is immediate)', () => {
    assert.equal(computeDocumentAccess({ ...allowed, assignment: null }).reason, 'not_assigned');
    assert.equal(
      computeDocumentAccess({ ...allowed, assignment: { status: 'revoked', accessLevel: 'full' } }).reason,
      'assignment_inactive',
    );
    assert.equal(
      computeDocumentAccess({ ...allowed, assignment: { status: 'suspended', accessLevel: 'full' } }).reason,
      'assignment_inactive',
    );
  });
  it('denies non-published documents (draft/archived/revoked)', () => {
    for (const s of ['draft', 'archived', 'revoked'] as const)
      assert.equal(
        computeDocumentAccess({ ...allowed, document: { ...allowed.document, status: s } }).reason,
        'document_unavailable',
      );
  });
  it('explicit deny overrides everything else', () => {
    assert.equal(
      computeDocumentAccess({ ...allowed, permission: { effect: 'deny', canDownload: true } }).reason,
      'explicit_deny',
    );
  });
  it('sensitive doc without signed NDA is blocked', () => {
    for (const nda of ['pending_signature', 'required', 'expired', 'revoked'] as const)
      assert.equal(computeDocumentAccess({ ...allowed, ndaState: nda }).reason, 'nda_required');
  });
  it('generic doc does not need NDA', () => {
    const d = computeDocumentAccess({
      ...allowed,
      ndaState: 'pending_signature',
      document: { ...allowed.document, confidentiality: 'generic', requiresNda: false },
    });
    assert.ok(d.canView);
  });
  it('limited (generic) assignment sees ONLY explicitly-shared docs — pure Drive model', () => {
    // Sin permiso allow no ve nada, ni general ni confidencial.
    for (const conf of ['generic', 'sensitive'] as const) {
      const base = {
        ...allowed,
        assignment: { status: 'active', accessLevel: 'generic' } as const,
        document: { ...allowed.document, confidentiality: conf },
      };
      assert.equal(computeDocumentAccess(base).reason, 'level_insufficient');
      const withAllow = computeDocumentAccess({ ...base, permission: { effect: 'allow', canDownload: true } });
      assert.ok(withAllow.canView, `shared ${conf} doc should be visible`);
    }
  });
  it('can revoke download while keeping preview', () => {
    const d = computeDocumentAccess({ ...allowed, permission: { effect: 'allow', canDownload: false } });
    assert.ok(d.canView);
    assert.ok(!d.canDownload);
  });
  it('non-downloadable document never downloads', () => {
    const d = computeDocumentAccess({
      ...allowed,
      document: { ...allowed.document, downloadable: false },
    });
    assert.ok(d.canView);
    assert.ok(!d.canDownload);
  });
});

describe('computeProjectVisibility', () => {
  it('assigned + active investor sees non-draft projects', () => {
    assert.ok(
      computeProjectVisibility({
        sameTenant: true,
        investorStatus: 'active',
        projectStatus: 'active',
        assignment: { status: 'active' },
      }),
    );
  });
  it('draft and archived projects are invisible; revoked assignment hides project', () => {
    assert.ok(
      !computeProjectVisibility({
        sameTenant: true,
        investorStatus: 'active',
        projectStatus: 'draft',
        assignment: { status: 'active' },
      }),
    );
    assert.ok(
      !computeProjectVisibility({
        sameTenant: true,
        investorStatus: 'active',
        projectStatus: 'active',
        assignment: { status: 'revoked' },
      }),
    );
    assert.ok(
      !computeProjectVisibility({
        sameTenant: false,
        investorStatus: 'active',
        projectStatus: 'active',
        assignment: { status: 'active' },
      }),
    );
  });
});

/**
 * L4 · cartera completa — «inversor global» de la matriz de accesos
 * (ALT-WEB-2026-01 v1.2 §07). Ve todos los proyectos del tenant sin fila de
 * asignación, pero ninguna otra puerta se relaja.
 */
describe('acceso global (L4 · cartera completa)', () => {
  const globalNoRow: AccessInput = { ...allowed, assignment: null, globalAccess: true };

  it('sustituye la asignación ausente por un acceso completo activo', () => {
    assert.deepEqual(computeDocumentAccess(globalNoRow), {
      canView: true,
      canDownload: true,
      reason: null,
    });
  });

  it('no anula una asignación revocada o suspendida por un administrador', () => {
    for (const s of ['revoked', 'suspended'] as const)
      assert.equal(
        computeDocumentAccess({
          ...globalNoRow,
          assignment: { status: s, accessLevel: 'full' },
        }).reason,
        'assignment_inactive',
      );
  });

  it('respeta la asignación limitada existente en lugar de ampliarla', () => {
    assert.equal(
      computeDocumentAccess({
        ...globalNoRow,
        assignment: { status: 'active', accessLevel: 'generic' },
      }).reason,
      'level_insufficient',
    );
  });

  it('sigue exigiendo NDA firmado para documentos sensibles', () => {
    assert.equal(
      computeDocumentAccess({ ...globalNoRow, ndaState: 'pending_signature' }).reason,
      'nda_required',
    );
  });

  it('sigue respetando la denegación explícita sobre un documento', () => {
    assert.equal(
      computeDocumentAccess({
        ...globalNoRow,
        permission: { effect: 'deny', canDownload: false },
      }).reason,
      'explicit_deny',
    );
  });

  it('no cruza el tenant ni resucita una cuenta inactiva', () => {
    assert.equal(computeDocumentAccess({ ...globalNoRow, sameTenant: false }).reason, 'tenant_mismatch');
    assert.equal(
      computeDocumentAccess({ ...globalNoRow, investorStatus: 'suspended' }).reason,
      'account_inactive',
    );
  });

  it('hace visible un proyecto activo sin asignación, pero no uno en borrador', () => {
    const base = {
      sameTenant: true,
      investorStatus: 'active' as const,
      assignment: null,
      globalAccess: true,
    };
    assert.ok(computeProjectVisibility({ ...base, projectStatus: 'active' }));
    assert.ok(!computeProjectVisibility({ ...base, projectStatus: 'draft' }));
    assert.ok(!computeProjectVisibility({ ...base, projectStatus: 'archived' }));
    assert.ok(
      !computeProjectVisibility({
        ...base,
        projectStatus: 'active',
        assignment: { status: 'revoked' },
      }),
    );
  });

  it('sin acceso global, la ausencia de asignación sigue denegando', () => {
    assert.equal(
      computeDocumentAccess({ ...allowed, assignment: null, globalAccess: false }).reason,
      'not_assigned',
    );
  });
});
