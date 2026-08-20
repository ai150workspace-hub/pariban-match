"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StatusAdatBadge } from "@/components/ui/status-adat-badge";

// ─── Interfaces ───────────────────────────────────────────────────────
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
  premiumPaket?: string;
  premiumExpiry?: string;
  banned?: boolean;
  // Fields untuk eligibility check
  ibadah?: string;
  kerja?: string;
  pendidikan?: string;
  timeline?: string;
  bahasaKasih?: string;
  konflik?: string;
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
  daftarMulai: number;
  daftarSelesai: number;
  abandoned: number;
}

interface Demografi {
  total: number;
  genderRatio: { pria: number; wanita: number };
  usiaDist: Record<string, number>;
  topPekerjaan: { label: string; count: number }[];
  topPendidikan: { label: string; count: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────
function isEligible(p: PesertaData): boolean {
  if (p.banned) return false;
  return !!(p.ibadah && p.kerja && p.pendidikan && p.timeline && p.bahasaKasih && p.konflik);
}

function pct(num: number, denom: number): string {
  if (!denom || denom === 0) return "—";
  return Math.round((num / denom) * 100) + "%";
}

function rupiah(n: number): string {
  if (n === 0) return "Rp 0";
  return "Rp " + n.toLocaleString("id-ID");
}

// ─── Mini bar chart ───────────────────────────────────────────────────
function MiniBar({ label, count, max, color = "bg-primary" }: { label: string; count: number; max: number; color?: string }) {
  const w = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-xs text-muted-foreground truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${w}%` }} />
      </div>
      <span className="w-6 text-right text-xs font-semibold text-foreground">{count}</span>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, accent = false, warn = false, onClick,
}: {
  label: string; value: string | number; sub?: string; accent?: boolean; warn?: boolean; onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        warn ? "border-orange-300 bg-orange-50/40 dark:bg-orange-900/10 cursor-pointer" :
        accent ? "border-accent/30 bg-accent/5" :
        "border-border bg-card"
      } ${onClick ? "cursor-pointer hover:border-primary/50" : ""}`}
      onClick={onClick}
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold ${warn ? "text-orange-600 dark:text-orange-400" : accent ? "text-accent" : "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Funnel Step ─────────────────────────────────────────────────────
function FunnelStep({ label, count, total, last = false }: { label: string; count: number | string; total?: number; last?: boolean }) {
  const n = typeof count === "number" ? count : null;
  const ratio = n !== null && total ? Math.round((n / total) * 100) : null;
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <div className="w-full rounded-xl border border-border bg-card p-3 text-center">
        <p className="text-xs text-muted-foreground leading-tight mb-1">{label}</p>
        <p className="text-xl font-bold text-foreground">{count}</p>
        {ratio !== null && (
          <p className="text-xs text-primary font-medium">{ratio}%</p>
        )}
      </div>
      {!last && (
        <div className="hidden sm:flex items-center text-muted-foreground/40 text-lg font-light select-none">→</div>
      )}
    </div>
  );
}

// ─── Founder Alert ────────────────────────────────────────────────────
function FounderAlert({ icon, label, value, ok, detail }: { icon: string; label: string; value: string; ok: boolean; detail?: string }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${ok ? "border-green-200 bg-green-50/30 dark:bg-green-900/10" : "border-orange-300 bg-orange-50/40 dark:bg-orange-900/10"}`}>
      <span className="text-lg leading-none mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className={`text-sm font-bold mt-0.5 ${ok ? "text-green-700 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>{value}</p>
        {detail && <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>}
      </div>
      <span className={`text-lg ${ok ? "text-green-500" : "text-orange-500"}`}>{ok ? "✓" : "!"}</span>
    </div>
  );
}

// ─── Demografi Widget ─────────────────────────────────────────────────
function DemografiWidget({ d }: { d: Demografi }) {
  const total = d.total || 1;
  const priaPct = Math.round((d.genderRatio.pria / total) * 100);
  const wanitaPct = 100 - priaPct;
  const maxUsia = Math.max(...Object.values(d.usiaDist), 1);
  const maxKerja = d.topPekerjaan[0]?.count ?? 1;
  const maxDidik = d.topPendidikan[0]?.count ?? 1;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-bold text-foreground">Rasio Gender</h3>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl font-bold text-primary">{d.genderRatio.pria}</span>
          <span className="text-sm text-muted-foreground">Pria</span>
          <span className="ml-auto text-2xl font-bold text-accent">{d.genderRatio.wanita}</span>
          <span className="text-sm text-muted-foreground">Wanita</span>
        </div>
        <div className="h-4 rounded-full overflow-hidden flex">
          <div className="bg-primary transition-all h-full" style={{ width: `${priaPct}%` }} />
          <div className="bg-accent transition-all h-full flex-1" />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Pria {priaPct}%</span>
          <span>Wanita {wanitaPct}%</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-bold text-foreground">Distribusi Usia</h3>
        <div className="space-y-2.5">
          {Object.entries(d.usiaDist).map(([range, count]) => (
            <MiniBar key={range} label={range + " thn"} count={count} max={maxUsia} color="bg-accent" />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-bold text-foreground">Top Status Kerja</h3>
        <div className="space-y-2.5">
          {d.topPekerjaan.map((item) => (
            <MiniBar key={item.label} label={item.label} count={item.count} max={maxKerja} color="bg-primary" />
          ))}
          {d.topPekerjaan.length === 0 && <p className="text-xs text-muted-foreground">Belum ada data</p>}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-bold text-foreground">Distribusi Pendidikan</h3>
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
          <h1 className="font-heading text-2xl font-bold leading-tight text-foreground">Admin</h1>
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

  // ── Computed metrics ──────────────────────────────────────────────
  const tahunSekarang = new Date().getFullYear();
  const totalUser = peserta.length;
  const eligible = peserta.filter(isEligible);
  const totalEligible = eligible.length;
  const eligiblePria = eligible.filter((p) => p.gender === "Laki-laki").length;
  const eligibleWanita = eligible.filter((p) => p.gender === "Perempuan").length;
  const pesertaWithFoto = peserta.filter((p) => p.foto).length;

  const pesertaWithMatch = matching
    ? matching.hasil.filter((h) => h.top3.length > 0).length
    : null;
  const pesertaWithMutual = matching
    ? matching.hasil.filter((h) => h.top3.some((m) => m.saling)).length
    : null;

  const daftarMulai = stats?.daftarMulai ?? 0;
  const daftarSelesai = stats?.daftarSelesai ?? totalUser;
  const completionRate = daftarMulai > 0 ? Math.round((daftarSelesai / daftarMulai) * 100) : null;

  // Founder alerts
  const genderDelta = demografi
    ? Math.abs(demografi.genderRatio.pria - demografi.genderRatio.wanita) / Math.max(demografi.total, 1)
    : null;
  const genderImbalanced = genderDelta !== null && genderDelta > 0.3 && demografi!.total >= 5;
  const completionLow = completionRate !== null && completionRate < 50 && daftarMulai >= 5;
  const hasReports = (stats?.totalLaporan ?? 0) > 0;
  const lowFotoRate = totalUser >= 5 && pesertaWithFoto / totalUser < 0.5;

  if (checkingAuth) return null;
  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-[0.15em] text-primary">PARIBAN</Link>
            <span className="rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { sessionStorage.removeItem("admin_auth"); setAuthed(false); }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-10">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase mb-1">PARIBAN MATCH</p>
            <h1 className="font-heading text-3xl font-bold text-foreground">Command Center</h1>
            <p className="mt-1 text-muted-foreground text-sm">Pantau kesehatan platform, funnel, dan demografi peserta secara real-time.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
              ⚠ TEST DATA
            </span>
            <button type="button" onClick={refreshAll} disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-secondary border border-border px-4 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50">
              {loading ? "Memuat..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* ── Level 1: Business Health KPIs ── */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Kesehatan Bisnis</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            <KpiCard label="Total Pengguna" value={totalUser}
              sub={daftarMulai > 0 ? `dari ${daftarMulai} mulai daftar` : undefined} />
            <KpiCard label="Completion Rate" value={completionRate !== null ? completionRate + "%" : "—"}
              warn={completionLow}
              sub={daftarMulai > 0 ? `${daftarSelesai} dari ${daftarMulai} selesai` : "Belum ada log daftar"} />
            <KpiCard label="Profil Eligible" value={totalEligible}
              sub={totalUser > 0 ? pct(totalEligible, totalUser) + " dari total" : undefined} />
            <KpiCard label="Potensi Match" value={matching?.totalPasangan ?? "—"}
              sub="Pasangan yang bisa di-match" />
            <KpiCard label="Dapat Rekomendasi" value={pesertaWithMatch ?? "—"}
              sub="Peserta dengan ≥1 kandidat" />
            <KpiCard label="Saling Cocok" value={pesertaWithMutual ?? "—"}
              sub="Peserta dengan ≥1 mutual" accent />
            <KpiCard label="Premium Aktif" value={stats?.totalPremium ?? "—"}
              sub={totalUser > 0 && stats ? pct(stats.totalPremium, totalUser) + " dari total" : undefined}
              accent />
            <KpiCard label="Revenue" value={stats ? rupiah(stats.totalPemasukan) : "—"}
              sub="Dari transaksi berhasil" />
          </div>
        </section>

        {/* ── Level 2: Funnels ── */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Funnel</h2>
          <div className="grid gap-4 md:grid-cols-2">

            {/* Registration Funnel */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-bold text-foreground">Registrasi</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Mulai Daftar", count: daftarMulai > 0 ? daftarMulai : "Belum tersedia", top: daftarMulai || undefined },
                  { label: "Selesai Daftar", count: daftarSelesai, top: daftarMulai || undefined },
                  { label: "Profil Eligible", count: totalEligible, top: daftarSelesai || undefined },
                  { label: "Dapat Rekomendasi", count: pesertaWithMatch ?? "Belum tersedia", top: totalEligible || undefined },
                  { label: "Saling Cocok", count: pesertaWithMutual ?? "Belum tersedia", top: (pesertaWithMatch ?? 0) || undefined },
                ].map((step, i, arr) => {
                  const isNum = typeof step.count === "number";
                  const ratio = isNum && step.top ? Math.round((step.count as number / step.top) * 100) : null;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{step.label}</span>
                          <span className="text-xs font-bold text-foreground">{step.count}</span>
                        </div>
                        {ratio !== null ? (
                          <div className="h-1.5 rounded-full bg-border overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${ratio}%` }} />
                          </div>
                        ) : (
                          <div className="h-1.5 rounded-full bg-border" />
                        )}
                      </div>
                      {i < arr.length - 1 && ratio !== null && (
                        <span className="text-xs text-muted-foreground w-10 text-right">{ratio}%</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Funnel */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-bold text-foreground">Konversi Premium</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Total Pengguna", count: totalUser },
                  { label: "Lihat Halaman Hasil", count: "Belum tersedia", top: undefined },
                  { label: "Klik Upgrade", count: "Belum tersedia", top: undefined },
                  { label: "Bayar (Premium Aktif)", count: stats?.totalPremium ?? "—", top: totalUser || undefined },
                ].map((step, i, arr) => {
                  const isNum = typeof step.count === "number";
                  const ratio = isNum && step.top ? Math.round((step.count as number / step.top) * 100) : null;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{step.label}</span>
                          <span className="text-xs font-bold text-foreground">{step.count}</span>
                        </div>
                        {ratio !== null ? (
                          <div className="h-1.5 rounded-full bg-border overflow-hidden">
                            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${ratio}%` }} />
                          </div>
                        ) : (
                          <div className="h-1.5 rounded-full bg-border" />
                        )}
                      </div>
                      {i < arr.length - 1 && ratio !== null && (
                        <span className="text-xs text-muted-foreground w-10 text-right">{ratio}%</span>
                      )}
                    </div>
                  );
                })}
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Revenue</span>
                  <span className="text-sm font-bold text-accent">{stats ? rupiah(stats.totalPemasukan) : "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Level 3: Founder Attention ── */}
        {totalUser >= 3 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Perlu Perhatian Founder</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FounderAlert
                icon="📝"
                label="Completion Rate"
                value={completionRate !== null ? completionRate + "%" : "Belum tersedia"}
                ok={!completionLow}
                detail={completionLow ? "Di bawah 50% — banyak yang berhenti di tengah" : "Di atas 50% — oke"}
              />
              <FounderAlert
                icon="⚖️"
                label="Keseimbangan Gender"
                value={demografi ? `${demografi.genderRatio.pria}♂ : ${demografi.genderRatio.wanita}♀` : "—"}
                ok={!genderImbalanced}
                detail={genderImbalanced ? "Ketimpangan >30% — matching jadi lebih sulit" : "Rasio cukup seimbang"}
              />
              <FounderAlert
                icon="📸"
                label="Foto Profil"
                value={totalUser > 0 ? pct(pesertaWithFoto, totalUser) + " punya foto" : "—"}
                ok={!lowFotoRate}
                detail={lowFotoRate ? "Kurang dari 50% upload foto" : "Mayoritas sudah punya foto"}
              />
              <FounderAlert
                icon="🚨"
                label="Laporan Aktif"
                value={stats ? (stats.totalLaporan === 0 ? "Tidak ada" : stats.totalLaporan + " laporan") : "—"}
                ok={!hasReports}
                detail={hasReports ? "Segera tindaklanjuti" : "Semua aman"}
              />
            </div>
          </section>
        )}

        {/* ── Level 4: Demografi ── */}
        {demografi && demografi.total > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Demografi</h2>

            {/* Eligible gender breakdown */}
            {totalEligible > 0 && (
              <div className="mb-4 rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Eligible per Gender</h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{eligiblePria}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">♂ Laki-laki</p>
                    <p className="text-xs text-primary font-medium">{pct(eligiblePria, totalEligible)}</p>
                  </div>
                  <div className="flex-1 h-3 rounded-full bg-border overflow-hidden flex">
                    <div className="bg-primary h-full transition-all" style={{ width: pct(eligiblePria, totalEligible) }} />
                    <div className="bg-accent h-full flex-1 transition-all" />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{eligibleWanita}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">♀ Perempuan</p>
                    <p className="text-xs text-accent font-medium">{pct(eligibleWanita, totalEligible)}</p>
                  </div>
                </div>
              </div>
            )}

            <DemografiWidget d={demografi} />
          </section>
        )}

        {/* ── Level 5: Operational ── */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Operasional</h2>
          <div className="mb-6 grid gap-3 grid-cols-2 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-xs text-muted-foreground">Diblokir Adat</p>
              <p className="mt-1 text-2xl font-bold text-adat-blokir">{matching?.diblokir ?? "—"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">pasangan terblokir</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-xs text-muted-foreground">Akun Diblokir</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{stats?.totalBanned ?? "—"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">akun ter-ban</p>
            </div>
            <div
              className={`rounded-xl border p-4 text-center cursor-pointer transition-colors ${laporan.length > 0 ? "border-red-300 bg-red-50/50 dark:bg-red-900/10" : "border-border bg-card"}`}
              onClick={() => setTab("laporan")}
            >
              <p className="text-xs text-muted-foreground">Laporan Masuk</p>
              <p className={`mt-1 text-2xl font-bold ${laporan.length > 0 ? "text-red-600" : "text-foreground"}`}>
                {stats?.totalLaporan ?? laporan.length}
              </p>
              {laporan.length > 0 && <p className="mt-0.5 text-xs text-red-500 font-medium">Klik untuk tindaklanjuti</p>}
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-xs text-muted-foreground">Daftar Tidak Selesai</p>
              <p className="mt-1 text-2xl font-bold text-orange-500">{stats?.abandoned ?? "—"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">drop-off pendaftaran</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
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
                          {isEligible(p) && <span className="ml-1 text-[10px] font-semibold text-green-600 dark:text-green-400">✓</span>}
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
                          {p.premiumPaket && (
                            <p className="mt-0.5 text-[10px] text-muted-foreground">{p.premiumPaket}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleBan(p.kode, p.banned ?? false)}
                            disabled={banningKode === p.kode}
                            className={`inline-flex h-7 items-center gap-1 rounded-full px-3 text-xs font-semibold transition-colors ${p.banned ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"}`}
                          >
                            {banningKode === p.kode ? "..." : p.banned ? "✓ Buka Blokir" : "🚫 Blokir"}
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
        </section>

      </div>
    </div>
  );
}
