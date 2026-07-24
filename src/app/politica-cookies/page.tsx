import type { Metadata } from 'next';
import LegalShell from '@/components/legal/LegalShell';
import { LEGAL } from '@/lib/legal-config';

export const metadata: Metadata = {
  title: `Política de Cookies · ${LEGAL.siteName}`,
  description: `Información sobre las cookies utilizadas por ${LEGAL.siteName} y cómo gestionarlas o desactivarlas.`,
  alternates: { canonical: '/politica-cookies' },
  robots: { index: true, follow: true },
};

const CATEGORY_LABEL: Record<string, string> = {
  necesarias: 'Técnicas / necesarias',
  analiticas: 'Analíticas',
  personalizacion: 'Personalización',
  publicitarias: 'Publicitarias',
};

export default function PoliticaCookies() {
  const hasNonEssential = LEGAL.cookieRows.some((c) => c.category !== 'necesarias');
  return (
    <LegalShell title="Política de Cookies" updated={LEGAL.updated}>
      <p>
        Esta Política de Cookies informa, conforme al art. 22.2 de la LSSI-CE, al RGPD y a la
        «Guía sobre el uso de las cookies» de la Agencia Española de Protección de Datos (AEPD),
        sobre qué cookies utiliza {LEGAL.siteName} ({LEGAL.domain}), con qué finalidad y cómo
        puede el usuario gestionarlas.
      </p>

      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos de texto que los sitios web almacenan en el navegador
        del usuario para recordar información sobre su visita. Junto a las cookies propiamente
        dichas, esta política cubre tecnologías similares (píxeles, balizas web, almacenamiento
        local del navegador).
      </p>

      <h2>2. Tipos de cookies</h2>
      <ul>
        <li>
          <strong>Según quién las gestiona:</strong> cookies <em>propias</em> (enviadas desde
          este dominio) y <em>de terceros</em> (enviadas desde dominios de otras entidades, como
          Google o Meta).
        </li>
        <li>
          <strong>Según su duración:</strong> de <em>sesión</em> (se eliminan al cerrar el
          navegador) y <em>persistentes</em> (permanecen durante el plazo indicado en la tabla).
        </li>
        <li>
          <strong>Según su finalidad:</strong>
          <ul>
            <li><strong>Técnicas o necesarias:</strong> imprescindibles para que el sitio funcione
              (p. ej. seguridad, gestión del consentimiento, proceso de reserva o pago). No
              requieren consentimiento.</li>
            <li><strong>Analíticas:</strong> miden el uso del sitio para mejorarlo.</li>
            <li><strong>De personalización:</strong> recuerdan preferencias del usuario (idioma,
              región, configuración).</li>
            <li><strong>Publicitarias y de seguimiento:</strong> permiten mostrar publicidad
              relevante y medir la eficacia de las campañas.</li>
          </ul>
        </li>
      </ul>

      <h2>3. Cookies utilizadas en este sitio</h2>
      {LEGAL.cookieRows.length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Proveedor</th>
                <th>Finalidad</th>
                <th>Duración</th>
                <th>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {LEGAL.cookieRows.map((c) => (
                <tr key={`${c.provider}-${c.name}`}>
                  <td>{c.name}</td>
                  <td>{c.provider}</td>
                  <td>{c.purpose}</td>
                  <td>{c.duration}</td>
                  <td>{CATEGORY_LABEL[c.category]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Los nombres y plazos exactos de las cookies de terceros pueden variar según las
            actualizaciones de cada proveedor; esta tabla se revisa periódicamente.
          </p>
        </>
      ) : (
        <p>
          <strong>Este sitio no utiliza actualmente cookies no técnicas.</strong> La navegación
          no instala cookies analíticas, de personalización ni publicitarias, por lo que no se
          muestra banner de consentimiento. Si en el futuro se incorporasen, esta política se
          actualizará y se solicitará el consentimiento previo del usuario.
        </p>
      )}

      {hasNonEssential ? (
        <>
          <h2>4. Consentimiento y cómo modificarlo</h2>
          <p>
            Las cookies no necesarias <strong>solo se instalan si el usuario las acepta</strong>{' '}
            en el banner de cookies, por categorías. El usuario puede en cualquier momento:
          </p>
          <ul>
            <li>
              Cambiar o retirar su consentimiento desde el enlace{' '}
              <strong>«Gestionar cookies»</strong> disponible en el pie de página de todas las
              páginas del sitio (o el botón equivalente de esta página).
            </li>
            <li>Rechazar todas las cookies no necesarias sin ninguna consecuencia para la navegación.</li>
          </ul>
          <p>
            El consentimiento (o su rechazo) se conserva durante un máximo de 12 meses,
            transcurridos los cuales se solicitará de nuevo.
          </p>
        </>
      ) : null}

      <h2>{hasNonEssential ? '5' : '4'}. Cómo desactivar las cookies desde el navegador</h2>
      <p>
        Además, el usuario puede bloquear o eliminar las cookies desde la configuración de su
        navegador:
      </p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/es/kb/impedir-que-los-sitios-web-guarden-sus-preferencia" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
        <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
      </ul>
      <p>
        El bloqueo de las cookies técnicas puede afectar al funcionamiento de algunas partes del
        sitio.
      </p>

      <h2>{hasNonEssential ? '6' : '5'}. Responsable y más información</h2>
      <p>
        El responsable del tratamiento es {LEGAL.companyName} (NIF {LEGAL.cif}). Para más
        información sobre el tratamiento de datos personales, incluidos los derechos del usuario
        y las transferencias internacionales asociadas a las cookies de terceros, consulte la{' '}
        <a href="/politica-privacidad">Política de Privacidad</a> o escriba a{' '}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
      </p>
    </LegalShell>
  );
}
