import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PAKET_PREMIUM, TRIAL_DURASI_HARI } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Harga — PARIBAN",
  description: "Paket berlangganan PARIBAN Match: trial gratis 14 hari dan paket premium 1, 3, atau 6 bulan.",
};

const METODE_PEMBAYARAN = ["QRIS"];

export default function HargaPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-12 text-center">
            <p className="mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-brand">
              Harga
            </p>
            <h1 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              Paket Berlangganan PARIBAN
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
              Coba dulu gratis, lanjutkan kalau cocok. Pembayaran sekali di muka,
              tanpa perpanjangan otomatis.
            </p>
          </div>

          {/* Kartu harga */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-semibold text-foreground">Trial Gratis</p>
              <p className="mt-3 text-3xl font-bold text-brand">Rp 0</p>
              <p className="mt-1 text-sm text-muted-foreground">{TRIAL_DURASI_HARI} hari</p>
            </div>
            {PAKET_PREMIUM.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl border p-6 ${p.badge ? "border-brand/50 bg-brand-tint" : "border-border bg-card"}`}
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{p.nama}</p>
                  {p.badge && (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-3xl font-bold text-brand">
                  Rp {p.harga.toLocaleString("id-ID")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{p.durasiHari} hari</p>
                {p.perBulan && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    setara Rp {p.perBulan.toLocaleString("id-ID")}/bulan
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Ketentuan trial & pembayaran */}
          <div className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Trial gratis {TRIAL_DURASI_HARI} hari, tidak memerlukan kartu atau metode pembayaran.</strong>
            </p>
            <p>
              <strong className="text-foreground">Trial tidak berubah menjadi berlangganan berbayar secara otomatis.</strong>{" "}
              Setelah {TRIAL_DURASI_HARI} hari, akses premium berhenti dan pengguna dapat membeli
              paket secara manual bila ingin melanjutkan.
            </p>
            <p>
              <strong className="text-foreground">Trial berlaku satu kali per pengguna.</strong>
            </p>
            <p>
              <strong className="text-foreground">Pembayaran sekali di muka. Tidak ada perpanjangan otomatis.</strong>{" "}
              Setiap paket berbayar aktif selama durasi yang dibeli, lalu berakhir dengan sendirinya.
            </p>
          </div>

          {/* Metode pembayaran */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-heading text-lg font-bold text-foreground">Metode Pembayaran</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {METODE_PEMBAYARAN.map((m) => (
                <li key={m} className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand">✓</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Pembayaran diproses lewat Midtrans, penyedia payment gateway resmi berizin Bank Indonesia.
            </p>
          </div>

          {/* Apa yang termasuk */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <h2 className="font-heading text-lg font-bold text-foreground">Termasuk (Trial &amp; Premium)</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-adat-aman">✓</span>
                  <span>Melihat seluruh hasil pencocokan Top 3, lengkap dengan skor dan detail profil kandidat</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-adat-aman">✓</span>
                  <span>Memulai percakapan dengan kandidat yang saling cocok</span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <h2 className="font-heading text-lg font-bold text-foreground">Setelah Trial/Premium Berakhir</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-adat-cek">•</span>
                  <span>Hasil pencocokan (skor &amp; profil) tetap bisa dilihat</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-adat-blokir">✕</span>
                  <span>Tidak bisa memulai percakapan baru dengan kandidat yang saling cocok sampai berlangganan kembali</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/daftar"
              className="inline-flex h-12 items-center rounded-xl bg-brand px-10 text-lg font-semibold text-white hover:bg-brand-hover transition-colors"
            >
              Mulai Trial Gratis
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
