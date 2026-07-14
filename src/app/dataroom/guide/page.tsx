/** Guía del inversor: cómo usar el portal. Página estática, sin datos. */
import Link from 'next/link';

export const metadata = { title: 'Guía — Portal de inversores' };

function Card({ title, intro, steps }: { title: string; intro?: string; steps: (string | React.ReactNode)[] }) {
  return (
    <section className="border border-[#1c3742]/10 bg-white p-5 shadow-sm">
      <h2 className="font-playfair text-lg text-[#1c3742]">{title}</h2>
      {intro && <p className="mt-1 text-sm text-[#1c3742]/70">{intro}</p>}
      <ul className="mt-3 space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm text-[#1c3742]/80">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[#1c3742]/5 text-[11px] font-bold text-[#c08552]">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function InvestorGuide() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-playfair text-3xl">Guía del portal</h1>
        <p className="mt-2 text-sm text-[#1c3742]/70">
          Todo lo que necesita para moverse por el portal de inversores de Althara. Si algo no le
          cuadra, escriba a <a href="mailto:info@althara.es" className="text-[#c08552] underline">info@althara.es</a>.
        </p>
      </div>

      <Card
        title="1. Su página de inicio"
        intro="Al entrar verá sus proyectos, invitaciones pendientes, notificaciones y sus accesos recientes."
        steps={[
          <>En <strong>Inicio</strong> aparecen las tarjetas de los proyectos a los que tiene acceso.</>,
          'Pulse una tarjeta para abrir el data room del proyecto.',
          'Las notificaciones le avisan cuando se publica documentación nueva.',
        ]}
      />

      <Card
        title="2. Invitaciones a proyectos"
        intro="Cuando Althara le da acceso a un proyecto, primero recibe una invitación."
        steps={[
          <>Verá un aviso <strong>«Invitaciones pendientes»</strong> arriba en Inicio.</>,
          <>Pulse <strong>Aceptar</strong> para entrar al proyecto, o <strong>Rechazar</strong> si no le interesa.</>,
          'Al aceptar, el proyecto pasa a «Sus proyectos» y ya puede ver su documentación.',
        ]}
      />

      <Card
        title="3. La biblioteca de documentos"
        intro="Dentro de cada proyecto, los documentos se organizan en carpetas, como en SharePoint."
        steps={[
          <>Pulse una <strong>carpeta</strong> para entrar; use la ruta de arriba (Documentos › Carpeta) para volver.</>,
          <>Cambie entre vista de <strong>lista</strong> y <strong>cuadrícula</strong> con los botones de la derecha.</>,
          <>Use el <strong>buscador</strong> (arriba del todo o el de la biblioteca) para encontrar un archivo por su nombre.</>,
        ]}
      />

      <Card
        title="4. Ver y descargar archivos"
        intro="Puede consultar los documentos sin descargarlos."
        steps={[
          <>Pulse el <strong>nombre del archivo</strong> (o «Vista previa» en el menú ⋮) para verlo dentro del portal: PDF, Word, Excel e imágenes.</>,
          <>Si el documento lo permite, use <strong>Descargar</strong> en el menú ⋮.</>,
          'Cada descarga lleva una marca de agua personal con sus datos.',
        ]}
      />

      <Card
        title="5. El acuerdo de confidencialidad (NDA)"
        intro="Parte de la documentación es confidencial y requiere firmar el NDA una sola vez."
        steps={[
          <>Si un proyecto tiene documentos bloqueados, verá el aviso <strong>«Documentación confidencial bloqueada»</strong>.</>,
          <>Pulse <strong>«Revisar y firmar NDA»</strong>, lea el acuerdo, escriba su nombre y acepte.</>,
          'Con una sola firma se desbloquea la documentación confidencial de todos los proyectos que la requieran.',
        ]}
      />

      <Card
        title="6. Su perfil"
        intro="Mantenga sus datos al día."
        steps={[
          <>Entre en <Link href="/dataroom/profile" className="text-[#c08552] underline">Mi perfil</Link> desde el menú lateral o desde Inicio.</>,
          'Complete o edite su nombre, teléfono, empresa, país y tipo de inversor.',
          'El email de acceso no se cambia aquí; si necesita cambiarlo, contacte con Althara.',
        ]}
      />

      <Card
        title="7. Seguridad y confidencialidad"
        steps={[
          'Todo el contenido es confidencial y de acceso restringido.',
          'Cada vista y cada descarga quedan registradas.',
          'Las descargas llevan marca de agua personal. No comparta los documentos fuera del portal.',
        ]}
      />
    </div>
  );
}
