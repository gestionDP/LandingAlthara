import type { Metadata } from 'next';
import LegalShell from '@/components/legal/LegalShell';
import { LEGAL } from '@/lib/legal-config';

export const metadata: Metadata = {
  title: `Aviso Legal · ${LEGAL.siteName}`,
  description: `Aviso legal e información general del sitio web de ${LEGAL.companyName} conforme al artículo 10 de la LSSI-CE.`,
  alternates: { canonical: '/aviso-legal' },
  robots: { index: true, follow: true },
};

export default function AvisoLegal() {
  return (
    <LegalShell title="Aviso Legal" updated={LEGAL.updated}>
      <h2>1. Información general (art. 10 LSSI-CE)</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
        Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que el
        titular de este sitio web ({LEGAL.domain}) es:
      </p>
      <ul>
        <li><strong>Denominación social:</strong> {LEGAL.companyName}</li>
        <li><strong>NIF:</strong> {LEGAL.cif}</li>
        <li><strong>Domicilio social:</strong> {LEGAL.address}</li>
        <li><strong>Correo electrónico:</strong> <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a></li>
        {LEGAL.phone ? (
          <li><strong>Teléfono:</strong> {LEGAL.phone}</li>
        ) : null}
        {LEGAL.registry ? (
          <li><strong>Datos registrales:</strong> {LEGAL.registry}</li>
        ) : null}
        {LEGAL.activity ? (
          <li><strong>Actividad:</strong> {LEGAL.activity}</li>
        ) : null}
      </ul>

      <h2>2. Objeto</h2>
      <p>
        El presente Aviso Legal regula el acceso, la navegación y el uso del sitio web{' '}
        {LEGAL.siteName}. El acceso al sitio atribuye la condición de usuario e implica la
        aceptación plena de las disposiciones incluidas en este Aviso Legal, en las{' '}
        <a href="/condiciones-uso">Condiciones de Uso</a>, en la{' '}
        <a href="/politica-privacidad">Política de Privacidad</a> y en la{' '}
        <a href="/politica-cookies">Política de Cookies</a>.
      </p>

      <h2>3. Propiedad intelectual e industrial</h2>
      <p>
        Todos los contenidos del sitio (textos, imágenes, vídeos, logotipos, marcas, diseño
        gráfico, código fuente y software) son titularidad de {LEGAL.companyName} o de terceros
        que han autorizado su uso, y están protegidos por la normativa de propiedad intelectual e
        industrial. Queda prohibida su reproducción, distribución, comunicación pública o
        transformación sin autorización expresa del titular, salvo los usos permitidos por la ley.
      </p>

      <h2>4. Responsabilidad</h2>
      <p>
        {LEGAL.companyName} no garantiza la inexistencia de errores en el contenido ni la
        ausencia de virus u otros elementos lesivos, aunque adopta las medidas razonables para
        evitarlos. El titular no será responsable de los daños derivados del uso indebido del
        sitio por parte del usuario ni de fallos técnicos ajenos a su control. Los enlaces a
        sitios de terceros tienen finalidad meramente informativa: {LEGAL.companyName} no asume
        responsabilidad sobre sus contenidos ni sobre sus políticas de privacidad.
      </p>

      <h2>5. Protección de datos y cookies</h2>
      <p>
        El tratamiento de los datos personales recabados a través del sitio se rige por la{' '}
        <a href="/politica-privacidad">Política de Privacidad</a>. El uso de cookies se rige por
        la <a href="/politica-cookies">Política de Cookies</a>.
      </p>

      <h2>6. Legislación aplicable y jurisdicción</h2>
      <p>
        Este Aviso Legal se rige por la legislación española. Salvo que la normativa aplicable
        disponga otra cosa (en particular, cuando el usuario tenga la condición de consumidor, en
        cuyo caso será competente el juzgado de su domicilio), las partes se someten a los
        Juzgados y Tribunales del domicilio del titular del sitio web.
      </p>

      <h2>7. Contacto</h2>
      <p>
        Para cualquier consulta relativa a este Aviso Legal puede dirigirse a{' '}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
      </p>
    </LegalShell>
  );
}
