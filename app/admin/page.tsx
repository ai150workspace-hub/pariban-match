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
  banned?: boolean;
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

interface LaporanItem {
  id: string;
  peserta_a: string;
  peserta_b: string;
  pelapor_kode?: string;
  alasan_laporan: string;
  created_at: string;
}

interface Stats {
  totalPremium: number;
  totalPemasukan: number;
  totalBanned: number;
  totalLaporan: number;
  abandoned: number;
}

interface Demografi {
  total: number;
  genderRatio: { pria: number; wanita: number };
  usiaDist: Record<string, number>;
  topPekerjaan: { label: string; count: number }[];
  topPendidikan: { label: string; count: number }[];
}

// ─── Bar chart sederhana ──────────────────────────────────────────────
function MiniBar({ label, count, max, color = "bg-primary" }: { label: string; count: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-xs text-muted-foreground truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-xs font-semibold text-foreground">{count}</span>
    </div>
  );
}

function DemografiWidget({ d }: { d: Demografi }) {
  const total = d.total || 1;
  const priaPct = Math.round((d.genderRatio.pria / total) * 100);
  const wanitaPct = 100 - priaPct;
  const maxUsia = Math.max(...Object.values(d.usiaDist), 1);
  const maxKerja = d.topPekerjaan[0]?.count ?? 1;
  const maxDidik = d.topPendidikan[0]?.count ?? 1;

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2">
      {/* Rasio Gender */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Rasio Gender</h3>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl font-bold text-primary">{d.genderRatio.pria}</span>
          <span className="text-sm text-muted-foreground">Pria</span>
          <span className="ml-auto text-2xl font-bold text-accent">{d.genderRatio.wanita}</span>
          <span className="text-sm text-muted-foreground">Wanita</span>
        </div>
        <div className="h-4 rounded-full overflow-hidden flex">
          <div className="bg-primary transition-all h-full" style={{ width: `${priaPct}%` }} title={`Pria ${priaPct}%`} />
          <div className="bg-accent transition-all h-full flex-1" title={`Wanita ${wanitaPct}%`} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Pria {priaPct}%</span>
          <span>Wanita {wanitaPct}%</span>
        </div>
      </div>

      {/* Distribusi Usia */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Distribusi Usia</h3>
        <div className="space-y-2.5">
          {Object.entries(d.usiaDist).map(([range, count]) => (
            <MiniBar key={range} label={range + " thn"} count={count} max={maxUsia} color="bg-accent" />
          ))}
        </div>
      </div>

      {/* Top Pekerjaan */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Top Status Kerja</h3>
        <div className="space-y-2.5">
          {d.topPekerjaan.map((item) => (
            <MiniBar key={item.label} label={item.label} count={item.count} max={maxKerja} color="bg-primary" />
          ))}
          {d.topPekerjaan.length === 0 && <p className="text-xs text-muted-foreground">Belum ada data</p>}
        </div>
      </div>

      {/* Pendidikan */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Distribusi Pendidikan</h3>
        <div className="space-y-2.5">
          {d.topPendidikan.map((item) => (
            <MiniBar key={item.label} label={item.label} count={item.count} max={maxDidik} color="bg-primary/70" />
          ))}
          {d.topPendidikan.length === 0 && <p className="text-xs text-muted-foreground">Belum ada data</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────
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
        setError((await res.json()).error || "Password salah");
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
          {error && <p className="text-sm text-red-600">{error}</p>}
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

// ─── Main Dashboard ───────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [peserta, setPeserta] = useState<PesertaData[]>([]);
  const [matching, setMatching] = useState<MatchingResult | null>(null);
  const [laporan, setLaporan] = useState<LaporanItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [demografi, setDemografi] = useState<Demografi | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"peserta" | "matching" | "laporan">("peserta");
  const [togglingKode, setTogglingKode] = useState<string | null>(null);
  const [banningKode, setBanningKode] = useState<string | null>(null);

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

  const fetchMatching = useCallback(async () => {
    const res = await fetch("/api/matching");
    const data = await res.json();
    setMatching(data);
  }, []);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    const data = await res.json();
    setStats(data);
  }, []);

  const fetchDemografi = useCallback(async () => {
    const res = await fetch("/api/admin/demografi");
    const data = await res.json();
    setDemografi(data);
  }, []);

  useEffect(() => {
    fetchPeserta();
    fetchLaporan();
    fetchMatching();
    fetchStats();
    fetchDemografi();
  }, [fetchPeserta, fetchLaporan, fetchMatching, fetchStats, fetchDemografi]);

  async function togglePremium(kode: string, current: boolean) {
    setTogglingKode(kode);
    try {
      await fetch(`/api/peserta/${kode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ premium: !current }),
      });
      setPeserta((prev) => prev.map((p) => (p.kode === kode ? { ...p, premium: !current } : p)));
    } finally {
      setTogglingKode(null);
    }
  }

  async function toggleBan(kode: string, current: boolean) {
    const konfirmasi = current
      ? `Buka blokir akun ${kode}?`
      : `Blokir akun ${kode}? Peserta tidak bisa login.`;
    if (!confirm(konfirmasi)) return;
    setBanningKode(kode);
    try {
      const res = await fetch(`/api/admin/ban/${kode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !current }),
      });
      if (res.ok) {
        setPeserta((prev) => prev.map((p) => (p.kode === kode ? { ...p, banned: !current } : p)));
        await fetchStats();
      }
    } finally {
      setBanningKode(null);
    }
  }

  async function selesaikanLaporan(id: string) {
    await fetch("/api/admin/laporan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setLaporan((prev) => prev.filter((l) => l.id !== id));
    await fetchStats();
  }

  async function refreshAll() {
    setLoading(true);
    try {
      await Promise.all([fetchPeserta(), fetchLaporan(), fetchMatching(), fetchStats(), fetchDemografi()]);
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
          <Link href="/" className="text-xl font-bold tracking-[0.15em] text-primary">PARIBAN</Link>
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">ADMIN</span>
            <button
              onClick={() => { sessionStorage.removeItem("admin_auth"); setAuthed(false); }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard Admin</h1>
          <p className="mt-1 text-muted-foreground">Kelola peserta, pantau laporan, dan analitik demografi</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Total Peserta</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{peserta.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Total Pasangan</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{matching?.totalPasangan ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Total Premium</p>
            <p className="mt-1 text-3xl font-bold text-accent">{stats?.totalPremium ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Total Pemasukan</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {stats ? `Rp ${stats.totalPemasukan.toLocaleString("id-ID")}` : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Diblokir Adat</p>
            <p className="mt-1 text-3xl font-bold text-adat-blokir">{matching?.diblokir ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Daftar Tidak Selesai</p>
            <p className="mt-1 text-3xl font-bold text-orange-500">{stats?.abandoned ?? "—"}</p>
            {stats && stats.abandoned > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">dari {stats.abandoned + peserta.length} mulai daftar</p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Akun Diblokir</p>
            <p className="mt-1 text-3xl font-bold text-red-600">{stats?.totalBanned ?? "—"}</p>
          </div>
          <div
            className={`rounded-xl border bg-card p-5 cursor-pointer transition-colors ${laporan.length > 0 ? "border-red-300 bg-red-50/50 dark:bg-red-900/10" : "border-border"}`}
            onClick={() => setTab("laporan")}
          >
            <p className="text-sm text-muted-foreground">Laporan Masuk</p>
            <p className={`mt-1 text-3xl font-bold ${laporan.length > 0 ? "text-red-600" : "text-foreground"}`}>
              {stats?.totalLaporan ?? laporan.length}
            </p>
            {laporan.length > 0 && <p className="mt-1 text-xs text-red-500 font-medium">Perlu ditindaklanjuti</p>}
          </div>
        </div>

        {/* Demographics Widget */}
        {demografi && demografi.total > 0 && <DemografiWidget d={demografi} />}

        {/* Action Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setTab("peserta")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "peserta" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
            Daftar Peserta
          </button>
          <button type="button" onClick={() => { if (matching) setTab("matching"); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "matching" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
            Hasil Matching
          </button>
          <button type="button" onClick={() => setTab("laporan")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors relative ${tab === "laporan" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
            Laporan Peserta
            {laporan.length > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {laporan.length}
              </span>
            )}
          </button>
          <div className="flex-1" />
          <button type="button" onClick={refreshAll} disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-secondary border border-border px-5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50">
            {loading ? "Memuat..." : "↻ Refresh Data"}
          </button>
        </div>

        {/* ── Tab: Daftar Peserta ── */}
        {tab === "peserta" && (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            {peserta.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">Belum ada peserta terdaftar.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left font-semibold">Kode</th>
                    <th className="px-4 py-3 text-left font-semibold">Nama</th>
                    <th className="px-4 py-3 text-left font-semibold">Gender</th>
                    <th className="px-4 py-3 text-left font-semibold">Marga</th>
                    <th className="px-4 py-3 text-left font-semibold">Usia</th>
                    <th className="px-4 py-3 text-left font-semibold">Kota</th>
                    <th className="px-4 py-3 text-left font-semibold">Suku</th>
                    <th className="px-4 py-3 text-left font-semibold">Foto</th>
                    <th className="px-4 py-3 text-left font-semibold">Premium</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {peserta.map((p) => (
                    <tr key={p.kode} className={`border-b border-border last:border-0 transition-colors ${p.banned ? "bg-red-50/40 dark:bg-red-900/10" : "hover:bg-secondary/30"}`}>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{p.kode}</td>
                      <td className="px-4 py-3 font-medium">
                        {p.inisial}
                        {p.banned && <span className="ml-1.5 text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">BANNED</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.gender === "Perempuan" ? "♀" : "♂"} {p.gender}</td>
                      <td className="px-4 py-3">{p.marga}</td>
                      <td className="px-4 py-3 text-muted-foreground">{tahunSekarang - p.tahunLahir}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.kota}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.suku}</td>
                      <td className="px-4 py-3 text-center">
                        {p.foto ? (
                          <img src={`/api/photos/${p.kode}`} alt={p.inisial} className="h-8 w-8 rounded-full object-cover border border-border" />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => togglePremium(p.kode, p.premium ?? false)}
                          disabled={togglingKode === p.kode}
                          className={`inline-flex h-7 items-center gap-1 rounded-full px-3 text-xs font-semibold transition-colors ${p.premium ? "bg-accent/15 text-accent hover:bg-accent/25 border border-accent/30" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                        >
                          {togglingKode === p.kode ? "..." : p.premium ? "★ Premium" : "Gratis"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleBan(p.kode, p.banned ?? false)}
                          disabled={banningKode === p.kode}
                          className={`inline-flex h-7 items-center gap-1 rounded-full px-3 text-xs font-semibold transition-colors ${p.banned ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"}`}
                        >
                          {banningKode === p.kode ? "..." : p.banned ? "✓ Buka Blokir" : "🚫 Blokir Akun"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`/hasil/${p.kode}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
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

        {/* ── Tab: Laporan ── */}
        {tab === "laporan" && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {laporan.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-lg font-semibold text-foreground mb-1">Tidak ada laporan aktif</p>
                <p className="text-sm text-muted-foreground">Semua pengaduan sudah ditangani.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left font-semibold">Pelapor</th>
                    <th className="px-4 py-3 text-left font-semibold">Dilaporkan</th>
                    <th className="px-4 py-3 text-left font-semibold">Alasan</th>
                    <th className="px-4 py-3 text-left font-semibold">Waktu</th>
                    <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {laporan.map((l) => {
                    const pelapor = l.pelapor_kode ?? l.peserta_a;
                    const dilaporkan = l.pelapor_kode
                      ? (l.pelapor_kode === l.peserta_a ? l.peserta_b : l.peserta_a)
                      : l.peserta_b;
                    const pesertaPelapor = peserta.find((p) => p.kode === pelapor);
                    const pesertaDilaporkan = peserta.find((p) => p.kode === dilaporkan);
                    return (
                      <tr key={l.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-primary">{pelapor}</span>
                          {pesertaPelapor && <p className="text-xs text-muted-foreground">{pesertaPelapor.inisial}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-red-600">{dilaporkan}</span>
                          {pesertaDilaporkan && <p className="text-xs text-muted-foreground">{pesertaDilaporkan.inisial}</p>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-xs text-xs leading-relaxed">{l.alasan_laporan}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(l.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1.5">
                            <button type="button" onClick={() => selesaikanLaporan(l.id)}
                              className="rounded-lg bg-adat-aman/15 px-2.5 py-1 text-[11px] font-medium text-adat-aman hover:bg-adat-aman/25 transition-colors whitespace-nowrap">
                              ✓ Selesaikan
                            </button>
                            <button type="button"
                              onClick={() => { const p = peserta.find(p => p.kode === dilaporkan); toggleBan(dilaporkan, p?.banned ?? false); }}
                              disabled={banningKode === dilaporkan}
                              className="rounded-lg bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors whitespace-nowrap">
                              {banningKode === dilaporkan ? "..." : "🚫 Blokir Akun"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Tab: Matching ── */}
        {tab === "matching" && matching && (
          <div className="space-y-6">
            {matching.hasil.map((h) => (
              <div key={h.kode} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-xs text-primary">{h.kode}</span>
                  <h3 className="text-lg font-semibold text-foreground">{h.nama}</h3>
                  <span className="text-sm text-muted-foreground">{h.gender === "Perempuan" ? "♀" : "♂"} · {h.marga}</span>
                </div>
                {h.top3.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Tidak ada pasangan yang memenuhi syarat.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {h.top3.map((m, i) => (
                      <div key={`${h.kode}-${i}`} className={`rounded-xl border p-5 ${m.saling ? "border-accent/40 bg-accent/5" : "border-border bg-secondary/20"}`}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Peringkat {i + 1}</span>
                          {m.saling && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">SALING ♥</span>}
                        </div>
                        <p className="text-base font-semibold text-foreground">{m.nama}</p>
                        <p className="text-sm text-muted-foreground">{m.marga}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <StatusAdatBadge status={m.status} size="sm" />
                          <span className="text-xl font-bold text-primary">{m.skor}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{m.label}</p>
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
