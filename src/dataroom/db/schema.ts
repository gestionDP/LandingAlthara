/**
 * Dataroom data model. All tables live in the dedicated PostgreSQL schema
 * "dataroom" inside the existing Althara Neon database (logical isolation,
 * zero contact with shared/public models).
 */
import { sql } from 'drizzle-orm';
import {
  pgSchema,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const dataroom = pgSchema('dataroom');

/* ---------------------------------- enums --------------------------------- */

export const investorStatusEnum = dataroom.enum('investor_status', [
  'draft',
  'invited',
  'invitation_expired',
  'invitation_revoked',
  'registration_started',
  'pending_validation',
  'rejected',
  'active',
  'suspended',
  'disabled',
]);

/** Estado del visado del abogado sobre un documento. */
export const reviewStatusEnum = dataroom.enum('review_status', ['pending', 'approved', 'rejected']);

export const investorTypeEnum = dataroom.enum('investor_type', [
  'individual',
  'legal_entity',
  'professional',
  'institutional',
]);

export const invitationStatusEnum = dataroom.enum('invitation_status', [
  'pending',
  'used',
  'revoked',
  'expired',
]);

export const projectStatusEnum = dataroom.enum('project_status', [
  'draft',
  'active',
  'temporarily_unavailable',
  'closed',
  'archived',
]);

export const accessStatusEnum = dataroom.enum('access_status', ['pending', 'active', 'suspended', 'revoked']);

export const accessLevelEnum = dataroom.enum('access_level', ['generic', 'full']);

export const confidentialityEnum = dataroom.enum('confidentiality', ['generic', 'sensitive']);

export const documentStatusEnum = dataroom.enum('document_status', [
  'draft',
  'published',
  'archived',
  'revoked',
]);

export const versionStatusEnum = dataroom.enum('version_status', [
  'draft',
  'published',
  'superseded',
  'archived',
  'revoked',
]);

export const permissionEffectEnum = dataroom.enum('permission_effect', ['allow', 'deny']);

export const ndaSignatureStatusEnum = dataroom.enum('nda_signature_status', [
  'signed',
  'expired',
  'revoked',
]);

export const ndaPolicyEnum = dataroom.enum('nda_policy', ['resign', 'grandfather', 'block']);

/* --------------------------------- tables --------------------------------- */

export const investors = dataroom.table(
  'investors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    email: text('email').notNull(),
    clerkUserId: text('clerk_user_id'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    company: text('company'),
    phone: text('phone'),
    country: text('country'),
    investorType: investorTypeEnum('investor_type'),
    language: text('language').notNull().default('es'),
    status: investorStatusEnum('status').notNull().default('draft'),
    rejectionReason: text('rejection_reason'),
    privacyAcceptedAt: timestamp('privacy_accepted_at', { withTimezone: true }),
    termsAcceptedAt: timestamp('terms_accepted_at', { withTimezone: true }),
    termsVersion: text('terms_version'),
    internalNotes: text('internal_notes'),
    invitedAt: timestamp('invited_at', { withTimezone: true }),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
    lastAccessAt: timestamp('last_access_at', { withTimezone: true }),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('uq_investors_tenant_email').on(t.tenant, t.email),
    uniqueIndex('uq_investors_clerk_user').on(t.clerkUserId),
    index('ix_investors_tenant_status').on(t.tenant, t.status),
  ],
);

/**
 * KYC del inversor. Réplica de InvestorKycBase del backend: los campos
 * sensibles (nº documento, teléfono, perfil) viajan cifrados en encryptedPayload;
 * documentType y residenceCountry quedan en claro (operativos). Una fila por inversor.
 */
export const investorKyc = dataroom.table(
  'investor_kyc',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    investorId: uuid('investor_id')
      .notNull()
      .references(() => investors.id),
    documentType: text('document_type').notNull(),
    residenceCountry: text('residence_country').notNull(),
    encryptedPayload: text('encrypted_payload').notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('uq_investor_kyc_investor').on(t.investorId)],
);

export const invitations = dataroom.table(
  'invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    investorId: uuid('investor_id')
      .notNull()
      .references(() => investors.id),
    /** SHA-256 of the raw token; the raw token is never stored. */
    tokenHash: text('token_hash').notNull(),
    status: invitationStatusEnum('status').notNull().default('pending'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    attemptCount: integer('attempt_count').notNull().default(0),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uq_invitations_token_hash').on(t.tokenHash),
    index('ix_invitations_investor').on(t.investorId),
  ],
);

export const projects = dataroom.table(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    internalCode: text('internal_code'),
    description: text('description'),
    coverImagePath: text('cover_image_path'),
    status: projectStatusEnum('status').notNull().default('draft'),
    investmentType: text('investment_type'),
    ownerName: text('owner_name'),
    visibility: text('visibility').notNull().default('private'),
    ndaRequired: boolean('nda_required').notNull().default(true),
    ndaPolicy: ndaPolicyEnum('nda_policy').notNull().default('resign'),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    // Parcial: los proyectos borrados (deleted_at) no reservan el slug, de modo
    // que se puede recrear un proyecto con el mismo nombre tras eliminarlo.
    uniqueIndex('uq_projects_tenant_slug').on(t.tenant, t.slug).where(sql`deleted_at IS NULL`),
    index('ix_projects_tenant_status').on(t.tenant, t.status),
  ],
);

export const projectAccess = dataroom.table(
  'project_access',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    investorId: uuid('investor_id')
      .notNull()
      .references(() => investors.id),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    status: accessStatusEnum('status').notNull().default('active'),
    accessLevel: accessLevelEnum('access_level').notNull().default('full'),
    grantedBy: text('granted_by'),
    grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokedBy: text('revoked_by'),
    internalNotes: text('internal_notes'),
  },
  (t) => [
    uniqueIndex('uq_project_access').on(t.investorId, t.projectId),
    index('ix_project_access_project').on(t.projectId),
  ],
);

export const documentCategories = dataroom.table(
  'document_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    // Nivel de acceso (spec ALT-RM): 1 = bienvenida/resumen (visible tras
    // identidad verificada, solo vista + watermark); 2 = documentación completa
    // (requiere NDA firmado). Por defecto 2.
    level: integer('level').notNull().default(2),
    parentId: uuid('parent_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uq_categories_project_slug').on(t.projectId, t.slug),
    index('ix_categories_parent').on(t.parentId),
  ],
);

export const documents = dataroom.table(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    categoryId: uuid('category_id').references(() => documentCategories.id),
    title: text('title').notNull(),
    description: text('description'),
    confidentiality: confidentialityEnum('confidentiality').notNull().default('sensitive'),
    // Doble visado (spec ALT-RM): el documento no está disponible hasta que el
    // Solo el abogado (legal) aprueba. Las columnas tax_* se conservan por compatibilidad.
    legalStatus: reviewStatusEnum('legal_status').notNull().default('pending'),
    legalReason: text('legal_reason'),
    legalReviewedBy: text('legal_reviewed_by'),
    legalReviewedAt: timestamp('legal_reviewed_at', { withTimezone: true }),
    taxStatus: reviewStatusEnum('tax_status').notNull().default('pending'),
    taxReason: text('tax_reason'),
    taxReviewedBy: text('tax_reviewed_by'),
    taxReviewedAt: timestamp('tax_reviewed_at', { withTimezone: true }),
    downloadable: boolean('downloadable').notNull().default(true),
    requiresNda: boolean('requires_nda').notNull().default(true),
    status: documentStatusEnum('status').notNull().default('draft'),
    currentVersionId: uuid('current_version_id'),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('ix_documents_project_status').on(t.projectId, t.status),
    index('ix_documents_tenant').on(t.tenant),
  ],
);

export const documentVersions = dataroom.table(
  'document_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id),
    versionNumber: integer('version_number').notNull(),
    storagePath: text('storage_path').notNull(),
    originalName: text('original_name').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
    sha256: text('sha256').notNull(),
    status: versionStatusEnum('status').notNull().default('published'),
    versionComment: text('version_comment'),
    uploadedBy: text('uploaded_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('uq_versions_doc_number').on(t.documentId, t.versionNumber)],
);

export const documentPermissions = dataroom.table(
  'document_permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id),
    investorId: uuid('investor_id')
      .notNull()
      .references(() => investors.id),
    effect: permissionEffectEnum('effect').notNull(),
    canDownload: boolean('can_download').notNull().default(true),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('uq_doc_permission').on(t.documentId, t.investorId)],
);

export const ndaVersions = dataroom.table(
  'nda_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    projectId: uuid('project_id').references(() => projects.id), // NULL = NDA global
    version: integer('version').notNull(),
    title: text('title').notNull(),
    bodyText: text('body_text').notNull(),
    bodySha256: text('body_sha256').notNull(),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('uq_nda_project_version').on(t.projectId, t.version)],
);

export const ndaSignatures = dataroom.table(
  'nda_signatures',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    investorId: uuid('investor_id')
      .notNull()
      .references(() => investors.id),
    projectId: uuid('project_id').references(() => projects.id), // contexto de firma
    ndaVersionId: uuid('nda_version_id')
      .notNull()
      .references(() => ndaVersions.id),
    status: ndaSignatureStatusEnum('status').notNull().default('signed'),
    signedAt: timestamp('signed_at', { withTimezone: true }).notNull().defaultNow(),
    signerFullName: text('signer_full_name').notNull(),
    ip: text('ip'),
    userAgent: text('user_agent'),
    /** click-wrap evidence: accepted text hash, checkbox timestamps, etc. */
    evidence: jsonb('evidence'),
    signedCopyPath: text('signed_copy_path'),
  },
  (t) => [
    uniqueIndex('uq_nda_signature').on(t.investorId, t.ndaVersionId),
    index('ix_nda_signatures_project').on(t.projectId),
  ],
);

export const downloads = dataroom.table(
  'downloads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    investorId: uuid('investor_id')
      .notNull()
      .references(() => investors.id),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id),
    versionId: uuid('version_id')
      .notNull()
      .references(() => documentVersions.id),
    kind: text('kind').notNull(), // 'preview' | 'download'
    watermarked: boolean('watermarked').notNull().default(false),
    ip: text('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('ix_downloads_investor').on(t.investorId, t.createdAt),
    index('ix_downloads_document').on(t.documentId),
  ],
);

/** Append-only. Never UPDATE/DELETE rows in this table. */
export const auditEvents = dataroom.table(
  'audit_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    actorType: text('actor_type').notNull(), // 'admin' | 'investor' | 'system'
    actorId: text('actor_id'),
    actorEmail: text('actor_email'),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    result: text('result').notNull().default('success'), // 'success' | 'denied' | 'error'
    metadata: jsonb('metadata'),
    ip: text('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('ix_audit_tenant_created').on(t.tenant, t.createdAt),
    index('ix_audit_entity').on(t.entityType, t.entityId),
  ],
);

export const emailEvents = dataroom.table(
  'email_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    investorId: uuid('investor_id').references(() => investors.id),
    template: text('template').notNull(),
    subject: text('subject').notNull(),
    toEmail: text('to_email').notNull(),
    status: text('status').notNull(), // 'sent' | 'failed'
    providerId: text('provider_id'),
    error: text('error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('ix_email_events_investor').on(t.investorId)],
);

export const notifications = dataroom.table(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant: text('tenant').notNull(),
    investorId: uuid('investor_id')
      .notNull()
      .references(() => investors.id),
    type: text('type').notNull(), // 'new_documents' | 'project_granted' | ...
    payload: jsonb('payload'),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('ix_notifications_investor').on(t.investorId, t.readAt)],
);
