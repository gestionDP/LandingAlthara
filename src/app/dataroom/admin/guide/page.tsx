/** Guía del administrador: cómo gestionar el portal. Página estática, sin datos. */
import Link from 'next/link';

export const metadata = { title: 'Guía — Backoffice' };

function Card({ title, intro, steps }: { title: string; intro?: string; steps: (string | React.ReactNode)[] }) {
  return (
    <section className="border border-[#1c3742]/10 bg-white p-5 rounded-lg">
      <h2 className="font-playfair text-lg text-[#1c3742]">{title}</h2>
      {intro && <p className="mt-1 text-sm text-[#1c3742]/70">{intro}</p>}
      <ul className="mt-3 space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm text-[#1c3742]/80">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[#1c3742]/5 text-[11px] font-bold text-[#c08552] rounded-full">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AdminGuide() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-playfair text-3xl">Guía del backoffice</h1>
        <p className="mt-2 text-sm text-[#1c3742]/70">
          Cómo gestionar inversores, proyectos, documentos, el doble visado y el NDA del portal. El orden natural es:
          crear el inversor → validar su KYC → crear el proyecto → subir documentos → pasar el doble visado (abogado + fiscal) → dar acceso → activar.
        </p>
      </div>

      <Card
        title="1. Inversores"
        intro="Cada inversor entra solo por invitación; no hay registro público."
        steps={[
          <>En <Link href="/dataroom/admin/investors" className="text-[#c08552] underline">Inversores</Link> pulse <strong>«+ Nuevo inversor»</strong>, ponga su email y datos.</>,
          <>Al crearlo se le envía un <strong>email de invitación</strong> real. El inversor abre el enlace, pone contraseña y completa sus datos: entonces se crea su cuenta y queda <strong>Activo</strong>.</>,
          <>Estados: <strong>Invitado</strong> (aún no ha entrado), <strong>Activo</strong>, <strong>Suspendido</strong>, etc. Puede reenviar o revocar la invitación.</>,
        ]}
      />

      <Card
        title="2. Validar la identidad (KYC)"
        intro="Antes de acceder, cada inversor completa una verificación de identidad que usted aprueba."
        steps={[
          <>Al activar su cuenta, el inversor rellena su <strong>KYC</strong> (tipo y número de documento, país, teléfono, perfil inversor). Sus datos se guardan <strong>cifrados</strong>.</>,
          <>Recibirá un email de aviso. En la ficha del inversor (<Link href="/dataroom/admin/investors" className="text-[#c08552] underline">Inversores</Link> → abrir) verá la sección <strong>KYC</strong> con los datos descifrados.</>,
          <>Pulse <strong>Validar</strong> para activar su acceso, o <strong>Rechazar</strong> indicando el motivo (el inversor lo verá y podrá corregir y reenviar). Hasta validarlo, su estado es <strong>Pendiente de validación</strong>.</>,
        ]}
      />

      <Card
        title="3. Proyectos y estructura de carpetas"
        intro="Cada proyecto es un data room con su documentación, ya organizado al crearlo."
        steps={[
          <>En <Link href="/dataroom/admin/projects" className="text-[#c08552] underline">Proyectos</Link> pulse <strong>«+ Nuevo proyecto»</strong>. Se crea con el <strong>árbol de carpetas estándar</strong>: 0 · Bienvenida e índice, 1 · Resumen de la operación, 2 · Estructura societaria y legal, 3 · Pasivo a cancelar, 4 · Colateral — activos, 5 · Comercialización y ventas, 6 · Información financiera, 7 · La operación propuesta, 8 · Q&amp;A y administración.</>,
          <>Cada carpeta tiene un <strong>nivel</strong>: <strong>Nivel 1</strong> (bienvenida/resumen, visible tras verificar identidad, solo lectura) o <strong>Nivel 2</strong> (confidencial, requiere NDA). Las estándar se crean solas; con <strong>«Restaurar estándar»</strong> se recuperan las que falten. Use <strong>«+ Carpeta»</strong> solo para subcarpetas o extras (p. ej. una por proyecto dentro de «4 · Colateral»).</>,
          <>Pestañas del proyecto: <strong>Documentos</strong>, <strong>Inversores</strong>, <strong>NDA</strong> y <strong>Actividad</strong>. El banner de <strong>puesta en marcha</strong> indica lo que falta; el inversor solo ve el proyecto cuando está <strong>Activo</strong>, con inversores asignados y documentos publicados.</>,
        ]}
      />

      <Card
        title="4. Subir y publicar documentos"
        intro="En la pestaña Documentos del proyecto."
        steps={[
          <>Elija la <strong>carpeta</strong>, suba archivos (o arrástrelos) y marque <strong>Confidencial</strong> (solo acceso completo) o <strong>General</strong>, y si <strong>requiere NDA</strong>.</>,
          <>«Publicar ya» deja el documento listo; «Notificar» avisa por email a los inversores (un solo correo agrupado).</>,
          <>Con el menú <strong>⋮</strong> de cada archivo: Vista previa, Descargar, Compartir, Nueva versión, Archivar o Eliminar.</>,
          <><strong>Importante:</strong> todo documento subido queda <strong>«En revisión»</strong> e invisible para el inversor hasta pasar el <strong>doble visado</strong> (ver punto 5).</>,
        ]}
      />

      <Card
        title="5. Doble visado (abogado + fiscal)"
        intro="Ningún documento llega al inversor sin la aprobación del abogado y del fiscal."
        steps={[
          <>Al subir o versionar un documento, entra en la cola de los revisores <strong>Abogado</strong> y <strong>Fiscal</strong>. En la lista y en el panel de detalles verá una <strong>barra de progreso</strong> con el estado de cada visado.</>,
          <>Cuando <strong>ambos aprueban</strong>, el documento pasa a <strong>«Disponible para inversores»</strong>. Si uno rechaza, verá el <strong>motivo</strong> en el panel de detalles del documento.</>,
          <>Para <strong>corregir un rechazo</strong>: suba una <strong>nueva versión</strong> del documento con el menú ⋮. Esto reinicia ambos visados y vuelve a pedir revisión al abogado y al fiscal.</>,
          <>Recibirá un <strong>email</strong> cada vez que un revisor apruebe o rechace. Los revisores se dan de alta manualmente (cuentas de abogado y fiscal).</>,
        ]}
      />

      <Card
        title="6. Dar acceso: completo o por archivo"
        intro="Controla qué ve cada inversor."
        steps={[
          <><strong>Acceso completo</strong>: el inversor ve todos los documentos del proyecto.</>,
          <><strong>Acceso limitado</strong>: solo ve los archivos que le comparta expresamente.</>,
          <>Por archivo, el botón <strong>Compartir</strong> abre un panel con tres estados por inversor: <strong>Ver</strong> (compartir), <strong>Auto</strong> (según su nivel) o <strong>Bloquear</strong> (ocultar aunque tenga acceso completo).</>,
        ]}
      />

      <Card
        title="7. Invitaciones a proyectos"
        intro="Asignar un inversor a un proyecto le envía una invitación que él acepta."
        steps={[
          <>En la pestaña <strong>Inversores</strong> del proyecto, elija el inversor y su nivel de acceso, y pulse dar acceso.</>,
          <>El inversor lo verá como <strong>Pendiente</strong> hasta que lo acepte desde su portal.</>,
          'Puede cancelar una invitación pendiente o revocar un acceso activo cuando quiera.',
        ]}
      />

      <Card
        title="8. NDA del portal"
        intro="Un único acuerdo de confidencialidad para todos los proyectos."
        steps={[
          <>Redacte y publique el NDA en <Link href="/dataroom/admin/nda" className="text-[#c08552] underline">NDA</Link>.</>,
          'El inversor lo firma una sola vez y desbloquea la documentación confidencial de todos los proyectos que lo requieran (no se firma archivo por archivo).',
          'En la pestaña NDA de cada proyecto puede activar/desactivar el requisito y ver quién ha firmado.',
        ]}
      />

      <Card
        title="9. Auditoría"
        intro="Trazabilidad completa."
        steps={[
          <>En <Link href="/dataroom/admin/audit" className="text-[#c08552] underline">Auditoría</Link> ve cada acción: accesos, vistas, descargas, firmas, visados (aprobados/rechazados), cambios de permisos, etc.</>,
          'Cada vista y descarga de documento queda registrada con fecha, actor y resultado.',
        ]}
      />
    </div>
  );
}
