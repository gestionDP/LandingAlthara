import type { Metadata } from 'next';
import LegalShell from '@/components/legal/LegalShell';
import { LEGAL } from '@/lib/legal-config';

export const metadata: Metadata = {
  title: `Condiciones de Uso · ${LEGAL.siteName}`,
  description: `Condiciones de uso del sitio web ${LEGAL.siteName} de ${LEGAL.companyName}.`,
  alternates: { canonical: '/condiciones-uso' },
  robots: { index: true, follow: true },
};

export default function CondicionesUso() {
  return (
    <LegalShell title="Condiciones de Uso" updated={LEGAL.updated}>
      <p>
        Estas Condiciones de Uso regulan la navegación y utilización del sitio web{' '}
        {LEGAL.siteName} ({LEGAL.domain}), titularidad de {LEGAL.companyName} (NIF {LEGAL.cif}).
        El uso del sitio implica su aceptación.
      </p>

      <h2>1. Uso permitido</h2>
      <p>El usuario se compromete a utilizar el sitio de forma diligente y lícita y, en particular, a:</p>
      <ul>
        <li>No emplearlo con fines contrarios a la ley, la moral o el orden público.</li>
        <li>No introducir virus, malware o cualquier código dañino, ni intentar acceder sin
          autorización a sistemas, datos o cuentas de terceros.</li>
        <li>No realizar extracciones masivas de contenido (scraping) ni usos que sobrecarguen o
          degraden el servicio.</li>
        <li>No suplantar la identidad de terceros ni facilitar datos falsos en los formularios.</li>
        <li>No reproducir ni explotar comercialmente los contenidos sin autorización.</li>
      </ul>

      <h2>2. Responsabilidades del usuario</h2>
      <p>
        El usuario responde de los daños y perjuicios que pudiera causar por el incumplimiento de
        estas condiciones o por el uso indebido del sitio, y mantendrá indemne a{' '}
        {LEGAL.companyName} frente a reclamaciones de terceros derivadas de dicho incumplimiento.
      </p>

      <h2>3. Propiedad intelectual e industrial</h2>
      <p>
        Los contenidos, marcas, logotipos, diseños y software del sitio pertenecen a{' '}
        {LEGAL.companyName} o a sus legítimos titulares. No se cede al usuario ningún derecho de
        explotación más allá de lo estrictamente necesario para la navegación.
      </p>

      <h2>4. Enlaces externos</h2>
      <p>
        El sitio puede incluir enlaces a páginas de terceros (por ejemplo, redes sociales,
        WhatsApp, Google Maps o plataformas de reseñas). {LEGAL.companyName} no controla dichos
        sitios y no asume responsabilidad por sus contenidos, servicios o políticas de
        privacidad. La inclusión de un enlace no implica relación, aprobación ni respaldo.
      </p>

      <h2>5. Exclusión de responsabilidad</h2>
      <p>
        {LEGAL.companyName} no garantiza la disponibilidad ininterrumpida del sitio ni la
        ausencia de errores, y podrá suspender temporalmente el acceso por mantenimiento o causas
        técnicas. La información publicada tiene carácter divulgativo o comercial general y no
        constituye asesoramiento profesional, salvo que expresamente se indique lo contrario. En
        la medida permitida por la ley, se excluye la responsabilidad por daños derivados del uso
        de la información contenida en el sitio.
      </p>

      <h2>6. Modificaciones</h2>
      <p>
        {LEGAL.companyName} puede modificar en cualquier momento el contenido del sitio y estas
        condiciones, publicando la versión actualizada en esta misma página.
      </p>

      <h2>7. Legislación aplicable y jurisdicción</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Salvo norma imperativa en
        contrario (en particular, si el usuario actúa como consumidor, en cuyo caso será
        competente el juzgado de su domicilio), las controversias se someterán a los Juzgados y
        Tribunales del domicilio del titular. Los consumidores pueden acudir asimismo a la
        plataforma europea de resolución de litigios en línea:{' '}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
          https://ec.europa.eu/consumers/odr
        </a>.
      </p>
    </LegalShell>
  );
}
