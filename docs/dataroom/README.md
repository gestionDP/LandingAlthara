# Dataroom — Portal privado de inversores (althara.es/dataroom)

**Fecha:** 2026-07-13 · **Estado:** implementado end-to-end, apto para dev/staging. **NO desplegar a producción sin cerrar los bloqueos del final de este documento.**

---

## 1. Arquitectura

Todo el código vive en este repo (`althara`, la landing). De `Althara_back` se reutiliza únicamente infraestructura:

| Pieza | Reutilizado | Cómo |
|---|---|---|
| Base de datos | Neon Postgres existente | Schema PostgreSQL **`dataroom`** dedicado (aislamiento lógico; cero contacto con tablas `public.*`) |
| Auth | Misma instancia Clerk | Inversores = usuarios con `publicMetadata.dataroom_role='investor'` + `tenant_slug`. Admins = `dataroom_role='admin'` |
| Storage | Bucket GCS privado existente | Prefijo `dataroom/{tenant}/...`, solo signed URLs V4 de 60 s |
| Email | Resend | Mismas credenciales, plantillas propias es/en |

Capas: `src/dataroom/core` (lógica pura, sin dependencias, 100 % testeada) → `db` (Drizzle) → `lib` (Clerk, GCS, Resend, audit, rate-limit, watermark) → `services` (negocio) → `src/app/api/dataroom` (route handlers) → `src/app/dataroom` (UI). La landing pública no se toca; el middleware de Clerk solo aplica a `/dataroom/*` y `/api/dataroom/*`.

## 2. Puesta en marcha

```bash
pnpm install                       # nuevas deps: @clerk/nextjs, drizzle-orm, @neondatabase/serverless,
                                   # @google-cloud/storage, resend, zod, pdf-lib
cp .env.example .env.local         # rellenar con valores reales
npm run dataroom:migrate           # migración idempotente (o psql -f src/dataroom/db/migrations/0001_dataroom_init.sql)
npm run test:dataroom              # 41 tests unitarios (node --test, sin deps)
pnpm dev
```

Para crear el primer admin: en Clerk Dashboard, añadir a tu usuario `publicMetadata: { "dataroom_role": "admin", "tenant_slug": "althara" }`. **No existe registro público**: la instancia Clerk debe estar en modo *Restricted* (sign-up cerrado); las cuentas de inversor se crean solo desde backend al canjear la invitación.

## 3. Modelo de datos (schema `dataroom`)

14 tablas — ver `src/dataroom/db/schema.ts` y `db/migrations/0001_dataroom_init.sql`:

- **investors** — estados `draft → invited → registration_started → active ⇄ suspended → disabled` (+ `invitation_expired/revoked`). Unicidad `(tenant,email)` y `clerk_user_id`. Borrado lógico. Acepta privacidad/términos con versión y timestamp.
- **invitations** — solo `token_hash` SHA-256 (el token en claro nunca se guarda), un solo uso, caducidad (72 h por defecto), estados `pending/used/revoked/expired`. Una invitación pendiente por inversor (las anteriores se revocan al reenviar).
- **projects** — slug único por tenant, estados `draft/active/temporarily_unavailable/closed/archived`, `nda_required` + `nda_policy` (`resign|grandfather|block`, configurable por proyecto).
- **project_access** — M:N inversor↔proyecto con `access_level` (`generic|full`), quién concedió, fechas de concesión/revocación, notas. Unique `(investor,project)`; regrant idempotente por upsert.
- **document_categories** — 10 categorías por defecto al crear proyecto.
- **documents** + **document_versions** — versionado inmutable: cada versión con hash SHA-256, tamaño, MIME, comentario, estado (`draft/published/superseded/archived/revoked`). Nunca se sobrescribe un archivo.
- **document_permissions** — override por inversor: `allow/deny` + `can_download` (permite revocar descarga manteniendo vista).
- **nda_versions** + **nda_signatures** — firma click-wrap con evidencia (hash del texto, IP, user-agent, timestamp) + copia firmada PDF archivada en GCS. Unique `(investor, nda_version)` → firma idempotente.
- **downloads** — cada vista/descarga con IP, UA, si llevó marca de agua.
- **audit_events** — **append-only con trigger de BD que prohíbe UPDATE/DELETE**.
- **email_events**, **notifications**.

## 4. Autorización — fuente única de verdad

`src/dataroom/core/access.ts → computeDocumentAccess()` (pura, exhaustivamente testeada). Deny por defecto; orden de evaluación:

tenant → cuenta `active` → proyecto `active` → asignación existente y `active` → documento `published` → `deny` explícito → nivel (asignación `generic` no ve sensibles salvo `allow` explícito) → NDA (sensible + `requires_nda` exige estado `signed`/`not_required`) → descarga solo si `downloadable` y el permiso no la quita.

**Matriz resumida (documento sensible con NDA):**

| Condición | Ver | Descargar |
|---|---|---|
| Todo en regla | ✔ | ✔ (PDF con marca de agua) |
| Otro tenant / sin asignar / asignación revocada | 404 | 404 |
| Cuenta suspendida/desactivada | ✖ (sesiones Clerk revocadas al instante) | ✖ |
| Proyecto pausado/cerrado | ✖ | ✖ |
| NDA sin firmar | ✖ (423, candado en UI) | ✖ |
| `deny` explícito | invisible | ✖ |
| Permiso `allow` con `can_download=false` | ✔ | ✖ |
| Documento archivado / no publicado | ✖ | ✖ |

Cada denegación de documento queda auditada (`document.access_denied`).

## 5. Endpoints

**Públicos (pre-auth, rate-limited por IP):**
`POST /api/dataroom/invitations/validate` · `POST /api/dataroom/invitations/complete`

**Inversor (Clerk + fila investors activa):**
`GET /api/dataroom/me` · `GET /api/dataroom/projects/:id` · `GET|POST /api/dataroom/projects/:id/nda` · `GET /api/dataroom/documents/:id/preview` · `GET /api/dataroom/documents/:id/download`

**Admin (Clerk `dataroom_role=admin`):**
`GET|POST /api/dataroom/admin/investors` · `GET|PATCH /api/dataroom/admin/investors/:id` (acciones: update, invite, resend, revoke_invitation, suspend, reactivate, disable) · `POST|DELETE /api/dataroom/admin/investors/:id/projects` · `GET|POST /api/dataroom/admin/projects` · `GET|PATCH /api/dataroom/admin/projects/:id` (update, create_nda_version, `?ndaCopy=` para copia firmada) · `POST /api/dataroom/admin/projects/:id/documents` (multi-upload multipart) · `GET|PATCH|POST /api/dataroom/admin/documents/:id` (publish/archive/revoke/set_permission/notify · nueva versión) · `GET /api/dataroom/admin/audit`

Idempotencia: reenvío de invitación (revoca las anteriores), firma NDA (unique + retorno idempotente), asignación de proyecto (upsert), publicación (transición de estados validada), notificación agrupada (un email por lote).

## 6. Flujos implementados

1. **Alta por invitación** — admin crea inversor (+datos opcionales, +proyectos) → token 32 bytes base64url, hash en BD, caducidad → email Resend → `/dataroom/activate/[token]` valida (inválido/caducado/usado/revocado/ya activa, todos con mensaje propio) → formulario contraseña (política: 12+, mayúsc/minúsc/dígito, validada en servidor) + datos + aceptación legal versionada → backend crea usuario Clerk → quema token → activa cuenta → email de confirmación → sign-in. Fallo de Clerk o de email ⇒ rollback de estado y token reutilizable.
2. **Data room** — home con proyectos/notificaciones/accesos; página de proyecto con buscador, filtro por categoría, tabla con nivel/tamaño/versión/fecha, docs bloqueados diferenciados con candado y motivo.
3. **NDA** — banner → modal con texto íntegro → nombre completo + checkbox → firma registrada con evidencia → copia PDF archivada → email de confirmación → **refetch automático: los sensibles se desbloquean sin recargar**.
4. **Descarga** — botón → backend valida → signed URL 60 s o stream con **marca de agua por inversor** (PDF sensibles ≤25 MB: nombre, email enmascarado, fecha UTC, id de descarga, en diagonal + pie de página) → registro en `downloads` + auditoría.
5. **Revocación** — inmediata (el cálculo de acceso se hace en cada request; suspender/desactivar revoca además las sesiones Clerk).

## 7. Emails (Resend, es/en, resultado registrado)

invitación · reenvío · recordatorio · activación · NDA firmado · nuevos documentos (**agrupado por lote**) · nueva versión · acceso concedido · acceso retirado · restablecimiento de contraseña (plantilla lista; el flujo lo gestiona Clerk) · cuenta suspendida.

## 8. Seguridad

- Tokens: aleatorios (CSPRNG), un solo uso, hasheados, caducables, comparación timing-safe, validación de forma pre-BD.
- Sin URLs públicas: bucket privado, signed URLs V4 60 s, nombres de storage opacos (UUID, nunca el filename original).
- Subidas: allowlist extensión+MIME (PDF/DOCX/XLSX/PPTX/CSV/imágenes; **ZIP y SVG/HTML bloqueados**), límite 50 MB, hash SHA-256.
- IDOR: proyecto no asignado ⇒ mismo 404 que inexistente; documentos con `deny` invisibles.
- Rate limiting en validate/complete/firma NDA (in-memory; para producción cambiar a Upstash Redis — interfaz ya aislada en `lib/rate-limit.ts`).
- Contraseñas: política propia + hash gestionado por Clerk. Nada sensible en `localStorage` (solo estado React en memoria; sesión = cookies httpOnly de Clerk).
- Logs/auditoría sin contraseñas ni tokens; errores internos nunca llegan al cliente (`errorResponse`).
- XSS: sin `dangerouslySetInnerHTML`; CSRF: cookies SameSite de Clerk + JSON APIs.

## 9. Testing

- **Unitarios (ejecutados, 41/41 ✔):** `npm run test:dataroom` — máquinas de estado, canje de invitación, derivación NDA (3 políticas), matriz completa de acceso (12 casos deny + granted), visibilidad de proyecto, tokens (unicidad, tampering, timing-safe, formas), política de contraseñas, validación de subida, naming seguro, maskEmail.
- **Integración (pendiente de entorno con BD):** invitación→activación, asignación, firma→desbloqueo, descarga, revocación, emails, auditoría. Requieren Neon de staging.
- **E2E manual:** checklist §11.

## 10. Riesgos pendientes / decisiones documentadas

1. **Rate limiting in-memory** — suficiente en 1 instancia; en Vercel multi-instancia migrar a Upstash.
2. **Marca de agua síncrona** — PDFs >25 MB o no-PDF se sirven sin marca (auditado con `watermarked=false`). Mejora futura: proceso asíncrono con estado "preparando".
3. **Backoffice solo en español** — herramienta interna; portal del inversor respeta su idioma en emails, UI del inversor en español (añadir EN si hay inversores extranjeros: los strings están centralizados).
4. **`/privacy` y `/terms`** enlazados en el registro **no existen aún en la landing** — crear las páginas legales antes de staging público.
5. **Recordatorio de invitación pendiente** — plantilla lista; falta el cron (Vercel Cron o scheduled task) que la dispare.
6. **Categorías fijas por defecto** — no hay CRUD de categorías en UI (sí en BD); añadir si se necesita.
7. **Notificación in-app sin "marcar leída"** en UI (columna `read_at` ya existe).

## 11. Checklist QA manual

- [ ] `pnpm install && pnpm build` sin errores; migración aplicada; primer admin con metadata en Clerk.
- [ ] Admin crea inversor → email llega con enlace `/dataroom/activate/...`.
- [ ] Token manipulado ⇒ "no válido"; token caducado (bajar TTL) ⇒ "caducado"; reusar token ⇒ "ya utilizado"; invitación revocada ⇒ mensaje propio.
- [ ] Contraseña débil rechazada (server); sin checkboxes legales no se envía.
- [ ] Activación → sign-in → home con saludo y proyectos.
- [ ] Inversor NO ve proyectos sin asignar; cambiar UUID en URL ⇒ 404.
- [ ] Documento genérico visible sin NDA; sensible bloqueado con candado.
- [ ] Firmar NDA ⇒ desbloqueo sin recargar; email de confirmación; copia firmada descargable desde ficha admin.
- [ ] Descargar PDF sensible ⇒ marca de agua con nombre/fecha/id; evento en `downloads` y auditoría.
- [ ] Nueva versión de NDA con política `resign` ⇒ vuelve a pending; con `grandfather` ⇒ sigue signed.
- [ ] Revocar proyecto ⇒ desaparece al instante del portal; suspender inversor ⇒ pierde sesión y login.
- [ ] `deny` sobre un documento ⇒ invisible para ese inversor, resto lo ve.
- [ ] `can_download=false` ⇒ botón Ver sí, Descargar no; API de download ⇒ denegado.
- [ ] Subida de .exe/.zip/.svg rechazada; >50 MB rechazada; MIME falseado rechazado.
- [ ] Signed URL copiada deja de funcionar pasados 60 s.
- [ ] Publicar 5 docs con "Notificar" ⇒ UN email agrupado por inversor.
- [ ] Auditoría refleja todo lo anterior; `UPDATE dataroom.audit_events ...` en psql ⇒ error del trigger.
- [ ] La landing pública (`/`) sigue intacta, sin Clerk ni cambios visuales.

## 12. ⛔ Bloqueos antes de producción

1. **Validación legal y regulatoria** del modelo de acceso y captación de inversores (CNMV/normativa de comercialización): el portal solo distribuye documentación a inversores dados de alta manualmente, pero el encuadre legal debe confirmarlo un abogado.
2. **Validación jurídica del mecanismo de firma del NDA**: la firma implementada es click-wrap con evidencia técnica (hash, IP, UA, timestamp, copia archivada). Si se requiere firma electrónica avanzada/cualificada (eIDAS), integrar un proveedor (Signaturit, DocuSign) — el modelo de datos ya lo soporta (`evidence` JSONB + `signed_copy_path`).
3. **Aislamiento multi-tenant completo**: el diseño es multi-tenant (columna `tenant` en todas las tablas + verificación en cada guard), pero hoy opera con un único tenant `althara`. Antes de abrirlo a white labels: revisar claims de Clerk por tenant satélite y añadir tests de integración cross-tenant contra BD real.
4. **Protección de datos personales (RGPD)**: registro de actividades de tratamiento, textos legales versionados publicados (`/privacy`, `/terms`), política de retención para `audit_events`/`downloads` (contienen IP), y evaluación de si procede cifrado a nivel de campo para teléfono/país (hoy: cifrado at-rest de Neon).
5. Rate limiting distribuido (Upstash) y Sentry/alertas antes de tráfico real.
