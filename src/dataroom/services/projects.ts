/**
 * Projects + investor↔project assignments (many-to-many with lifecycle).
 */
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { db, schema } from '../db/client';
import { DATAROOM_TENANT, env } from '../config';
import { slugify } from '../core/naming.ts';
import { computeProjectVisibility } from '../core/access.ts';
import { deriveNdaState, type NdaState, type ProjectStatus } from '../core/states.ts';
import { writeAudit, type AuditActor } from '../lib/audit';
import { sendTransactionalEmail } from '../lib/emails/send';
import { AuthzError, type Investor } from '../lib/authz';

const T = DATAROOM_TENANT;

export async function createProject(
  input: {
    name: string; internalCode?: string; description?: string; investmentType?: string;
    ownerName?: string; ndaRequired?: boolean; ndaPolicy?: 'resign' | 'grandfather' | 'block';
  },
  actor: AuditActor,
) {
  const slug = slugify(input.name);
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

  // Default document categories
  const defaults = [
    'Presentación corporativa', 'Resumen del proyecto', 'Información financiera',
    'Información legal', 'Due diligence', 'Garantías', 'Estructura societaria',
    'Contratos', 'Documentación de suscripción', 'Anexos',
  ];
  await db().insert(schema.documentCategories).values(
    defaults.map((name, i) => ({
      tenant: T, projectId: project.id, name, slug: slugify(name), sortOrder: i,
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

  // Idempotent: upsert on (investor, project); regrant reactivates.
  await db().insert(schema.projectAccess).values({
    tenant: T,
    investorId: input.investorId,
    projectId: input.projectId,
    accessLevel: input.accessLevel ?? 'full',
    internalNotes: input.notes ?? null,
    grantedBy: actor.id ?? null,
  }).onConflictDoUpdate({
    target: [schema.projectAccess.investorId, schema.projectAccess.projectId],
    set: {
      status: 'active',
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
