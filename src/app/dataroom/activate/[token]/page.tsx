'use client';

/**
 * Invitation activation: validate token -> password + basic data form ->
 * complete registration -> redirect to sign-in. Handles every token error
 * state explicitly. Nothing sensitive is ever kept in localStorage.
 */
import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson, Spinner, ErrorBox } from '../../components/ui';

interface Prefill {
  email: string; firstName: string | null; lastName: string | null;
  company: string | null; phone: string | null; language: string | null;
  investorType: string | null;
}

const TOKEN_ERRORS: Record<string, string> = {
  invalid: 'El enlace de invitación no es válido. Compruebe que ha copiado la URL completa o solicite una nueva invitación.',
  expired: 'Este enlace de invitación ha caducado. Contacte con su gestor en Althara para recibir uno nuevo.',
  used: 'Este enlace ya fue utilizado. Si ya activó su cuenta, inicie sesión.',
  revoked: 'Esta invitación ha sido revocada. Contacte con su gestor en Althara.',
  already_active: 'Su cuenta ya está activa. Puede iniciar sesión directamente.',
  rate_limited: 'Demasiados intentos. Espere unos segundos y vuelva a intentarlo.',
};

export default function ActivatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [phase, setPhase] = useState<'validating' | 'form' | 'submitting' | 'done' | 'token_error'>('validating');
  const [tokenError, setTokenError] = useState<string>('invalid');
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', country: 'España', company: '',
    investorType: 'individual', password: '', password2: '',
    acceptPrivacy: false, acceptTerms: false, language: 'es',
    // KYC
    documentType: 'dni', documentNumber: '', residenceCountry: 'ES',
    ticketRange: '', experience: '',
  });

  const validate = useCallback(async () => {
    setPhase('validating');
    const res = await fetchJson<{ ok: boolean; investor?: Prefill; reason?: string }>(
      '/api/dataroom/invitations/validate',
      { method: 'POST', body: JSON.stringify({ token }) },
    );
    if (res.ok && res.data?.ok && res.data.investor) {
      const inv = res.data.investor;
      setPrefill(inv);
      setForm((f) => ({
        ...f,
        firstName: inv.firstName ?? '',
        lastName: inv.lastName ?? '',
        phone: inv.phone ?? '',
        company: inv.company ?? '',
        investorType: inv.investorType ?? 'individual',
        language: inv.language ?? 'es',
      }));
      setPhase('form');
    } else {
      setTokenError((res.data as { reason?: string } | null)?.reason ?? res.error ?? 'invalid');
      setPhase('token_error');
    }
  }, [token]);

  useEffect(() => { validate(); }, [validate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (form.password !== form.password2) return setFormError('Las contraseñas no coinciden.');
    if (form.password.length < 12) return setFormError('La contraseña debe tener al menos 12 caracteres, con mayúsculas, minúsculas y números.');
    if (!form.acceptPrivacy || !form.acceptTerms) return setFormError('Debe aceptar la política de privacidad y los términos de uso.');
    if (form.documentNumber.trim().length < 3) return setFormError('Introduzca su número de documento para la verificación de identidad.');
    if (form.residenceCountry.trim().length !== 2) return setFormError('Indique su país de residencia (código de 2 letras, p. ej. ES).');

    setPhase('submitting');
    const res = await fetchJson<{ ok: boolean; reason?: string }>('/api/dataroom/invitations/complete', {
      method: 'POST',
      body: JSON.stringify({
        token,
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        country: form.country.trim(),
        company: form.company.trim() || undefined,
        investorType: form.investorType,
        acceptPrivacy: true,
        acceptTerms: true,
        language: form.language,
        kyc: {
          documentType: form.documentType,
          documentNumber: form.documentNumber.trim(),
          residenceCountry: form.residenceCountry.trim().toUpperCase(),
          investorProfile: {
            investorType: form.investorType,
            ticketRange: form.ticketRange || undefined,
            experience: form.experience || undefined,
          },
        },
      }),
    });

    if (res.ok && res.data?.ok) {
      setPhase('done');
      setTimeout(() => router.push('/dataroom/sign-in'), 2500);
    } else {
      const reason = (res.data as { reason?: string } | null)?.reason ?? res.error;
      if (reason && TOKEN_ERRORS[reason]) {
        setTokenError(reason);
        setPhase('token_error');
      } else {
        setFormError(
          reason === 'weak_password'
            ? 'La contraseña no cumple la política de seguridad (mínimo 12 caracteres, mayúsculas, minúsculas y números).'
            : 'No se ha podido completar el registro. Inténtelo de nuevo.',
        );
        setPhase('form');
      }
    }
  }

  const input = 'w-full border border-[#1c3742]/25 bg-[#faf9f5] px-3 py-2 text-sm text-[#1c3742] placeholder:text-[#1c3742]/30 focus:border-[#1c3742]/50 focus:outline-none rounded-md';
  const label = 'mb-1 block text-xs font-medium uppercase tracking-wider text-[#1c3742]/60';

  if (phase === 'validating') return <Spinner label="Validando su invitación…" />;

  if (phase === 'token_error') {
    return (
      <div className="mx-auto max-w-md space-y-4 py-10 text-center">
        <h1 className="font-playfair text-2xl">Invitación no disponible</h1>
        <ErrorBox message={TOKEN_ERRORS[tokenError] ?? TOKEN_ERRORS.invalid} />
        {(tokenError === 'used' || tokenError === 'already_active') && (
          <button onClick={() => router.push('/dataroom/sign-in')} className="bg-[#1c3742] px-5 py-2 text-sm font-semibold text-[#e6e2d7] rounded-md">
            Iniciar sesión
          </button>
        )}
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="mx-auto max-w-md space-y-3 py-16 text-center">
        <h1 className="font-playfair text-2xl">Registro enviado</h1>
        <p className="text-sm text-[#1c3742]/70">
          Hemos recibido sus datos. Althara verificará su identidad y le avisará cuando su acceso
          esté activo. Le redirigimos al inicio de sesión…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-playfair text-2xl">Active su cuenta de inversor</h1>
      <p className="mt-1 text-sm text-[#1c3742]/60">
        Invitación para <strong>{prefill?.email}</strong>. Complete sus datos y cree su contraseña.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Nombre *</label>
            <input required maxLength={100} className={input} value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div>
            <label className={label}>Apellidos *</label>
            <input required maxLength={100} className={input} value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <div>
            <label className={label}>Teléfono</label>
            <input maxLength={30} className={input} value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className={label}>País de residencia *</label>
            <input required maxLength={80} className={input} value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div>
            <label className={label}>Empresa (si aplica)</label>
            <input maxLength={150} className={input} value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div>
            <label className={label}>Tipo de inversor *</label>
            <select className={input} value={form.investorType}
              onChange={(e) => setForm({ ...form, investorType: e.target.value })}>
              <option value="individual">Persona física</option>
              <option value="legal_entity">Persona jurídica</option>
              <option value="professional">Profesional</option>
              <option value="institutional">Institucional</option>
            </select>
          </div>
          <div>
            <label className={label}>Contraseña *</label>
            <input required type="password" autoComplete="new-password" className={input} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className={label}>Repita la contraseña *</label>
            <input required type="password" autoComplete="new-password" className={input} value={form.password2}
              onChange={(e) => setForm({ ...form, password2: e.target.value })} />
          </div>
        </div>
        <p className="text-xs text-[#1c3742]/50">
          Mínimo 12 caracteres, con mayúsculas, minúsculas y números.
        </p>

        {/* Verificación de identidad (KYC) */}
        <div className="border-t border-[#1c3742]/10 pt-5">
          <p className="text-sm font-semibold text-[#1c3742]">Verificación de identidad</p>
          <p className="mt-0.5 text-xs text-[#1c3742]/55">
            Necesaria para dar acceso a la documentación. Sus datos se guardan cifrados y los revisa Althara.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Tipo de documento *</label>
              <select className={input} value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })}>
                <option value="dni">DNI</option>
                <option value="nie">NIE</option>
                <option value="passport">Pasaporte</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label className={label}>Número de documento *</label>
              <input required maxLength={60} className={input} value={form.documentNumber}
                onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} />
            </div>
            <div>
              <label className={label}>País de residencia (ISO, ej. ES) *</label>
              <input required maxLength={2} className={`${input} uppercase`} value={form.residenceCountry}
                onChange={(e) => setForm({ ...form, residenceCountry: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className={label}>Rango de ticket (opcional)</label>
              <input maxLength={60} className={input} value={form.ticketRange} placeholder="p. ej. 100k–500k"
                onChange={(e) => setForm({ ...form, ticketRange: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Experiencia inversora (opcional)</label>
              <input maxLength={200} className={input} value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })} />
            </div>
          </div>
        </div>

        <label className="flex items-start gap-2 text-xs text-[#1c3742]/70">
          <input type="checkbox" checked={form.acceptPrivacy}
            onChange={(e) => setForm({ ...form, acceptPrivacy: e.target.checked })} className="mt-0.5" />
          <span>He leído y acepto la <a href="/privacy" target="_blank" className="underline">política de privacidad</a>. *</span>
        </label>
        <label className="flex items-start gap-2 text-xs text-[#1c3742]/70">
          <input type="checkbox" checked={form.acceptTerms}
            onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })} className="mt-0.5" />
          <span>Acepto los <a href="/terms" target="_blank" className="underline">términos de uso</a> del portal de inversores. *</span>
        </label>

        {formError && <p className="text-sm text-red-700">{formError}</p>}

        <button
          type="submit"
          disabled={phase === 'submitting'}
          className="w-full bg-[#1c3742] px-5 py-2.5 text-sm font-semibold text-[#e6e2d7] disabled:opacity-50 rounded-md"
        >
          {phase === 'submitting' ? 'Activando…' : 'Activar cuenta'}
        </button>
      </form>
    </div>
  );
}
