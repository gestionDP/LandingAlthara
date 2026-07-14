'use client';

/** Mi perfil: el inversor completa/edita sus datos personales + datos KYC descifrados. */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchJson, Spinner, ErrorBox, Badge, formatDate } from '../components/ui';

interface Me {
  investor?: {
    firstName: string | null; lastName: string | null; email: string; status: string;
    language: string | null; phone: string | null; company: string | null;
    country: string | null; investorType: string | null;
  };
  admin?: boolean;
  pendingActivation?: boolean;
}

interface KycData {
  submitted?: boolean;
  documentType: string | null;
  documentNumber: string | null;
  residenceCountry: string | null;
  phone: string | null;
  investorProfile: { investorType?: string; ticketRange?: string; experience?: string } | null;
  submittedAt: string | null;
  status: string;
  rejectionReason: string | null;
}

const INVESTOR_TYPES: { value: string; label: string }[] = [
  { value: 'individual', label: 'Particular' },
  { value: 'legal_entity', label: 'Sociedad' },
  { value: 'professional', label: 'Profesional' },
  { value: 'institutional', label: 'Institucional' },
];

const DOC_TYPE_LABELS: Record<string, string> = {
  dni: 'DNI', nie: 'NIE', passport: 'Pasaporte', other: 'Otro',
};

const KYC_STATUS_MAP: Record<string, { label: string; style: string }> = {
  active: { label: 'Verificado', style: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  pending_validation: { label: 'Pendiente de validación', style: 'bg-[#1c3742]/5 text-[#c08552] border-[#c08552]/45' },
  rejected: { label: 'Rechazado', style: 'bg-red-50 text-red-700 border-red-300' },
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', company: '', country: '',
    investorType: 'individual', language: 'es',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [res, kycRes] = await Promise.all([
      fetchJson<Me>('/api/dataroom/me'),
      fetchJson<KycData>('/api/dataroom/kyc'),
    ]);
    if (res.ok && res.data?.investor) {
      const i = res.data.investor;
      setEmail(i.email);
      setForm({
        firstName: i.firstName ?? '', lastName: i.lastName ?? '', phone: i.phone ?? '',
        company: i.company ?? '', country: i.country ?? '',
        investorType: i.investorType ?? 'individual', language: i.language ?? 'es',
      });
    } else if (res.ok && res.data?.admin) {
      setError('admin');
    } else if (res.ok && res.data?.pendingActivation) {
      setError('pending');
    } else {
      setError(res.error ?? 'error');
    }
    if (kycRes.ok && kycRes.data && kycRes.data.documentType) setKyc(kycRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetchJson('/api/dataroom/me', { method: 'PATCH', body: JSON.stringify(form) });
    setSaving(false);
    setMsg(res.ok ? 'Datos guardados.' : 'No se han podido guardar los cambios.');
  }

  if (loading) return <Spinner label="Cargando su perfil…" />;
  if (error === 'admin')
    return <ErrorBox message="Ha iniciado sesión como administrador. Esta página es para inversores." />;
  if (error === 'pending')
    return <ErrorBox message="Su cuenta aún no está activada. Abra el enlace de invitación de Althara para completar su alta." />;
  if (error) return <ErrorBox message="No hemos podido cargar su perfil." onRetry={load} />;

  const field = 'w-full border border-[#1c3742]/20 bg-white px-3 py-2 text-sm focus:border-[#1c3742]/50 focus:outline-none rounded-md';
  const label = 'mb-1 block text-xs font-medium uppercase tracking-wider text-[#1c3742]/55';
  const readOnly = `${field} bg-[#1c3742]/[0.04] text-[#1c3742]/60`;

  const kycBadge = kyc ? KYC_STATUS_MAP[kyc.status] : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/dataroom" className="text-xs text-[#1c3742]/50 hover:text-[#1c3742]">← Volver a mis proyectos</Link>
        <h1 className="mt-2 font-playfair text-3xl">Mi perfil</h1>
        <p className="mt-1 text-sm text-[#1c3742]/60">Complete o actualice sus datos. Se guardan en su cuenta de Althara.</p>
      </div>

      <form onSubmit={save} className="space-y-5 border border-[#1c3742]/10 bg-white p-6 rounded-lg">
        <div>
          <label className={label}>Email</label>
          <input value={email} disabled className={readOnly} />
          <p className="mt-1 text-[11px] text-[#1c3742]/40">El email de acceso no se puede cambiar aquí.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label}>Nombre</label>
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={field} />
          </div>
          <div>
            <label className={label}>Apellidos</label>
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={field} />
          </div>
          <div>
            <label className={label}>Teléfono</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} />
          </div>
          <div>
            <label className={label}>País</label>
            <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Empresa</label>
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={field} />
          </div>
          <div>
            <label className={label}>Tipo de inversor</label>
            <select value={form.investorType} onChange={(e) => setForm({ ...form, investorType: e.target.value })} className={field}>
              {INVESTOR_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Idioma</label>
            <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={field}>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-[#1c3742] px-6 py-2.5 text-sm font-semibold text-[#e6e2d7] disabled:opacity-40 rounded-md">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {msg && <span className="text-sm text-[#1c3742]/70">{msg}</span>}
        </div>
      </form>

      {/* Verificación de identidad (KYC) — datos completos descifrados */}
      {kyc && (
        <div className="border border-[#1c3742]/10 bg-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50">
              Verificación de identidad
            </h2>
            {kycBadge && (
              <span className={`inline-flex items-center border px-2.5 py-0.5 text-[11px] font-medium rounded-md ${kycBadge.style}`}>
                {kycBadge.label}
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label}>Tipo de documento</label>
              <input value={DOC_TYPE_LABELS[kyc.documentType ?? ''] ?? kyc.documentType ?? '—'} disabled className={readOnly} />
            </div>
            <div>
              <label className={label}>Nº de documento</label>
              <input value={kyc.documentNumber ?? '—'} disabled className={readOnly} />
            </div>
            <div>
              <label className={label}>País de residencia</label>
              <input value={kyc.residenceCountry?.toUpperCase() ?? '—'} disabled className={readOnly} />
            </div>
            <div>
              <label className={label}>Teléfono (verificación)</label>
              <input value={kyc.phone ?? '—'} disabled className={readOnly} />
            </div>
            <div>
              <label className={label}>Fecha de envío</label>
              <input value={kyc.submittedAt ? formatDate(kyc.submittedAt) : '—'} disabled className={readOnly} />
            </div>
            <div>
              <label className={label}>Estado</label>
              <div className="mt-1"><Badge value={kyc.status} /></div>
            </div>
          </div>

          {/* Perfil de inversor (datos adicionales del KYC) */}
          {kyc.investorProfile && Object.values(kyc.investorProfile).some(Boolean) && (
            <div className="mt-5 border-t border-[#1c3742]/10 pt-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#1c3742]/55">Perfil de inversión</p>
              <div className="grid gap-5 sm:grid-cols-2">
                {kyc.investorProfile.ticketRange && (
                  <div>
                    <label className={label}>Rango de inversión</label>
                    <input value={kyc.investorProfile.ticketRange} disabled className={readOnly} />
                  </div>
                )}
                {kyc.investorProfile.experience && (
                  <div className={kyc.investorProfile.ticketRange ? '' : 'sm:col-span-2'}>
                    <label className={label}>Experiencia</label>
                    <input value={kyc.investorProfile.experience} disabled className={readOnly} />
                  </div>
                )}
                {kyc.investorProfile.investorType && (
                  <div>
                    <label className={label}>Tipo (KYC)</label>
                    <input value={kyc.investorProfile.investorType} disabled className={readOnly} />
                  </div>
                )}
              </div>
            </div>
          )}

          {kyc.status === 'rejected' && kyc.rejectionReason && (
            <div className="mt-5 border-l-2 border-red-400 bg-red-50 px-4 py-3 rounded-md">
              <p className="text-xs font-medium uppercase tracking-wider text-red-700">Motivo del rechazo</p>
              <p className="mt-1 text-sm text-red-800">{kyc.rejectionReason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
