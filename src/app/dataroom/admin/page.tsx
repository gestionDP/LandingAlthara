'use client';

/** Admin dashboard — overview del portal con métricas clave y actividad reciente. */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchJson, Spinner, ErrorBox, Badge, formatDate, actionLabel } from '../components/ui';

interface Stats {
  investors: { total: number; active: number; pending: number; rejected: number };
  projects: { total: number; published: number; draft: number };
  documents: number;
  ndaSignatures: number;
}

interface AuditRow {
  id: string; action: string; actorEmail: string | null;
  entityType: string | null; createdAt: string; result: string | null;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<AuditRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [invRes, projRes, auditRes, ndaRes] = await Promise.all([
      fetchJson<{ investors: { id: string; status: string }[] }>('/api/dataroom/admin/investors'),
      fetchJson<{ projects: { id: string; status: string; documentCount?: number }[] }>('/api/dataroom/admin/projects'),
      fetchJson<{ events: AuditRow[] }>('/api/dataroom/admin/audit?limit=10'),
      fetchJson<{ versions: unknown[]; signatures: { id: string }[] }>('/api/dataroom/admin/nda'),
    ]);

    if (!invRes.ok || !projRes.ok) {
      setError('No se han podido cargar los datos del portal.');
      setLoading(false);
      return;
    }

    const investors = invRes.data?.investors ?? [];
    const projects = projRes.data?.projects ?? [];

    setStats({
      investors: {
        total: investors.length,
        active: investors.filter((i) => i.status === 'active').length,
        pending: investors.filter((i) => ['pending_validation', 'invited', 'registration_started'].includes(i.status)).length,
        rejected: investors.filter((i) => i.status === 'rejected').length,
      },
      projects: {
        total: projects.length,
        published: projects.filter((p) => p.status === 'published').length,
        draft: projects.filter((p) => p.status === 'draft').length,
      },
      documents: projects.reduce((sum, p) => sum + (p.documentCount ?? 0), 0),
      ndaSignatures: (ndaRes.data?.signatures ?? []).length,
    });

    if (auditRes.ok && auditRes.data) {
      setActivity(auditRes.data.events ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner label="Cargando panel…" />;
  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl">Panel de control</h1>
        <p className="mt-1 text-sm text-[#1c3742]/60">Vista general del portal de inversores.</p>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Inversores" value={stats.investors.total} href="/dataroom/admin/investors">
          <span className="text-emerald-600">{stats.investors.active} activos</span>
          {stats.investors.pending > 0 && <span className="text-[#c08552]">{stats.investors.pending} pendientes</span>}
          {stats.investors.rejected > 0 && <span className="text-red-600">{stats.investors.rejected} rechazados</span>}
        </MetricCard>
        <MetricCard label="Proyectos" value={stats.projects.total} href="/dataroom/admin/projects">
          <span className="text-emerald-600">{stats.projects.published} publicados</span>
          {stats.projects.draft > 0 && <span className="text-[#1c3742]/50">{stats.projects.draft} borrador</span>}
        </MetricCard>
        <MetricCard label="Documentos" value={stats.documents} href="/dataroom/admin/projects" />
        <MetricCard label="Firmas NDA" value={stats.ndaSignatures} href="/dataroom/admin/nda" />
      </div>

      {/* Actividad reciente */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50">
            Actividad reciente
          </h2>
          <Link href="/dataroom/admin/audit" className="text-xs text-[#1c3742]/50 hover:text-[#1c3742]">
            Ver todo →
          </Link>
        </div>
        {activity.length === 0 ? (
          <p className="text-sm text-[#1c3742]/50">Sin actividad reciente.</p>
        ) : (
          <div className="overflow-x-auto border border-[#1c3742]/10 bg-white rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1c3742]/10 text-left text-[11px] uppercase tracking-wider text-[#1c3742]/50">
                  <th className="px-4 py-2.5 font-medium">Fecha</th>
                  <th className="px-4 py-2.5 font-medium">Acción</th>
                  <th className="px-4 py-2.5 font-medium">Actor</th>
                  <th className="px-4 py-2.5 font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c3742]/5">
                {activity.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap px-4 py-2.5 text-[#1c3742]/60">{formatDate(e.createdAt)}</td>
                    <td className="px-4 py-2.5">{actionLabel(e.action)}</td>
                    <td className="px-4 py-2.5 text-[#1c3742]/60">{e.actorEmail ?? '—'}</td>
                    <td className="px-4 py-2.5">{e.result ? <Badge value={e.result} /> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Accesos rápidos */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50">
          Accesos rápidos
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickLink href="/dataroom/admin/investors" label="Gestionar inversores" desc="Crear, invitar y verificar inversores" />
          <QuickLink href="/dataroom/admin/projects" label="Gestionar proyectos" desc="Subir documentos y asignar accesos" />
          <QuickLink href="/dataroom/admin/nda" label="NDA del portal" desc="Versionar y revisar firmas" />
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, href, children }: {
  label: string; value: number; href: string; children?: React.ReactNode;
}) {
  return (
    <Link href={href} className="border border-[#1c3742]/10 bg-white p-5 rounded-lg transition hover:-translate-y-0.5 hover:border-[#1c3742]/25">
      <p className="text-xs font-medium uppercase tracking-wider text-[#1c3742]/50">{label}</p>
      <p className="mt-2 font-playfair text-3xl">{value}</p>
      {children && <div className="mt-2 flex flex-wrap gap-3 text-xs">{children}</div>}
    </Link>
  );
}

function QuickLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link href={href} className="group border border-[#1c3742]/10 bg-white p-4 rounded-lg transition hover:bg-[#1c3742]/[0.03]">
      <p className="text-sm font-semibold text-[#1c3742] group-hover:text-[#c08552]">{label}</p>
      <p className="mt-1 text-xs text-[#1c3742]/50">{desc}</p>
    </Link>
  );
}
