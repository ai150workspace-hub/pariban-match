"use client";

import { useState } from "react";
import { PAKET_PREMIUM } from "@/lib/pricing";

export interface TransaksiItem {
  id: string;
  provider: string;
  transactionId: string;
  orderId: string | null;
  emailPembayar: string | null;
  nomorHpPembayar: string | null;
  nominal: number | null;
  paket: string | null;
  status: string;
  pesertaKode: string | null;
  catatan: string | null;
  dicocokkanOleh: string | null;
  dicocokkanPada: string | null;
  createdAt: string;
}

export interface PembayaranData {
  belumDiproses: TransaksiItem[];
  aktif: TransaksiItem[];
}

interface PesertaRingkas {
  kode: string;
  nama: string;
  email: string;
}

const STATUS_LABEL: Record<string, string> = {
  tidak_cocok: "Email/HP tidak cocok",
  paket_tidak_dikenal: "Paket tidak dikenali",
  gagal: "Gagal diaktifkan",
  aktif: "Aktif",
};

const PELAKSANA_KEY = "admin_pelaksana";

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function rupiah(n: number | null) {
  return n == null ? "—" : `Rp ${n.toLocaleString("id-ID")}`;
}

function BarisBelumDiproses({
  t,
  peserta,
  onDone,
}: {
  t: TransaksiItem;
  peserta: PesertaRingkas[];
  onDone: () => void;
}) {
  const [kode, setKode] = useState(t.pesertaKode ?? "");
  const [paket, setPaket] = useState(t.paket ?? "");
  const [oleh, setOleh] = useState(() => {
    try { return localStorage.getItem(PELAKSANA_KEY) ?? ""; } catch { return ""; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const target = peserta.find((p) => p.kode === kode.trim().toUpperCase());

  async function cocokkan() {
    setError("");
    if (!target) return setError("Kode peserta tidak ditemukan.");
    if (!paket) return setError("Pilih paket.");
    if (!oleh.trim()) return setError("Isi nama kamu sebagai pelaksana.");
    if (!window.confirm(`Aktifkan Premium ${paket} untuk ${target.kode} (${target.nama})?`)) return;
    setLoading(true);
    try {
      try { localStorage.setItem(PELAKSANA_KEY, oleh.trim()); } catch {}
      const res = await fetch(`/api/admin/transaksi/${t.id}/cocokkan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode: target.kode, paket, oleh: oleh.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Gagal mencocokkan.");
      else onDone();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {rupiah(t.nominal)} <span className="font-normal text-muted-foreground">· {formatTanggal(t.createdAt)}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground break-all">
            Email pembayar: <span className="text-foreground">{t.emailPembayar || "—"}</span>
            {" · "}HP: <span className="text-foreground">{t.nomorHpPembayar || "—"}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground break-all">
            ID transaksi: <span className="font-mono">{t.transactionId}</span>
          </p>
          {t.catatan && <p className="mt-0.5 text-xs text-muted-foreground">{t.catatan}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
          {STATUS_LABEL[t.status] ?? t.status}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <div>
          <input
            list={`peserta-${t.id}`}
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            placeholder="Kode peserta (mis. P012)"
            aria-label="Kode peserta"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <datalist id={`peserta-${t.id}`}>
            {peserta.map((p) => (
              <option key={p.kode} value={p.kode}>{p.nama} · {p.email}</option>
            ))}
          </datalist>
          <p className="mt-1 text-[11px] text-muted-foreground min-h-4">
            {target ? `${target.nama} · ${target.email}` : kode ? "Kode tidak dikenal" : ""}
          </p>
        </div>
        <select
          value={paket}
          onChange={(e) => setPaket(e.target.value)}
          aria-label="Paket"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm h-fit"
        >
          <option value="">— Paket —</option>
          {PAKET_PREMIUM.map((p) => (
            <option key={p.id} value={p.id}>{p.nama} ({rupiah(p.harga)})</option>
          ))}
        </select>
        <input
          value={oleh}
          onChange={(e) => setOleh(e.target.value)}
          placeholder="Nama kamu (pelaksana)"
          aria-label="Nama pelaksana"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm h-fit"
        />
        <button
          type="button"
          onClick={cocokkan}
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 h-fit"
        >
          {loading ? "Memproses…" : "Cocokkan & aktifkan"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function PembayaranPanel({
  data,
  peserta,
  onChanged,
}: {
  data: PembayaranData | null;
  peserta: PesertaRingkas[];
  onChanged: () => void;
}) {
  if (!data) {
    return <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">Memuat…</div>;
  }
  const belumDiproses = data.belumDiproses ?? [];
  const aktif = data.aktif ?? [];
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">
          Pembayaran belum tercocokkan ({belumDiproses.length})
        </h2>
        {belumDiproses.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Tidak ada. Semua pembayaran yang masuk sudah cocok otomatis.
          </div>
        ) : (
          <div className="space-y-3">
            {belumDiproses.map((t) => (
              <BarisBelumDiproses key={t.id} t={t} peserta={peserta} onDone={onChanged} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">Pembayaran yang sudah diaktifkan (30 terbaru)</h2>
        {aktif.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Belum ada pembayaran yang diaktifkan lewat webhook/pencocokan.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left font-semibold">Waktu</th>
                  <th className="px-4 py-3 text-left font-semibold">Peserta</th>
                  <th className="px-4 py-3 text-left font-semibold">Paket</th>
                  <th className="px-4 py-3 text-left font-semibold">Nominal</th>
                  <th className="px-4 py-3 text-left font-semibold">Email pembayar</th>
                  <th className="px-4 py-3 text-left font-semibold">Cara</th>
                </tr>
              </thead>
              <tbody>
                {aktif.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatTanggal(t.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{t.pesertaKode ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{t.paket ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{rupiah(t.nominal)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground break-all">{t.emailPembayar ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {t.dicocokkanOleh ? `Manual oleh ${t.dicocokkanOleh}` : "Otomatis"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
