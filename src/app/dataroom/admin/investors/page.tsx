'use client';

/** Admin — investors table: filters, create+invite, lifecycle actions. */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchJson, Spinner, ErrorBox, EmptyState, Badge, STATUS_LABELS, formatDate } from '../../components/ui';

interface InvestorRow {
  id: string; email: string; firstName: string | null; lastName: string | null;
  company: string | null; status: string; invitedAt: string | null;
  lastAccessAt: string | null; createdAt: string; projectCount: number; pendingNdaCount: number;
}

const STATUSES = ['', 'draft', 'invited', 'invitation_expired', 'invitation_revoked', 'registration_started', 'active', 'suspended', 'disabled'];

export default function AdminInvestors() {
  const [rows, setRows] = useState<InvestorRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const qs = status ? `?status=${status}` : '';
    const res = await fetchJson<{ investors: InvestorRow[] }>(`/api/dataroom/admin/investors${qs}`);
    if (res.ok && res.data) setRows(res.data.investors);
    else setError(res.error ?? 'error');
  }, [status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-playfair text-2xl">Inversores</h1>
        <div className="flex gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="border border-[#1c3742]/25 bg-white px-3 py-2 text-sm">
            {STATUSES.map((s) => <option key={s} value={s}>{s ? STATUS_LABELS[s] ?? s : 'Todos los estados'}</option>)}
          </select>
          <button onClick={() => setShowCreate(true)}
            className="bg-[#1c3742] px-4 py-2 text-sm font-semibold text-[#e6e2d7]">
            + Nuevo inversor
          </button>
        </div>
      </div>

      {error && <ErrorBox message="No se ha podido cargar el listado." onRetry={load} />}
      {!rows && !error && <Spinner label="Cargando inversores…" />}
      {rows && rows.length === 0 && (
        <EmptyState title="Sin inversores" subtitle="Cree el primer inversor para enviarle una invitación." />
      )}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto border border-[#1c3742]/10 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1c3742]/15 text-left text-[11px] uppercase tracking-wider text-[#1c3742]/50">
                <th className="px-4 py-3">Inversor</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Invitado</th>
                <th className="px-4 py-3">Último acceso</th>
                <th className="px-4 py-3">Proyectos</th>
                <th className="px-4 py-3">NDA pdtes.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#1c3742]/10 last:border-0 hover:bg-[#1c3742]/[0.04]">
                  <td className="px-4 py-3">
                    <Link href={`/dataroom/admin/investors/${r.id}`} className="hover:underline">
                      <p>{[r.firstName, r.lastName].filter(Boolean).join(' ') || '—'}</p>
                      <p className="text-xs text-[#1c3742]/50">{r.email}{r.company ? ` · ${r.company}` : ''}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3"><Badge value={r.status} /></td>
                  <td className="px-4 py-3 text-[#1c3742]/60">{formatDate(r.invitedAt)}</td>
                  <td className="px-4 py-3 text-[#1c3742]/60">{formatDate(r.lastAccessAt)}</td>
                  <td className="px-4 py-3">{r.projectCount}</td>
                  <td className="px-4 py-3">
                    {r.pendingNdaCount > 0
                      ? <span className="text-[#8a5a33]">{r.pendingNdaCount}</span>
                      : <span className="text-[#1c3742]/40">0</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CreateInvestorModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
    </div>
  );
}

function CreateInvestorModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', company: '', phone: '', investorType: '', language: 'es', sendInvitation: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetchJson('/api/dataroom/admin/investors', {
      method: 'POST',
      body: JSON.stringify({
        email: form.email.trim(),
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        company: form.company.trim() || undefined,
        phone: form.phone.trim() || undefined,
        investorType: form.investorType || undefined,
        language: form.language,
        sendInvitation: form.sendInvitation,
      }),
    });
    setBusy(false);
    if (res.ok) onCreated();
    else setError(
      res.error === 'email_already_registered' ? 'Ese email ya está dado de alta.'
      : res.error === 'invitation_email_failed' ? 'Inversor creado, pero el email de invitación falló. Reenvíela desde su ficha.'
      : 'No se ha podido crear el inversor.',
    );
  }

  const input = 'w-full border border-[#1c3742]/25 bg-[#faf9f5] px-3 py-2 text-sm focus:outline-none';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102027]/50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="w-full max-w-md space-y-3 border border-[#1c3742]/20 bg-white p-6">
        <h2 className="font-playfair text-lg">Nuevo inversor</h2>
        <input required type="email" placeholder="Email *" className={input} value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Nombre" className={input} value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <input placeholder="Apellidos" className={input} value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <input placeholder="Empresa" className={input} value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input placeholder="Teléfono" className={input} value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select className={input} value={form.investorType} onChange={(e) => setForm({ ...form, investorType: e.target.value })}>
            <option value="">Tipo de inversor…</option>
            <option value="individual">Persona física</option>
            <option value="legal_entity">Persona jurídica</option>
            <option value="professional">Profesional</option>
            <option value="institutional">Institucional</option>
          </select>
          <select className={input} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs text-[#1c3742]/70">
          <input type="checkbox" checked={form.sendInvitation}
            onChange={(e) => setForm({ ...form, sendInvitation: e.target.checked })} />
          Enviar invitación por email ahora
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="border border-[#1c3742]/30 px-4 py-2 text-sm">Cancelar</button>
          <button type="submit" disabled={busy}
            className="bg-[#1c3742] px-5 py-2 text-sm font-semibold text-[#e6e2d7] disabled:opacity-40">
            {busy ? 'Creando…' : 'Crear inversor'}
          </button>
        </div>
      </form>
    </div>
  );
}
