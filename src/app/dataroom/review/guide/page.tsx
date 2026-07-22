/** Guía del abogado: cómo dar el visado. Página estática. */
import Link from 'next/link';

export const metadata = { title: 'Guía — Revisión' };

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

export default function ReviewerGuide() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-playfair text-3xl">Guía de revisión (abogado)</h1>
        <p className="mt-2 text-sm text-[#1c3742]/70">
          Su papel es dar el <strong>visado</strong> a la documentación antes de que llegue al inversor.
          Cada documento necesita su aprobación: solo cuando usted aprueba, el inversor puede verlo.
        </p>
      </div>

      <Card
        title="1. Su cola de revisión"
        intro="Al entrar va directo a Revisión."
        steps={[
          <>En <Link href="/dataroom/review" className="text-[#c08552] underline">Revisión</Link> verá los documentos que requieren su visado, con el proyecto y la fecha de actualización.</>,
          <>La <strong>barra de progreso</strong> muestra el estado: «Pendiente de abogado», «Disponible para inversores» o «Rechazado — requiere corrección».</>,
        ]}
      />

      <Card
        title="2. Revisar el documento"
        intro="Antes de decidir, ábralo."
        steps={[
          <>Pulse <strong>«Vista previa»</strong> para verlo dentro del portal (PDF, Word, Excel o imagen), sin descargarlo.</>,
          'Compruebe que el contenido es correcto desde el punto de vista legal.',
        ]}
      />

      <Card
        title="3. Aprobar o rechazar"
        steps={[
          <>Si todo está bien, pulse <strong>«Aprobar»</strong>. El documento pasa a estar disponible para el inversor.</>,
          <>Si algo no está bien, pulse <strong>«Rechazar»</strong> y escriba el <strong>motivo</strong> (obligatorio, mínimo 3 caracteres). El administrador lo verá para corregirlo.</>,
          <>Un documento <strong>rechazado</strong> sigue visible en su cola con el motivo, en espera de que el administrador suba una versión corregida.</>,
        ]}
      />

      <Card
        title="4. Qué pasa después"
        intro="El ciclo de corrección."
        steps={[
          <>Cuando el administrador <strong>sube una versión corregida</strong>, el visado se <strong>reinicia</strong> y el documento vuelve a aparecer en su cola para revisarlo de nuevo.</>,
          'El administrador recibe un email cada vez que usted aprueba o rechaza, para poder actuar.',
          'Todas sus decisiones quedan registradas en la auditoría del portal (con fecha y motivo).',
        ]}
      />

      <Card
        title="5. Confidencialidad"
        steps={[
          'Todo el contenido es confidencial y de acceso restringido.',
          'Cada visualización queda registrada. No comparta los documentos fuera del portal.',
          <>¿Dudas? Escriba a <a href="mailto:info@althara.es" className="text-[#c08552] underline">info@althara.es</a>.</>,
        ]}
      />
    </div>
  );
}
