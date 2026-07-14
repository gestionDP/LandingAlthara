'use client';

/** Admin — projects table + create. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchJson, Spinner, ErrorBox, EmptyState, Badge, formatDate } from '../../components/ui';
import { useDataroomSearch } from '../../DataroomShell';

interface ProjectRow {
  id: string; name: string; internalCode: string | null; status: string;
  investmentType: string | null; ownerName: string | null; ndaRequired: boolean;
  updatedAt: string; investorCount: number; documentCount: number;
}

export default function AdminProjects() {
  const [rows, setRows] = useState<ProjectRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const q = useDataroomSearch();

  const load = useCallback(async () => {
    setError(null);
    const res = await fetchJson<{ projects: ProjectRow[] }>('/api/dataroom/admin/projects');
    if (res.ok && res.data) setRows(res.data.projects);
    else setError(res.error ?? 'error');
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!rows) return null;
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      `${r.name} ${r.internalCode ?? ''} ${r.investmentType ?? ''} ${r.ownerName ?? ''}`.toLowerCase().includes(s));
  }, [rows, q]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl">Proyectos</h1>
          {rows && (
            <p className="mt-0.5 text-xs text-[#1c3742]/50">
              {rows.length} {rows.length === 1 ? 'proyecto' : 'proyectos'}
              {q.trim() && ` · ${filtered?.length ?? 0} en la búsqueda`}
            </p>
          )}
        </div>
        <button onClick={() => setShowCreate(true)}
          className="bg-[#1c3742] px-4 py-2 text-sm font-semibold text-[#e6e2d7]">
          + Nuevo proyecto
        </button>
      </div>

      {error && <ErrorBox message="No se ha podido cargar el listado." onRetry={load} />}
      {!rows && !error && <Spinner label="Cargando proyectos…" />}
      {rows && rows.length === 0 && <EmptyState title="Sin proyectos" subtitle="Cree el primer proyecto para empezar a subir documentación." />}
      {filtered && rows && rows.length > 0 && filtered.length === 0 && (
        <EmptyState title="Sin resultados" subtitle="Ningún proyecto coincide con la búsqueda del portal." />
      )}
      {filtered && filtered.length > 0 && (
        <div className="overflow-x-auto border border-[#1c3742]/10 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1c3742]/15 text-left text-[11px] uppercase tracking-wider text-[#1c3742]/50">
                <th className="px-4 py-3">Proyecto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Inversores</th>
                <th className="px-4 py-3">Documentos</th>
                <th className="px-4 py-3">NDA</th>
                <th className="px-4 py-3">Responsable</th>
                <th className="px-4 py-3">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-[#1c3742]/10 last:border-0 hover:bg-[#1c3742]/[0.04]">
                  <td className="px-4 py-3">
                    <Link href={`/dataroom/admin/projects/${r.id}`} className="hover:underline">
                      <p>{r.name}</p>
                      <p className="text-xs text-[#1c3742]/50">{r.internalCode ?? ''}{r.investmentType ? ` · ${r.investmentType}` : ''}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3"><Badge value={r.status} /></td>
                  <td className="px-4 py-3">{r.investorCount}</td>
                  <td className="px-4 py-3">{r.documentCount}</td>
                  <td className="px-4 py-3 text-xs">{r.ndaRequired ? 'Requerido' : 'No'}</td>
                  <td className="px-4 py-3 text-[#1c3742]/60">{r.ownerName ?? '—'}</td>
                  <td className="px-4 py-3 text-[#1c3742]/60">{formatDate(r.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
    </div>
  );
}

function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', internalCode: '', description: '', investmentType: '', ownerName: '', ndaRequired: true, ndaPolicy: 'resign' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetchJson('/api/dataroom/admin/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name.trim(),
        internalCode: form.internalCode.trim() || undefined,
        description: form.description.trim() || undefined,
        investmentType: form.investmentType.trim() || undefined,
        ownerName: form.ownerName.trim() || undefined,
        ndaRequired: form.ndaRequired,
        ndaPolicy: form.ndaPolicy,
      }),
    });
    setBusy(false);
    if (res.ok) onCreated();
    else setError('No se ha podido crear el proyecto.');
  }

  const input = 'w-full border border-[#1c3742]/25 bg-[#faf9f5] px-3 py-2 text-sm focus:outline-none';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102027]/50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="w-full max-w-md space-y-3 border border-[#1c3742]/20 bg-white p-6">
        <h2 className="font-playfair text-lg">Nuevo proyecto</h2>
        <input required placeholder="Nombre *" className={input} value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Código interno" className={input} value={form.internalCode}
            onChange={(e) => setForm({ ...form, internalCode: e.target.value })} />
          <input placeholder="Tipo de inversión" className={input} value={form.investmentType}
            onChange={(e) => setForm({ ...form, investmentType: e.target.value })} />
        </div>
        <input placeholder="Responsable interno" className={input} value={form.ownerName}
          onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
        <textarea placeholder="Descripción breve" rows={3} className={input} value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="flex items-center gap-2 text-xs text-[#1c3742]/70">
          <input type="checkbox" checked={form.ndaRequired}
            onChange={(e) => setForm({ ...form, ndaRequired: e.target.checked })} />
          Requiere NDA para documentación sensible
        </label>
        {form.ndaRequired && (
          <select className={input} value={form.ndaPolicy} onChange={(e) => setForm({ ...form, ndaPolicy: e.target.value })}>
            <option value="resign">Si el NDA cambia: pedir nueva firma</option>
            <option value="grandfather">Si el NDA cambia: mantener acceso con firma anterior</option>
            <option value="block">Si el NDA cambia: bloquear hasta decisión del admin</option>
          </select>
        )}
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="border border-[#1c3742]/30 px-4 py-2 text-sm">Cancelar</button>
          <button type="submit" disabled={busy}
            className="bg-[#1c3742] px-5 py-2 text-sm font-semibold text-[#e6e2d7] disabled:opacity-40">
            {busy ? 'Creando…' : 'Crear proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
}
