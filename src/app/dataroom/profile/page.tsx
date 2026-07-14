'use client';

/** Mi perfil: el inversor completa/edita sus datos personales. */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchJson, Spinner, ErrorBox } from '../components/ui';

interface Me {
  investor?: {
    firstName: string | null; lastName: string | null; email: string; status: string;
    language: string | null; phone: string | null; company: string | null;
    country: string | null; investorType: string | null;
  };
  admin?: boolean;
  pendingActivation?: boolean;
}

const INVESTOR_TYPES: { value: string; label: string }[] = [
  { value: 'individual', label: 'Particular' },
  { value: 'legal_entity', label: 'Sociedad' },
  { value: 'professional', label: 'Profesional' },
  { value: 'institutional', label: 'Institucional' },
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', company: '', country: '',
    investorType: 'individual', language: 'es',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchJson<Me>('/api/dataroom/me');
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

  const field = 'w-full border border-[#1c3742]/20 bg-white px-3 py-2 text-sm focus:border-[#1c3742]/50 focus:outline-none';
  const label = 'mb-1 block text-xs font-medium uppercase tracking-wider text-[#1c3742]/55';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/dataroom" className="text-xs text-[#1c3742]/50 hover:text-[#1c3742]">← Volver a mis proyectos</Link>
        <h1 className="mt-2 font-playfair text-3xl">Mi perfil</h1>
        <p className="mt-1 text-sm text-[#1c3742]/60">Complete o actualice sus datos. Se guardan en su cuenta de Althara.</p>
      </div>

      <form onSubmit={save} className="space-y-5 border border-[#1c3742]/10 bg-white p-6 shadow-sm">
        <div>
          <label className={label}>Email</label>
          <input value={email} disabled className={`${field} bg-[#1c3742]/[0.04] text-[#1c3742]/60`} />
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
          <button type="submit" disabled={saving} className="bg-[#1c3742] px-6 py-2.5 text-sm font-semibold text-[#e6e2d7] disabled:opacity-40">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {msg && <span className="text-sm text-[#1c3742]/70">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
