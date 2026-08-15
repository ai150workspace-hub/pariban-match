"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StatusAdatBadge } from "@/components/ui/status-adat-badge";

interface PesertaData {
  kode: string;
  nama: string;
  inisial: string;
  gender: string;
  marga: string;
  margaIbu: string;
  kota: string;
  tahunLahir: number;
  email: string;
  suku: string;
  foto?: string;
  premium?: boolean;
}

interface TopMatch {
  nama: string;
  marga: string;
  skor: number;
  status: "AMAN" | "PARIBAN" | "PERLU_DICEK" | "DIBLOKIR";
  label: string;
  saling: boolean;
}

interface HasilPeserta {
  kode: string;
  nama: string;
  gender: string;
  marga: string;
  top3: TopMatch[];
}

interface MatchingResult {
  totalPeserta: number;
  totalPasangan: number;
  diblokir: number;
  hasil: HasilPeserta[];
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Password salah");
        return;
      }
      sessionStorage.setItem("admin_auth", "1");
      onSuccess();
    } catch {
      setError("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xl font-bold tracking-[0.15em] text-primary mb-1">PARIBAN</p>
          <h1 className="font-heading text-2xl font-bold text-foreground">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Masukkan password untuk melanjutkan</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password admin"
            required
            autoFocus
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [peserta, setPeserta] = useState<PesertaData[]>([]);
  const [matching, setMatching] = useState<MatchingResult | null>(null);
  const [laporan, setLaporan] = useState<{ id: string; peserta_a: string; peserta_b: string; alasan_laporan: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"peserta" | "matching" | "laporan">("peserta");
  const [togglingKode, setTogglingKode] = useState<string | null>(null);

  useEffect(() => {
    const ok = sessionStorage.getItem("admin_auth") === "1";
    setAuthed(ok);
    setCheckingAuth(false);
  }, []);

  const fetchPeserta = useCallback(async () => {
    const res = await fetch("/api/peserta");
    const data = await res.json();
    setPeserta(data.peserta || []);
  }, []);

  const fetchLaporan = useCallback(async () => {
    const res = await fetch("/api/admin/laporan");
    const data = await res.json();
    setLaporan(data.laporan || []);
  }, []);

  async function togglePremium(kode: string, current: boolean) {
    setTogglingKode(kode);
    try {
      await fetch(`/api/peserta/${kode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ premium: !current }),
      });
      setPeserta((prev) =>
        prev.map((p) => (p.kode === kode ? { ...p, premium: !current } : p)),
      );
    } finally {
      setTogglingKode(null);
    }
  }

  const fetchMatching = useCallback(async () => {
    const res = await fetch("/api/matching");
    const data = await res.json();
    setMatching(data);
  }, []);

  useEffect(() => {
    fetchPeserta();
    fetchLaporan();
    fetchMatching();
  }, [fetchPeserta, fetchLaporan, fetchMatching]);

  async function selesaikanLaporan(id: string) {
    await fetch("/api/admin/laporan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setLaporan((prev) => prev.filter((l) => l.id !== id));
  }

  async function runMatching() {
    setLoading(true);
    try {
      const res = await fetch("/api/matching");
      const data = await res.json();
      setMatching(data);
    } finally {
      setLoading(false);
    }
  }

  const tahunSekarang = new Date().getFullYear();

  if (checkingAuth) return null;
  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-[0.15em] text-primary"
          >
            PARIBAN
          </Link>
          <span className="rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            ADMIN
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Dashboard Admin
          </h1>
          <p className="mt-1 text-muted-foreground">
            Kelola peserta dan jalankan pencocokan adat
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Total Peserta</p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {peserta.length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Total Pasangan</p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {matching?.totalPasangan ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Diblokir Adat</p>
            <p className="mt-1 text-3xl font-bold text-adat-blokir">
              {matching?.diblokir ?? "—"}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setTab("peserta")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "peserta"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            Daftar Peserta
          </button>
          <button
            type="button"
            onClick={() => { if (matching) setTab("matching"); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "matching"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            Hasil Matching
          </button>
          <button
            type="button"
            onClick={() => setTab("laporan")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors relative ${
              tab === "laporan"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            Laporan
            {laporan.length > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-adat-blokir text-[10px] font-bold text-white">
                {laporan.length}
              </span>
            )}
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={runMatching}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-secondary border border-border px-5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {loading ? "Memuat..." : "↻ Refresh Data"}
          </button>
        </div>

        {/* Peserta Tab */}
        {tab === "peserta" && (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            {peserta.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                Belum ada peserta terdaftar.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Kode
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Nama
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Gender
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Marga
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Usia
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Kota
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Suku
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Foto
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Premium
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Hasil
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {peserta.map((p) => (
                    <tr
                      key={p.kode}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-primary">
                        {p.kode}
                      </td>
                      <td className="px-4 py-3 font-medium">{p.inisial}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.gender === "Perempuan" ? "♀" : "♂"} {p.gender}
                      </td>
                      <td className="px-4 py-3">{p.marga}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {tahunSekarang - p.tahunLahir}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.kota}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.suku}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.foto ? (
                          <img
                            src={`/api/photos/${p.kode}`}
                            alt={p.inisial}
                            className="h-8 w-8 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => togglePremium(p.kode, p.premium ?? false)}
                          disabled={togglingKode === p.kode}
                          className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors ${
                            p.premium
                              ? "bg-accent/15 text-accent hover:bg-accent/25 border border-accent/30"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {togglingKode === p.kode
                            ? "..."
                            : p.premium
                            ? "★ Premium"
                            : "Gratis"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/hasil/${p.kode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Lihat →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Laporan Tab */}
        {tab === "laporan" && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {laporan.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                Tidak ada laporan aktif saat ini.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left font-semibold">Peserta A</th>
                    <th className="px-4 py-3 text-left font-semibold">Peserta B</th>
                    <th className="px-4 py-3 text-left font-semibold">Alasan</th>
                    <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                    <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {laporan.map((l) => (
                    <tr key={l.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{l.peserta_a}</td>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{l.peserta_b}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs">{l.alasan_laporan}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(l.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => selesaikanLaporan(l.id)}
                          className="rounded-lg bg-adat-aman/15 px-3 py-1 text-xs font-medium text-adat-aman hover:bg-adat-aman/25 transition-colors"
                        >
                          Selesaikan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Matching Tab */}
        {tab === "matching" && matching && (
          <div className="space-y-6">
            {matching.hasil.map((h) => (
              <div
                key={h.kode}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-xs text-primary">
                    {h.kode}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">
                    {h.nama}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {h.gender === "Perempuan" ? "♀" : "♂"} · {h.marga}
                  </span>
                </div>

                {h.top3.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada pasangan yang memenuhi syarat.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {h.top3.map((m, i) => (
                      <div
                        key={`${h.kode}-${i}`}
                        className={`rounded-xl border p-5 ${
                          m.saling
                            ? "border-accent/40 bg-accent/5"
                            : "border-border bg-secondary/20"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Peringkat {i + 1}
                          </span>
                          {m.saling && (
                            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                              SALING ♥
                            </span>
                          )}
                        </div>
                        <p className="text-base font-semibold text-foreground">
                          {m.nama}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {m.marga}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <StatusAdatBadge
                            status={m.status}
                            size="sm"
                          />
                          <span className="text-xl font-bold text-primary">
                            {m.skor}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {m.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
