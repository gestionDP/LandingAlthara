/**
 * Projects + investor↔project assignments (many-to-many with lifecycle).
 */
import { and, eq, inArray, isNull, like, sql } from 'drizzle-orm';
import { db, schema } from '../db/client';
import { DATAROOM_TENANT, env } from '../config';
import { slugify } from '../core/naming.ts';
import { computeProjectVisibility } from '../core/access.ts';
import { deriveNdaState, type NdaState, type ProjectStatus } from '../core/states.ts';
import { writeAudit, type AuditActor } from '../lib/audit';
import { sendTransactionalEmail } from '../lib/emails/send';
import { AuthzError, type Investor } from '../lib/authz';

const T = DATAROOM_TENANT;

/**
 * Genera un slug único entre los proyectos ACTIVOS (no borrados) del tenant.
 * Los proyectos borrados lógicamente no reservan el slug (índice parcial), así
 * que un nombre repetido tras un borrado recupera su slug base.
 */
async function uniqueProjectSlug(base: string): Promise<string> {
  const rows = await db()
    .select({ slug: schema.projects.slug })
    .from(schema.projects)
    .where(and(
      eq(schema.projects.tenant, T),
      isNull(schema.projects.deletedAt),
      like(schema.projects.slug, `${base}%`),
    ));
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function createProject(
  input: {
    name: string; internalCode?: string; description?: string; investmentType?: string;
    ownerName?: string; ndaRequired?: boolean; ndaPolicy?: 'resign' | 'grandfather' | 'block';
  },
  actor: AuditActor,
) {
  const slug = await uniqueProjectSlug(slugify(input.name));
  const [project] = await db().insert(schema.projects).values({
    tenant: T,
    name: input.name,
    slug,
    internalCode: input.internalCode ?? null,
    description: input.description ?? null,
    investmentType: input.investmentType ?? null,
    ownerName: input.ownerName ?? null,
    ndaRequired: input.ndaRequired ?? true,
    ndaPolicy: input.ndaPolicy ?? 'resign',
    createdBy: actor.id ?? null,
  }).returning();

  // Estructura de carpetas por defecto (spec ALT-RM): 0-1 = Nivel 1 (bienvenida
  // y resumen, solo vista tras verificar identidad); 2-8 = Nivel 2 (requiere NDA).
  const defaults: { name: string; level: number }[] = [
    { name: '0. Bienvenida', level: 1 },
    { name: '1. Resumen de la operación', level: 1 },
    { name: '2. Información corporativa', level: 2 },
    { name: '3. Información financiera', level: 2 },
    { name: '4. Información legal', level: 2 },
    { name: '5. Fiscal', level: 2 },
    { name: '6. Due diligence', level: 2 },
    { name: '7. Garantías y contratos', level: 2 },
    { name: '8. Anexos', level: 2 },
  ];
  await db().insert(schema.documentCategories).values(
    defaults.map((c, i) => ({
      tenant: T, projectId: project.id, name: c.name, slug: slugify(c.name), sortOrder: i, level: c.level,
    })),
  );

  await writeAudit({ tenant: T, actor, action: 'project.created', entityType: 'project', entityId: project.id });
  return project;
}

export async function updateProject(
  projectId: string,
  patch: Partial<{
    name: string; description: string; internalCode: string; investmentType: string;
    ownerName: string; status: ProjectStatus; ndaRequired: boolean;
    ndaPolicy: 'resign' | 'grandfather' | 'block'; coverImagePath: string;
  }>,
  actor: AuditActor,
) {
  const [project] = await db().select().from(schema.projects)
    .where(and(eq(schema.projects.id, projectId), eq(schema.projects.tenant, T))).limit(1);
  if (!project) throw new AuthzError(404, 'project_not_found');

  await db().update(schema.projects)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(schema.projects.id, projectId));

  await writeAudit({
    tenant: T, actor, action: 'project.updated', entityType: 'project', entityId: projectId,
    metadata: { fields: Object.keys(patch) },
  });
  return { ok: true };
}

/** Borrado lógico: el proyecto desaparece de todos los listados; nada se destruye. */
export async function softDeleteProject(projectId: string, actor: AuditActor) {
  const [project] = await db().select().from(schema.projects)
    .where(and(eq(schema.projects.id, projectId), eq(schema.projects.tenant, T))).limit(1);
  if (!project || project.deletedAt) throw new AuthzError(404, 'project_not_found');

  await db().update(schema.projects)
    .set({ deletedAt: new Date(), status: 'archived', updatedAt: new Date() })
    .where(eq(schema.projects.id, projectId));
  // Revocar accesos activos para que la desaparición sea inmediata también por API.
  await db().update(schema.projectAccess)
    .set({ status: 'revoked', revokedAt: new Date(), revokedBy: actor.id ?? null })
    .where(and(eq(schema.projectAccess.projectId, projectId), eq(schema.projectAccess.status, 'active')));

  await writeAudit({ tenant: T, actor, action: 'project.deleted', entityType: 'project', entityId: projectId });
  return { ok: true };
}

export async function grantProjectAccess(
  input: {
    investorId: string; projectId: string;
    accessLevel?: 'generic' | 'full'; notes?: string; notify?: boolean;
  },
  actor: AuditActor,
) {
  const [project] = await db().select().from(schema.projects)
    .where(and(eq(schema.projects.id, input.projectId), eq(schema.projects.tenant, T))).limit(1);
  if (!project) throw new AuthzError(404, 'project_not_found');
  const [investor] = await db().select().from(schema.investors)
    .where(and(eq(schema.investors.id, input.investorId), eq(schema.investors.tenant, T))).limit(1);
  if (!investor) throw new AuthzError(404, 'investor_not_found');

  // Invitación: la asignación nace en 'pending'; el inversor la acepta o
  // rechaza desde su portal. Si ya estaba 'active' se mantiene (idempotente);
  // una re-invitación de un acceso revocado vuelve a 'pending'.
  await db().insert(schema.projectAccess).values({
    tenant: T,
    investorId: input.investorId,
    projectId: input.projectId,
    status: 'pending',
    accessLevel: input.accessLevel ?? 'full',
    internalNotes: input.notes ?? null,
    grantedBy: actor.id ?? null,
  }).onConflictDoUpdate({
    target: [schema.projectAccess.investorId, schema.projectAccess.projectId],
    set: {
      status: sql`case when ${schema.projectAccess.status} = 'active' then 'active'::dataroom.access_status else 'pending'::dataroom.access_status end`,
      accessLevel: input.accessLevel ?? 'full',
      grantedBy: actor.id ?? null,
      grantedAt: new Date(),
      revokedAt: null,
      revokedBy: null,
    },
  });

  await writeAudit({
    tenant: T, actor, action: 'project.access_granted', entityType: 'project_access',
    entityId: `${input.investorId}:${input.projectId}`,
  });

  if (input.notify !== false && investor.status === 'active') {
    await sendTransactionalEmail({
      template: 'project_granted',
      locale: (investor.language as 'es' | 'en') ?? 'es',
      to: investor.email,
      investorId: investor.id,
      params: {
        investorName: investor.firstName ?? undefined,
        projectName: project.name,
        actionUrl: `${env.appBaseUrl()}/dataroom/projects/${project.id}`,
      },
    });
  }
  return { ok: true };
}

export async function revokeProjectAccess(
  input: { investorId: string; projectId: string; notify?: boolean },
  actor: AuditActor,
) {
  const res = await db().update(schema.projectAccess)
    .set({ status: 'revoked', revokedAt: new Date(), revokedBy: actor.id ?? null })
    .where(and(
      eq(schema.projectAccess.investorId, input.investorId),
      eq(schema.projectAccess.projectId, input.projectId),
      eq(schema.projectAccess.tenant, T),
    ))
    .returning({ id: schema.projectAccess.id });
  if (res.length === 0) throw new AuthzError(404, 'assignment_not_found');

  await writeAudit({
    tenant: T, actor, action: 'project.access_revoked', entityType: 'project_access',
    entityId: `${input.investorId}:${input.projectId}`,
  });

  if (input.notify) {
    const [investor] = await db().select().from(schema.investors)
      .where(eq(schema.investors.id, input.investorId)).limit(1);
    const [project] = await db().select().from(schema.projects)
      .where(eq(schema.projects.id, input.projectId)).limit(1);
    if (investor && project) {
      await sendTransactionalEmail({
        template: 'project_revoked',
        locale: (investor.language as 'es' | 'en') ?? 'es',
        to: investor.email,
        investorId: investor.id,
        params: { projectName: project.name },
      });
    }
  }
  return { ok: true };
}

/** El inversor acepta o rechaza una invitación pendiente a un proyecto. */
export async function respondProjectInvitation(
  investor: Investor,
  projectId: string,
  accept: boolean,
) {
  const [row] = await db().select().from(schema.projectAccess).where(and(
    eq(schema.projectAccess.investorId, investor.id),
    eq(schema.projectAccess.projectId, projectId),
    eq(schema.projectAccess.tenant, T),
  )).limit(1);
  if (!row || row.status !== 'pending') throw new AuthzError(404, 'no_pending_invitation');

  await db().update(schema.projectAccess)
    .set(accept
      ? { status: 'active', grantedAt: new Date() }
      : { status: 'revoked', revokedAt: new Date(), revokedBy: investor.id })
    .where(eq(schema.projectAccess.id, row.id));

  await writeAudit({
    tenant: T,
    actor: { type: 'investor', id: investor.id, email: investor.email },
    action: accept ? 'project.invitation_accepted' : 'project.invitation_declined',
    entityType: 'project_access', entityId: `${investor.id}:${projectId}`,
  });
  return { ok: true };
}

/** NDA state for one investor+project (uses active NDA version + policy). */
export async function ndaStateFor(investor: Investor, project: typeof schema.projects.$inferSelect): Promise<NdaState> {
  if (!project.ndaRequired) return 'not_required';
  // NDA GLOBAL: la versión activa es única para todo el portal, y la firma
  // del inversor vale para todos los proyectos que lo requieran.
  const versions = await db().select().from(schema.ndaVersions)
    .where(and(
      eq(schema.ndaVersions.tenant, T),
      isNull(schema.ndaVersions.projectId),
      eq(schema.ndaVersions.active, true),
    ))
    .orderBy(sql`${schema.ndaVersions.version} DESC`).limit(1);
  const active = versions[0];
  if (!active) return 'required'; // NDA requerido pero aún sin publicar

  const sigs = await db()
    .select({
      status: schema.ndaSignatures.status,
      version: schema.ndaVersions.version,
    })
    .from(schema.ndaSignatures)
    .innerJoin(schema.ndaVersions, eq(schema.ndaSignatures.ndaVersionId, schema.ndaVersions.id))
    .where(and(
      eq(schema.ndaSignatures.investorId, investor.id),
      isNull(schema.ndaVersions.projectId),
    ))
    .orderBy(sql`${schema.ndaVersions.version} DESC`)
    .limit(1);

  return deriveNdaState({
    ndaRequired: true,
    hasActiveNdaVersion: true,
    activeVersionNumber: active.version,
    signature: sigs[0] ? { status: sigs[0].status, versionNumber: sigs[0].version } : null,
    policy: project.ndaPolicy,
  });
}

/** Projects visible to an investor, with per-project NDA state + doc counts. */
export async function listAuthorizedProjects(investor: Investor) {
  const rows = await db()
    .select({
      project: schema.projects,
      access: schema.projectAccess,
    })
    .from(schema.projectAccess)
    .innerJoin(schema.projects, eq(schema.projectAccess.projectId, schema.projects.id))
    .where(and(
      eq(schema.projectAccess.investorId, investor.id),
      eq(schema.projectAccess.tenant, T),
      eq(schema.projects.tenant, T),
    ));

  const visible = rows.filter((r) =>
    !r.project.deletedAt &&
    computeProjectVisibility({
      sameTenant: true,
      investorStatus: investor.status,
      projectStatus: r.project.status,
      assignment: { status: r.access.status },
    }),
  );

  const projectIds = visible.map((r) => r.project.id);
  const counts = projectIds.length
    ? await db()
        .select({
          projectId: schema.documents.projectId,
          total: sql<number>`count(*)::int`,
          fresh: sql<number>`count(*) FILTER (WHERE ${schema.documents.updatedAt} > now() - interval '7 days')::int`,
        })
        .from(schema.documents)
        .where(and(
          inArray(schema.documents.projectId, projectIds),
          eq(schema.documents.status, 'published'),
        ))
        .groupBy(schema.documents.projectId)
    : [];
  const countMap = new Map(counts.map((c) => [c.projectId, c]));

  return Promise.all(
    visible.map(async (r) => ({
      id: r.project.id,
      name: r.project.name,
      slug: r.project.slug,
      description: r.project.description,
      coverImagePath: r.project.coverImagePath,
      status: r.project.status,
      investmentType: r.project.investmentType,
      updatedAt: r.project.updatedAt,
      accessStatus: r.access.status,
      accessLevel: r.access.accessLevel,
      documentCount: countMap.get(r.project.id)?.total ?? 0,
      newDocumentCount: countMap.get(r.project.id)?.fresh ?? 0,
      ndaState: await ndaStateFor(investor, r.project),
    })),
  );
}
