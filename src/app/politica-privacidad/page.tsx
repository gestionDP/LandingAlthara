import type { Metadata } from 'next';
import LegalShell from '@/components/legal/LegalShell';
import { LEGAL } from '@/lib/legal-config';

export const metadata: Metadata = {
  title: `Política de Privacidad · ${LEGAL.siteName}`,
  description: `Información sobre el tratamiento de datos personales por ${LEGAL.companyName} conforme al RGPD y la LOPDGDD.`,
  alternates: { canonical: '/politica-privacidad' },
  robots: { index: true, follow: true },
};

export default function PoliticaPrivacidad() {
  return (
    <LegalShell title="Política de Privacidad" updated={LEGAL.updated}>
      <p>
        La presente Política de Privacidad informa, conforme al Reglamento (UE) 2016/679 (RGPD) y
        a la Ley Orgánica 3/2018 (LOPDGDD), sobre el tratamiento de los datos personales de los
        usuarios de este sitio web.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li><strong>Responsable:</strong> {LEGAL.companyName}</li>
        <li><strong>NIF:</strong> {LEGAL.cif}</li>
        <li><strong>Domicilio:</strong> {LEGAL.address}</li>
        <li><strong>Email de contacto en materia de protección de datos:</strong>{' '}
          <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a></li>
        {LEGAL.phone ? (
          <li><strong>Teléfono:</strong> {LEGAL.phone}</li>
        ) : null}
      </ul>

      <h2>2. Datos que tratamos y su origen</h2>
      <p>Los datos personales que tratamos proceden directamente del propio usuario:</p>
      <ul>
        {LEGAL.hasForms ? (
          <li>
            <strong>Formularios del sitio:</strong> datos identificativos y de contacto (nombre,
            email, teléfono) y el contenido del mensaje o solicitud que el usuario decida
            facilitar.
          </li>
        ) : null}
        {LEGAL.sellsOnline ? (
          <li>
            <strong>Reservas y compras online:</strong> datos identificativos, de contacto y los
            datos necesarios para gestionar la reserva o compra. Los datos de pago son tratados
            directamente por el proveedor de pagos; este sitio no almacena números de tarjeta.
          </li>
        ) : null}
        <li>
          <strong>Navegación:</strong> datos técnicos (dirección IP, tipo de navegador) generados
          por el propio acceso al sitio y, en su caso, los descritos en la{' '}
          <a href="/politica-cookies">Política de Cookies</a>.
        </li>
        <li>
          <strong>Comunicaciones directas:</strong> datos facilitados por email, teléfono o
          mensajería (p. ej. WhatsApp) cuando el usuario contacta con nosotros.
        </li>
      </ul>
      <p>
        El usuario garantiza que los datos que facilita son veraces y se compromete a no incluir
        datos de terceros sin su consentimiento.
      </p>

      <h2>3. Finalidades y bases jurídicas</h2>
      <table>
        <thead>
          <tr>
            <th>Finalidad</th>
            <th>Base jurídica (art. 6 RGPD)</th>
          </tr>
        </thead>
        <tbody>
          {LEGAL.hasForms ? (
            <tr>
              <td>Atender las consultas y solicitudes recibidas a través de los formularios o
                canales de contacto.</td>
              <td>Consentimiento del interesado (art. 6.1.a) y, en su caso, aplicación de medidas
                precontractuales (art. 6.1.b).</td>
            </tr>
          ) : (
            <tr>
              <td>Atender las consultas recibidas por los canales de contacto (email, teléfono,
                mensajería).</td>
              <td>Consentimiento del interesado (art. 6.1.a) y, en su caso, aplicación de medidas
                precontractuales (art. 6.1.b).</td>
            </tr>
          )}
          {LEGAL.sellsOnline ? (
            <tr>
              <td>Gestionar reservas, compras, pagos, confirmaciones y la prestación del servicio
                contratado, así como las obligaciones fiscales y contables derivadas.</td>
              <td>Ejecución de contrato (art. 6.1.b) y cumplimiento de obligaciones legales
                (art. 6.1.c).</td>
            </tr>
          ) : null}
          <tr>
            <td>Garantizar la seguridad del sitio web y prevenir el fraude o los abusos.</td>
            <td>Interés legítimo del responsable (art. 6.1.f).</td>
          </tr>
          <tr>
            <td>Análisis estadístico y publicidad mediante cookies no necesarias (solo si el
              usuario las acepta).</td>
            <td>Consentimiento del interesado (art. 6.1.a), gestionado conforme a la{' '}
              <a href="/politica-cookies">Política de Cookies</a>.</td>
          </tr>
        </tbody>
      </table>
      <p>
        No se adoptan decisiones automatizadas con efectos jurídicos sobre el usuario ni se
        elaboran perfiles en el sentido del art. 22 RGPD.
      </p>

      <h2>4. Plazos de conservación</h2>
      <ul>
        <li>
          <strong>Consultas y formularios:</strong> durante el tiempo necesario para atender la
          solicitud y, después, hasta 1 año, salvo que exista relación posterior.
        </li>
        {LEGAL.sellsOnline ? (
          <li>
            <strong>Datos contractuales y de facturación:</strong> durante la vigencia de la
            relación y, una vez finalizada, bloqueados durante los plazos de prescripción legales
            (con carácter general, 4 años a efectos fiscales conforme a la Ley General Tributaria
            y 6 años a efectos mercantiles conforme al art. 30 del Código de Comercio).
          </li>
        ) : null}
        <li>
          <strong>Datos de navegación y cookies:</strong> los plazos indicados en la{' '}
          <a href="/politica-cookies">Política de Cookies</a>; el consentimiento de cookies se
          renueva como máximo cada 12 meses.
        </li>
        <li>
          <strong>Datos asociados al ejercicio de derechos o a reclamaciones:</strong> durante los
          plazos de prescripción de las acciones correspondientes.
        </li>
      </ul>
      <p>
        Transcurridos estos plazos, los datos se suprimen o anonimizan de forma segura. Puede
        consultarse más detalle en el apartado de conservación de este documento, que constituye
        la política de conservación de datos del sitio.
      </p>

      <h2>5. Destinatarios y encargados del tratamiento</h2>
      <p>
        No se ceden datos a terceros salvo obligación legal (administraciones públicas, jueces y
        tribunales) o cuando sea necesario para prestar el servicio. Para el funcionamiento del
        sitio utilizamos proveedores que actúan como encargados del tratamiento (art. 28 RGPD):
      </p>
      {LEGAL.processors.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Servicio</th>
              <th>Ubicación</th>
              <th>Garantía de transferencia</th>
            </tr>
          </thead>
          <tbody>
            {LEGAL.processors.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>{p.purpose}</td>
                <td>{p.location}</td>
                <td>{p.guarantee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>
          Actualmente el alojamiento y la infraestructura del sitio son los únicos servicios de
          terceros utilizados.
        </p>
      )}

      <h2>6. Transferencias internacionales</h2>
      <p>
        Algunos de los proveedores indicados están ubicados en Estados Unidos u operan a nivel
        internacional. En esos casos, las transferencias se amparan en una decisión de adecuación
        de la Comisión Europea (Marco de Privacidad de Datos UE-EE. UU., «DPF») o en las Cláusulas
        Contractuales Tipo aprobadas por la Comisión (arts. 45 y 46 RGPD), junto con medidas
        suplementarias cuando resultan necesarias. Puede solicitar copia o referencia de dichas
        garantías escribiendo a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
      </p>

      <h2>7. Derechos de los usuarios</h2>
      <p>Cualquier persona tiene derecho a:</p>
      <ul>
        <li><strong>Acceso:</strong> conocer si tratamos sus datos y obtener copia de ellos.</li>
        <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
        <li><strong>Supresión:</strong> solicitar la eliminación de sus datos («derecho al olvido»).</li>
        <li><strong>Oposición:</strong> oponerse al tratamiento basado en interés legítimo.</li>
        <li><strong>Limitación:</strong> pedir la suspensión del tratamiento en los supuestos del art. 18 RGPD.</li>
        <li><strong>Portabilidad:</strong> recibir sus datos en formato estructurado y de uso común.</li>
        <li>
          <strong>Retirada del consentimiento:</strong> en cualquier momento, sin que ello afecte a
          la licitud del tratamiento anterior a la retirada.
        </li>
      </ul>
      <h3>Cómo ejercerlos</h3>
      <p>
        Enviando una solicitud a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> o por correo
        postal a {LEGAL.address}, indicando el derecho que desea ejercer y acompañando, si es
        necesario para identificarle, copia de un documento identificativo. Responderemos en el
        plazo máximo de un mes (prorrogable dos meses más en casos complejos, art. 12 RGPD). El
        ejercicio de estos derechos es gratuito.
      </p>
      <h3>Reclamación ante la autoridad de control</h3>
      <p>
        Si considera que el tratamiento no se ajusta a la normativa, puede presentar una
        reclamación ante la Agencia Española de Protección de Datos (AEPD), C/ Jorge Juan 6,
        28001 Madrid, <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>,
        sin perjuicio de dirigirse previamente a nosotros en{' '}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
      </p>

      <h2>8. Medidas de seguridad</h2>
      <p>
        {LEGAL.companyName} aplica las medidas técnicas y organizativas apropiadas conforme al
        art. 32 RGPD, teniendo en cuenta el estado de la técnica y los riesgos del tratamiento:
        cifrado de las comunicaciones mediante HTTPS/TLS, control de accesos basado en necesidad,
        minimización de los datos recogidos, proveedores con garantías adecuadas y procedimientos
        de gestión de violaciones de seguridad. En caso de violación de seguridad que suponga un
        alto riesgo para sus derechos, le será notificada conforme al art. 34 RGPD.
      </p>

      <h2>9. Menores de edad</h2>
      <p>
        Este sitio no se dirige a menores de 14 años. Si un padre, madre o tutor tiene
        conocimiento de que un menor ha facilitado datos personales sin su consentimiento, puede
        solicitarnos su supresión en <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
      </p>

      <h2>10. Actualizaciones</h2>
      <p>
        Esta política puede actualizarse para adaptarse a cambios normativos o del sitio. La
        versión vigente será siempre la publicada en esta página, con indicación de su fecha de
        última actualización.
      </p>
    </LegalShell>
  );
}
