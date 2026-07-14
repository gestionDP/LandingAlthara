'use client';

/** Admin — NDA global: un único acuerdo para todo el portal. */
import { useCallback, useEffect, useState } from 'react';
import { fetchJson, Spinner, ErrorBox, Badge, formatDate } from '../../components/ui';

interface NdaData {
  versions: { id: string; version: number; title: string; bodyText: string; active: boolean; createdAt: string }[];
  signatures: { id: string; status: string; signedAt: string; signerFullName: string; email: string; version: number }[];
}

export default function AdminNda() {
  const [data, setData] = useState<NdaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('Acuerdo de confidencialidad');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetchJson<NdaData>('/api/dataroom/admin/nda');
    if (res.ok && res.data) {
      setData(res.data);
      const active = res.data.versions.find((v) => v.active);
      if (active) { setTitle(active.title); setBody(active.bodyText); }
    } else setError(res.error ?? 'error');
  }, []);

  useEffect(() => { load(); }, [load]);

  async function publish() {
    setBusy(true);
    setMsg(null);
    const res = await fetchJson('/api/dataroom/admin/nda', {
      method: 'POST', body: JSON.stringify({ title: title.trim(), bodyText: body.trim() }),
    });
    setBusy(false);
    if (res.ok) { setMsg('Nueva versión publicada.'); setEditing(false); load(); }
    else setMsg(`Error: ${res.error}`);
  }

  if (error) return <ErrorBox message="No se ha podido cargar el NDA." onRetry={load} />;
  if (!data) return <Spinner label="Cargando NDA…" />;

  const active = data.versions.find((v) => v.active);
  const section = 'border border-[#1c3742]/10 bg-white p-5 rounded-lg';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl">NDA del portal</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#1c3742]/60">
          Un único acuerdo de confidencialidad para todos los proyectos. Los inversores lo firman
          una sola vez y desbloquea la documentación confidencial de todos los proyectos que lo requieran.
        </p>
      </div>
      {msg && <p className="text-sm font-medium text-[#8a5a33]">{msg}</p>}

      <section className={section}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50">
            {active ? `Versión activa: v${active.version} · ${formatDate(active.createdAt)}` : 'Sin NDA publicado todavía'}
          </h2>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="bg-[#1c3742] px-4 py-2 text-sm font-semibold text-[#e6e2d7] rounded-md">
              {active ? 'Editar y publicar nueva versión' : 'Crear el NDA'}
            </button>
          )}
        </div>

        {!active && !editing && (
          <p className="mt-3 border border-[#c08552]/40 bg-[#c08552]/10 p-3 text-xs text-[#8a5a33] rounded-md">
            Mientras no exista un NDA publicado, los inversores no podrán desbloquear documentación confidencial.
          </p>
        )}

        {editing ? (
          <div className="mt-4 space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#1c3742]/25 bg-[#faf9f5] px-3 py-2 text-sm rounded-md" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={16}
              placeholder="Texto completo del acuerdo (mínimo 50 caracteres)…"
              className="w-full border border-[#1c3742]/25 bg-[#faf9f5] px-3 py-2 text-xs leading-relaxed rounded-md" />
            <p className="text-xs text-[#8a5a33]">
              Al publicar, la versión anterior queda inactiva. Según la política de cada proyecto,
              los inversores pueden tener que firmar de nuevo.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditing(false)} className="border border-[#1c3742]/30 px-4 py-2 text-sm rounded-md">Cancelar</button>
              <button onClick={publish} disabled={busy || body.trim().length < 50 || title.trim().length < 2}
                className="bg-[#1c3742] px-5 py-2 text-sm font-semibold text-[#e6e2d7] disabled:opacity-40 rounded-md">
                {busy ? 'Publicando…' : 'Publicar versión'}
              </button>
            </div>
          </div>
        ) : active ? (
          <pre className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap bg-[#faf9f5] p-4 font-montserrat text-xs leading-relaxed text-[#1c3742]/80 rounded-md">
            {active.bodyText}
          </pre>
        ) : null}
      </section>

      <section className={section}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50">
          Firmas ({data.signatures.filter((s) => s.status === 'signed').length})
        </h2>
        {data.signatures.length === 0 ? (
          <p className="text-sm text-[#1c3742]/50">Nadie ha firmado todavía.</p>
        ) : (
          <ul className="max-h-72 space-y-1 overflow-auto pr-1 text-sm">
            {data.signatures.map((s) => (
              <li key={s.id} className="flex items-center justify-between bg-[#faf9f5] px-3 py-2 rounded-md">
                <span>{s.signerFullName} <span className="text-xs text-[#1c3742]/40">· {s.email} · v{s.version} · {formatDate(s.signedAt)}</span></span>
                <Badge value={s.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={section}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c3742]/50">Historial de versiones</h2>
        <ul className="space-y-1 text-sm">
          {data.versions.map((v) => (
            <li key={v.id} className="flex items-center justify-between bg-[#faf9f5] px-3 py-2 rounded-md">
              <span className="text-xs">v{v.version} — {v.title} · {formatDate(v.createdAt)}</span>
              {v.active && <Badge value="active" />}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
