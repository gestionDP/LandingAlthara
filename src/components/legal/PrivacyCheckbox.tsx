'use client';

import Link from 'next/link';

/**
 * Checkbox de consentimiento RGPD para formularios (no premarcado, obligatorio)
 * con cláusula informativa de primera capa.
 */
export default function PrivacyCheckbox({
  id = 'privacy-consent',
  checked,
  onChange,
  companyName,
  email,
  purpose = 'atender tu consulta y responderte',
  locale = 'es',
  className = '',
}: {
  id?: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  companyName: string;
  email: string;
  purpose?: string;
  locale?: string;
  className?: string;
}) {
  const es = !locale || locale.startsWith('es');
  return (
    <div className={`space-y-2 text-xs leading-relaxed ${className}`}>
      <label htmlFor={id} className="flex items-start gap-2 cursor-pointer">
        <input
          id={id}
          name="privacyConsent"
          type="checkbox"
          required
          {...(onChange
            ? { checked: !!checked, onChange: (e) => onChange(e.target.checked) }
            : {})}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-400"
        />
        <span>
          {es ? (
            <>
              He leído y acepto la{' '}
              <Link href="/politica-privacidad" className="underline underline-offset-2" target="_blank">
                Política de Privacidad
              </Link>{' '}
              *
            </>
          ) : (
            <>
              I have read and accept the{' '}
              <Link href="/politica-privacidad" className="underline underline-offset-2" target="_blank">
                Privacy Policy
              </Link>{' '}
              *
            </>
          )}
        </span>
      </label>
      <p className="opacity-70">
        {es ? (
          <>
            <strong>Información básica sobre protección de datos:</strong> Responsable:{' '}
            {companyName}. Finalidad: {purpose}. Legitimación: tu consentimiento. Derechos:
            acceso, rectificación, supresión y otros, escribiendo a {email}. Información
            adicional en la Política de Privacidad.
          </>
        ) : (
          <>
            <strong>Basic data protection information:</strong> Controller: {companyName}.
            Purpose: {purpose}. Legal basis: your consent. Rights: access, rectification,
            erasure and others, by writing to {email}. Further details in the Privacy Policy.
          </>
        )}
      </p>
    </div>
  );
}
