'use client';

/**
 * Admin — detalle de proyecto con flujo guiado:
 * 1) NDA → 2) Inversores → 3) Documentos → 4) Activar.
 * Todo se gestiona desde esta página: asignar/revocar inversores, subir,
 * publicar, versionar, notificar y eliminar.
 */
import { use, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchJson, Spinner, ErrorBox, Badge, STATUS_LABELS, actionLabel, formatDate, formatBytes,
} from '../../../components/ui';

interface Detail {
  project: {
    id: string; name: string; description: string | null; internalCode: string | null;
    status: string; investmentType: string | null; ownerName: string | null;
    ndaRequired: boolean; ndaPolicy: string; updatedAt: string;
  };
  investors: { access: { status: string; accessLevel: string; grantedAt: string }; investorId: string; email: string; firstName: string | null; lastName: string | null; investorStatus: string }[];
  documents: { id: string; title: string; status: string; confidentiality: string; downloadable: boolean; requiresNda: boolean; updatedAt: string }[];
  categories: { id: string; name: string; slug: string }[];
  ndaVersions: { id: string; version: number; title: string; active: boolean; createdAt: string }[];
  signatures: { id: string; investorId: string; status: string; signedAt: string; signerFullName: string; hasCopy: string | null }[];
  activity: { id: string; action: string; result: string; createdAt: string; actorEmail: string | null }[];
}

interface InvestorOption { id: string; email: string; firstName: string | null; lastName: string | null; status: string }

const PROJECT_STATUSES = ['draft', 'active', 'temporarily_unavailable', 'closed', 'archived'];

export default function AdminProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<Detail | null>(null);
  const [allInvestors, setAllInvestors] = useState<InvestorOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [d, inv] = await Promise.all([
      fetchJson<Detail>(`/api/dataroom/admin/projects/${id}`),
      fetchJson<{ investors: InvestorOption[] }>(`/api/dataroom/admin/investors`),
    ]);
    if (d.ok && d.data) setData(d.data);
    else setError(d.error ?? 'error');
    if (inv.ok && inv.data) setAllInvestors(inv.data.investors);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function patch(body: Record<string, unknown>, okMsg = 'Guardado.') {
    setBusy(true);
    setMsg(null);
    const res = await fetchJson(`/api/dataroom/admin/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
    setBusy(false);
    if (res.ok) { setMsg(okMsg); load(); } else setMsg(`Error: ${res.error}`);
  }

  async function docAction(docId: string, action: string) {
    const res = await fetchJson(`/api/dataroom/admin/documents/${docId}`, {
      method: 'PATCH', body: JSON.stringify({ action }),
    });
    if (res.ok) load(); else setMsg(`Error: ${res.error}`);
  }

  async function deleteDoc(docId: string, title: string) {
    if (!confirm(`¿Eliminar «${title}»? Dejará de ser visible para todos (el registro se conserva en auditoría).`)) return;
    const res = await fetchJson(`/api/dataroom/admin/documents/${docId}`, { method: 'DELETE' });
    if (res.ok) load(); else setMsg(`Error: ${res.error}`);
  }

  async function deleteProject() {
    if (!confirm(`¿Eliminar el proyecto «${data?.project.name}»? Los inversores perderán el acceso inmediatamente.`)) return;
    setBusy(true);
    const res = await fetchJson(`/api/dataroom/admin/projects/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (res.ok) router.push('/dataroom/admin/projects');
    else setMsg(`Error: ${res.error}`);
  }

  if (error) return <ErrorBox message="Proyecto no encontrado." />;
  if (!data) return <Spinner label="Cargando proyecto…" />;

  const p = data.project;
  const activeInvestors = data.investors.filter((i) => i.access.status === 'active');
  const publishedDocs = data.documents.filter((d) => d.status === 'published');
  const hasNda = data.ndaVersions.some((v) => v.active);

  // Pasos del flujo de puesta en marcha
  const steps = [
    ...(p.ndaRequired ? [{ label: 'Publicar el NDA global', done: hasNda, action: () => router.push('/dataroom/admin/nda'), cta: 'Ir al NDA' }] : []),
    { label: 'Asignar inversores', done: activeInvestors.length > 0, cta: 'Abajo ↓' },
    { label: 'Subir y publicar documentos', done: publishedDocs.length > 0, cta: 'Abajo ↓' },
    { label: 'Activar el proyecto', done: p.status === 'active', action: () => patch({ action: 'update', data: { status: 'active' } }, 'Proyecto activado.'), cta: 'Activar' },
  ];
  const setupPending = steps.some((s) => !s.done);

  const section = 'border border-[#1c3742]/10 bg-white p-5 shadow-sm';
  const h = 'mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50';
  const btn = 'border border-[#1c3742]/30 px-3 py-1.5 text-xs hover:bg-[#1c3742]/5 disabled:opacity-40';

  return (
    <div className="space-y-6">
      <Link href="/dataroom/admin/projects" className="text-xs text-[#1c3742]/50 hover:text-[#1c3742]">← Proyectos</Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-playfair text-2xl">{p.name}</h1>
        <Badge value={p.status} />
        <select
          value={p.status}
          disabled={busy}
          onChange={(e) => patch({ action: 'update', data: { status: e.target.value } }, 'Estado actualizado.')}
          className="border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-1 text-xs"
        >
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>)}
        </select>
        <button
          onClick={deleteProject}
          disabled={busy}
          className="ml-auto border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-40"
        >
          Eliminar proyecto
        </button>
      </div>
      {msg && <p className="text-sm font-medium text-[#8a5a33]">{msg}</p>}

      {/* Flujo guiado de puesta en marcha */}
      {setupPending && (
        <div className="border border-[#c08552]/40 bg-[#c08552]/10 p-5">
          <p className="text-sm font-semibold text-[#1c3742]">Puesta en marcha del proyecto</p>
          <p className="mt-1 text-xs text-[#1c3742]/60">
            Los inversores solo verán el proyecto cuando esté <strong>Activo</strong>, tenga inversores asignados y documentos publicados.
          </p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={i} className={`flex items-center gap-3 border p-3 text-sm ${s.done ? 'border-[#1c3742]/30 bg-[#1c3742]/5' : 'border-[#1c3742]/15 bg-white'}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold ${s.done ? 'bg-[#1c3742] text-[#e6e2d7]' : 'bg-[#1c3742]/10 text-[#1c3742]'}`}>
                  {s.done ? '✓' : i + 1}
                </span>
                <span className={s.done ? 'text-[#1c3742] font-medium' : 'text-[#1c3742]'}>{s.label}</span>
                {!s.done && s.action && (
                  <button onClick={s.action} className="ml-auto shrink-0 bg-[#1c3742] px-2.5 py-1 text-[11px] font-semibold text-[#e6e2d7]">
                    {s.cta}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 1. Inversores — asignación directa desde el proyecto */}
      <section className={section}>
        <h2 className={h}>Inversores con acceso ({activeInvestors.length})</h2>
        <AssignInvestor
          projectId={id}
          allInvestors={allInvestors}
          assigned={data.investors}
          onChanged={load}
          onError={(e) => setMsg(`Error: ${e}`)}
        />
        {data.investors.length === 0 ? (
          <p className="mt-3 text-sm text-[#1c3742]/50">
            Nadie tiene acceso todavía. Asigne el primer inversor con el selector de arriba.
          </p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {data.investors.map((i) => (
              <li key={i.investorId} className="flex items-center justify-between gap-2 bg-[#faf9f5] px-3 py-2">
                <Link href={`/dataroom/admin/investors/${i.investorId}`} className="hover:underline">
                  {[i.firstName, i.lastName].filter(Boolean).join(' ') || i.email}
                  <span className="ml-2 text-xs text-[#1c3742]/40">
                    {STATUS_LABELS[i.access.accessLevel] ?? i.access.accessLevel} · desde {formatDate(i.access.grantedAt)}
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                  <Badge value={i.access.status} />
                  {i.access.status === 'active' && (
                    <button
                      onClick={async () => {
                        if (!confirm('¿Retirar el acceso? Es inmediato.')) return;
                        const res = await fetchJson(`/api/dataroom/admin/investors/${i.investorId}/projects`, {
                          method: 'DELETE', body: JSON.stringify({ projectId: id, notify: true }),
                        });
                        if (res.ok) load();
                      }}
                      className="text-xs text-red-700 hover:underline"
                    >
                      Revocar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 2. NDA (global, común a todo el portal) */}
      <section className={section}>
        <h2 className={h}>NDA</h2>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2 text-xs text-[#1c3742]/70">
            <input
              type="checkbox"
              checked={p.ndaRequired}
              disabled={busy}
              onChange={(e) => patch({ action: 'update', data: { ndaRequired: e.target.checked } }, 'NDA actualizado.')}
            />
            Este proyecto requiere el NDA del portal
          </label>
          {p.ndaRequired && (
            <span className="text-xs text-[#1c3742]/50">
              {hasNda
                ? `NDA global publicado · ${data.signatures.filter((s) => s.status === 'signed').length} firma(s) en este proyecto`
                : 'El NDA global aún no está publicado'}
            </span>
          )}
          <Link href="/dataroom/admin/nda" className="ml-auto text-xs text-[#1c3742]/70 underline hover:text-[#1c3742]">
            Gestionar el NDA del portal →
          </Link>
        </div>
        {p.ndaRequired && !hasNda && (
          <p className="mt-2 border border-[#c08552]/40 bg-[#c08552]/10 p-3 text-xs text-[#8a5a33]">
            Sin NDA publicado, los inversores no podrán desbloquear la documentación confidencial.
          </p>
        )}
      </section>

      {/* 3. Documentos */}
      <UploadPanel projectId={id} categories={data.categories} investors={activeInvestors} onUploaded={load} />

      <section className={section}>
        <h2 className={h}>Documentos ({data.documents.length})</h2>
        {data.documents.length === 0 ? (
          <p className="text-sm text-[#1c3742]/50">Todavía no hay documentos. Súbalos con el panel de arriba.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1c3742]/15 text-left text-[11px] uppercase tracking-wider text-[#1c3742]/50">
                  <th className="px-3 py-2">Título</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Nivel</th>
                  <th className="px-3 py-2">NDA</th>
                  <th className="px-3 py-2">Descarga</th>
                  <th className="px-3 py-2">Actualizado</th>
                  <th className="px-3 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.documents.map((d) => (
                  <tr key={d.id} className="border-b border-[#1c3742]/10 last:border-0">
                    <td className="px-3 py-2">{d.title}</td>
                    <td className="px-3 py-2"><Badge value={d.status} /></td>
                    <td className="px-3 py-2"><Badge value={d.confidentiality} /></td>
                    <td className="px-3 py-2 text-xs">{d.requiresNda ? 'Sí' : 'No'}</td>
                    <td className="px-3 py-2 text-xs">{d.downloadable ? 'Sí' : 'Solo vista'}</td>
                    <td className="px-3 py-2 text-[#1c3742]/60">{formatDate(d.updatedAt)}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        {d.status === 'draft' && <button className={btn} onClick={() => docAction(d.id, 'publish')}>Publicar</button>}
                        {d.status === 'published' && (
                          <>
                            <button className={btn} onClick={() => docAction(d.id, 'notify')}>Notificar</button>
                            <NewVersionButton docId={d.id} onDone={load} />
                            <button className={btn} onClick={() => confirm('¿Archivar documento? Dejará de ser visible.') && docAction(d.id, 'archive')}>Archivar</button>
                          </>
                        )}
                        {d.status === 'archived' && <button className={btn} onClick={() => docAction(d.id, 'publish')}>Republicar</button>}
                        <button
                          className="border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                          onClick={() => deleteDoc(d.id, d.title)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={section}>
        <h2 className={h}>Actividad</h2>
        <ul className="space-y-1 text-xs text-[#1c3742]/70">
          {data.activity.map((a) => (
            <li key={a.id}>
              {formatDate(a.createdAt)} — {actionLabel(a.action)}
              {a.actorEmail ? ` · ${a.actorEmail}` : ''}
              {a.result !== 'success' && <span className="text-red-700"> (denegado)</span>}
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}

/** Selector para conceder acceso directamente desde la página del proyecto. */
function AssignInvestor({ projectId, allInvestors, assigned, onChanged, onError }: {
  projectId: string;
  allInvestors: InvestorOption[];
  assigned: Detail['investors'];
  onChanged: () => void;
  onError: (e: string) => void;
}) {
  const [investorId, setInvestorId] = useState('');
  const [level, setLevel] = useState<'full' | 'generic'>('full');
  const [busy, setBusy] = useState(false);

  const assignedActive = new Set(assigned.filter((a) => a.access.status === 'active').map((a) => a.investorId));
  const options = allInvestors.filter((i) => !assignedActive.has(i.id));

  async function grant() {
    if (!investorId) return;
    setBusy(true);
    const res = await fetchJson(`/api/dataroom/admin/investors/${investorId}/projects`, {
      method: 'POST', body: JSON.stringify({ projectId, accessLevel: level, notify: true }),
    });
    setBusy(false);
    if (res.ok) { setInvestorId(''); onChanged(); } else onError(res.error ?? 'grant_failed');
  }

  if (allInvestors.length === 0) {
    return (
      <p className="border border-[#c08552]/40 bg-[#c08552]/10 p-3 text-xs text-[#8a5a33]">
        Todavía no hay inversores dados de alta. Créelos primero en la pestaña{' '}
        <Link href="/dataroom/admin/investors" className="underline">Inversores</Link>.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={investorId} onChange={(e) => setInvestorId(e.target.value)}
        className="min-w-56 flex-1 border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-2 text-sm sm:flex-none">
        <option value="">Añadir inversor al proyecto…</option>
        {options.map((i) => (
          <option key={i.id} value={i.id}>
            {[i.firstName, i.lastName].filter(Boolean).join(' ') || i.email} ({i.email}) — {STATUS_LABELS[i.status] ?? i.status}
          </option>
        ))}
      </select>
      <select value={level} onChange={(e) => setLevel(e.target.value as 'full' | 'generic')}
        className="border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-2 text-sm">
        <option value="full">Acceso completo</option>
        <option value="generic">Solo documentación general</option>
      </select>
      <button onClick={grant} disabled={!investorId || busy}
        className="bg-[#1c3742] px-4 py-2 text-sm font-semibold text-[#e6e2d7] disabled:opacity-40">
        {busy ? 'Asignando…' : 'Dar acceso'}
      </button>
    </div>
  );
}

function UploadPanel({ projectId, categories, investors, onUploaded }: {
  projectId: string;
  categories: { id: string; name: string }[];
  investors: Detail['investors'];
  onUploaded: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [meta, setMeta] = useState({
    categoryId: '', confidentiality: 'sensitive', downloadable: true, requiresNda: true,
    publish: true, notify: false, restrict: false,
  });
  const [selectedInvestors, setSelectedInvestors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function upload() {
    if (files.length === 0) return;
    setBusy(true);
    setResult(null);
    const form = new FormData();
    for (const f of files) form.append('files', f);
    form.append('meta', JSON.stringify({
      categoryId: meta.categoryId || undefined,
      confidentiality: meta.confidentiality,
      downloadable: meta.downloadable,
      requiresNda: meta.requiresNda,
      publish: meta.publish,
      notify: meta.notify,
      restrictToInvestorIds: meta.restrict && selectedInvestors.length ? selectedInvestors : undefined,
    }));
    try {
      const res = await fetch(`/api/dataroom/admin/projects/${projectId}/documents`, { method: 'POST', body: form });
      const body = await res.json().catch(() => null);
      if (res.ok && body) {
        const ok = body.results.filter((r: { ok: boolean }) => r.ok).length;
        const failed = body.results.filter((r: { ok: boolean }) => !r.ok);
        setResult(`${ok} archivo(s) subido(s)${failed.length ? ` · ${failed.length} con error (${failed.map((f: { error: string }) => f.error).join(', ')})` : ''}${body.notified ? ` · ${body.notified} inversor(es) notificado(s)` : ''}`);
        setFiles([]);
        if (fileRef.current) fileRef.current.value = '';
        onUploaded();
      } else {
        setResult(`Error: ${body?.error ?? res.status}`);
      }
    } catch {
      setResult('Error de red durante la subida.');
    }
    setBusy(false);
  }

  const check = 'flex items-center gap-2 text-xs text-[#1c3742]/70';
  return (
    <section className="border border-[#1c3742]/10 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50">Subir documentos</h2>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.pptx,.csv,.png,.jpg,.jpeg,.webp"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="text-xs file:mr-3 file:border-0 file:bg-[#1c3742] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#e6e2d7]"
        />
        <select value={meta.categoryId} onChange={(e) => setMeta({ ...meta, categoryId: e.target.value })}
          className="border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-1.5 text-xs">
          <option value="">Categoría…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={meta.confidentiality} onChange={(e) => setMeta({ ...meta, confidentiality: e.target.value, requiresNda: e.target.value === 'sensitive' })}
          className="border border-[#1c3742]/25 bg-[#faf9f5] px-2 py-1.5 text-xs">
          <option value="sensitive">Confidencial</option>
          <option value="generic">General</option>
        </select>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        <label className={check}><input type="checkbox" checked={meta.requiresNda} onChange={(e) => setMeta({ ...meta, requiresNda: e.target.checked })} />Requiere NDA</label>
        <label className={check}><input type="checkbox" checked={meta.downloadable} onChange={(e) => setMeta({ ...meta, downloadable: e.target.checked })} />Descargable</label>
        <label className={check}><input type="checkbox" checked={meta.publish} onChange={(e) => setMeta({ ...meta, publish: e.target.checked })} />Publicar ya</label>
        <label className={check}><input type="checkbox" checked={meta.notify} onChange={(e) => setMeta({ ...meta, notify: e.target.checked })} />Notificar a inversores (email agrupado)</label>
        <label className={check}><input type="checkbox" checked={meta.restrict} onChange={(e) => setMeta({ ...meta, restrict: e.target.checked })} />Solo inversores concretos</label>
      </div>
      {meta.restrict && (
        investors.length === 0 ? (
          <p className="mt-2 border border-[#c08552]/40 bg-[#c08552]/10 p-3 text-xs text-[#8a5a33]">
            Este proyecto aún no tiene inversores asignados: primero dé acceso a algún inversor
            (panel «Inversores con acceso») y luego podrá restringir documentos a personas concretas.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-3 bg-[#faf9f5] p-3">
            {investors.map((i) => (
              <label key={i.investorId} className={check}>
                <input
                  type="checkbox"
                  checked={selectedInvestors.includes(i.investorId)}
                  onChange={(e) =>
                    setSelectedInvestors((prev) =>
                      e.target.checked ? [...prev, i.investorId] : prev.filter((x) => x !== i.investorId),
                    )
                  }
                />
                {[i.firstName, i.lastName].filter(Boolean).join(' ') || i.email}
              </label>
            ))}
          </div>
        )
      )}
      {files.length > 0 && (
        <p className="mt-2 text-xs text-[#1c3742]/60">
          {files.length} archivo(s): {files.map((f) => `${f.name} (${formatBytes(f.size)})`).join(', ')}
        </p>
      )}
      {result && <p className="mt-2 text-xs font-medium text-[#8a5a33]">{result}</p>}
      <button onClick={upload} disabled={busy || files.length === 0}
        className="mt-3 bg-[#1c3742] px-4 py-2 text-sm font-semibold text-[#e6e2d7] disabled:opacity-40">
        {busy ? 'Subiendo…' : 'Subir'}
      </button>
    </section>
  );
}

function NewVersionButton({ docId, onDone }: { docId: string; onDone: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const form = new FormData();
    form.append('file', file);
    form.append('publish', 'true');
    form.append('comment', 'Nueva versión');
    await fetch(`/api/dataroom/admin/documents/${docId}`, { method: 'POST', body: form });
    setBusy(false);
    if (ref.current) ref.current.value = '';
    onDone();
  }

  return (
    <>
      <input ref={ref} type="file" hidden onChange={onFile} accept=".pdf,.docx,.xlsx,.pptx,.csv,.png,.jpg,.jpeg,.webp" />
      <button
        onClick={() => ref.current?.click()}
        disabled={busy}
        className="border border-[#1c3742]/30 px-3 py-1.5 text-xs hover:bg-[#1c3742]/5 disabled:opacity-40"
      >
        {busy ? 'Subiendo…' : 'Nueva versión'}
      </button>
    </>
  );
}

