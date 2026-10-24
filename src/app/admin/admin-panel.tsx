"use client";
import { useEffect, useState } from "react";

/**
 * Minimal admin UI. Gated server-side by the ADMIN_KEYS env var; this
 * client just reads row counts and shows the store provider in use.
 */
export function AdminPanel() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [provider, setProvider] = useState<string>("");
  const [err, setErr] = useState("");
  const [key, setKey] = useState("");

  const load = async () => {
    setErr("");
    const res = await fetch("/api/admin", {
      headers: { "X-Admin-Key": key },
    });
    if (res.status === 403) {
      setErr("Admin key missing or invalid. Set ADMIN_KEYS in your environment and pass it in X-Admin-Key.");
      return;
    }
    if (!res.ok) { setErr("Request failed"); return; }
    const data = await res.json();
    setCounts(data.counts);
    setProvider(data.provider);
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, []);

  return (
    <div className="min-h-screen bg-[#082336] text-slate-100">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-2">Admin</h1>
        <p className="text-slate-400 mb-8">Store row counts and provider. This page is behind the X-Admin-Key check.</p>

        <div className="glass rounded-2xl p-6 border border-teal-500/20 mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Admin key</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="From ADMIN_KEYS env var"
              className="input-glass flex-1 px-4 py-3 rounded-xl text-sm"
            />
            <button onClick={load} className="btn-primary px-4 py-3 rounded-xl text-sm font-medium">
              Load
            </button>
          </div>
          {err && <p className="text-amber-400 text-sm mt-3">{err}</p>}
        </div>

        {counts && (
          <div className="glass rounded-2xl p-6 border border-slate-700/50">
            <p className="text-sm text-slate-400 mb-4">Active store provider: <span className="text-teal-300 font-medium">{provider}</span></p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(counts).map(([t, n]) => (
                <div key={t} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-2xl font-bold text-white">{n}</p>
                  <p className="text-sm text-slate-400">{t}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
