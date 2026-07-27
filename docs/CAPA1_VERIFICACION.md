# Capa 1 — Documento de verificación

Implementación de ALT-WEB-2026-01 v1.2 §06. Entrega controlada del documento
que define, fecha y firma cada cifra publicada en la capa pública.

## Flujo

1. El visitante entra en `/verificacion` desde cualquier página del site
   (enlaces en Posición, Análisis, Metodología y el pie).
2. Rellena nombre, email y teléfono, y acepta la finalidad declarada: entrega
   del documento y posible contacto comercial posterior.
3. `POST /api/verification/request` crea la fila en
   `dataroom.verification_requests`, envía el correo de doble opt-in al
   solicitante y un aviso interno al administrador.
4. El enlace del correo apunta a `GET /api/verification/confirm?token=…`, que
   marca la solicitud como confirmada y redirige a
   `/verificacion/documento?token=…`.
5. `GET /api/verification/download?token=…` registra la descarga en
   `dataroom.verification_downloads` **antes** de entregar el PDF, y lo sirve
   desde el backend. Nunca se expone una URL pública del almacén.

El token en crudo se envía una sola vez por correo y **nunca se almacena**: la
base de datos guarda solo su hash SHA-256.

## Poner el PDF firmado en producción

El servicio busca el fichero en esta ruta del almacén:

```
verification/{VERIFICATION_DOC_REF}-{VERIFICATION_DOC_VERSION}-{es|en}.pdf
```

Con los valores por defecto, eso son dos ficheros:

```
verification/ALT-TR-2026-01-v1.0-es.pdf
verification/ALT-TR-2026-01-v1.0-en.pdf
```

**Producción** (bucket privado de GCS, el mismo que usa el dataroom):

```bash
gsutil cp ALT-TR-2026-01-v1.0-es.pdf gs://$GCS_BUCKET_NAME/verification/
gsutil cp ALT-TR-2026-01-v1.0-en.pdf gs://$GCS_BUCKET_NAME/verification/
```

**Desarrollo local** (sin credenciales de GCS, el almacén cae a disco):

```bash
mkdir -p .dataroom-storage/verification
cp ALT-TR-2026-01-v1.0-es.pdf .dataroom-storage/verification/
```

Mientras el PDF no esté cargado, el flujo funciona igual y las solicitudes se
registran; la descarga devuelve `503 document_not_ready` y la página muestra
que el documento aún no está disponible.

## Migración de base de datos

```bash
DATABASE_URL=postgres://… pnpm dataroom:migrate
```

Aplica, todas idempotentes:

- `0009_verification_document.sql` — `verification_requests` y
  `verification_downloads` (esta Capa 1).
- `0010_investor_global_access.sql` — columna `investors.global_access`, el
  «inversor global» de la matriz de accesos (L4 · cartera completa, §07).
- `0011_access_requests.sql` — `access_requests`, las solicitudes de la
  sección 09 que antes iban a Formspree.

## Secciones vecinas que comparten esta infraestructura

**Sección 09 · Acceso.** El único botón del site envía a
`POST /api/access-request`, que registra la solicitud en
`dataroom.access_requests`, avisa al administrador y manda un acuse al
solicitante en su idioma. Antes salía a Formspree, fuera de todo registro; así
el compromiso de «respuesta en 24 horas» es comprobable. Las columnas
`status`, `answered_at` y `answered_by` están listas para un panel de gestión
que todavía no existe.

**Inversor global (L4).** `investors.global_access` concede la cartera completa
sin asignar los proyectos uno a uno. Se activa desde la ficha del inversor en
el panel de administración y queda auditado como `permission.changed`. No anula
nada: el NDA se sigue exigiendo y una asignación suspendida o revocada sobre un
proyecto concreto sigue mandando sobre el acceso global.

## Disciplina de versión

El documento firmado se congela. Cualquier cambio de cifras obliga a emitir
**ALT-TR-2026-02** con nueva fecha y firma; la versión anterior se archiva y
deja de distribuirse. Nunca dos versiones firmadas en circulación simultánea.

Para publicar una versión nueva, en el mismo despliegue:

1. Subir el PDF nuevo al bucket con la referencia y versión nuevas.
2. Actualizar `VERIFICATION_DOC_REF` y `VERIFICATION_DOC_VERSION`.
3. Retirar el PDF anterior del bucket.
4. Actualizar `verificationDocument` en `src/content/figures.json` y, si las
   cifras han cambiado, subir también `methodologyVersion` y `asOf`.

Las filas ya registradas conservan la referencia y versión que se entregaron en
su momento, de modo que el registro sigue siendo veraz después del cambio.

## Registro

Cada solicitud, confirmación, descarga y denegación queda en
`dataroom.audit_events` con las acciones `verification.requested`,
`verification.confirmed`, `verification.downloaded` y `verification.denied`.
La tabla de auditoría es append-only por trigger de base de datos.

## Pendiente

La política de privacidad todavía no menciona la Capa 1. Según §08 del
documento debe cubrir: la captura de teléfono con finalidad comercial
declarada, el registro de accesos y descargas, la base legal y los plazos de
conservación de estos datos. Redacción a cargo de Miguel Ángel.
