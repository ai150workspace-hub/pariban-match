"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function PersetujuanForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const nama = params.get("nama") ?? "";

  const [disetujui, setDisetujui] = useState(false);

  function lanjutkan() {
    if (!disetujui) return;
    const q = new URLSearchParams();
    if (email) q.set("email", email);
    if (nama) q.set("nama", nama);
    router.push(`/daftar?${q.toString()}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-6">
          <Link href="/" className="text-xl font-bold tracking-[0.15em] text-primary">PARIBAN</Link>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
            📋
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Sebelum Mulai</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Baca dan setujui syarat & ketentuan PARIBAN Match untuk melanjutkan pendaftaran.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          {/* Terms */}
          <div className="rounded-xl bg-secondary/50 p-5 space-y-4 text-sm text-muted-foreground leading-relaxed max-h-64 overflow-y-auto">
            <div>
              <p className="font-semibold text-foreground mb-1">1. Kejujuran & Keaslian Data</p>
              <p>Saya bersedia mengisi data profil dengan jujur dan apa adanya. Data palsu dapat menyebabkan penghapusan akun secara permanen.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">2. Persyaratan Usia & Status</p>
              <p>Saya menyatakan bahwa saya berusia <strong>minimal 21 tahun</strong> dan berstatus <strong>lajang / single</strong> (belum menikah dan tidak dalam hubungan terikat).</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">3. Niat Serius</p>
              <p>Saya menggunakan PARIBAN Match dengan niat serius untuk menemukan pasangan hidup, bukan sekadar iseng atau mengumpulkan kontak.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">4. Sopan Santun & Etika</p>
              <p>Saya berjanji untuk menjaga sopan santun, tidak mengirim konten tidak pantas, dan menghormati privasi sesama pengguna.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">5. Privasi Data</p>
              <p>Saya memahami bahwa data yang saya masukkan akan digunakan untuk proses pencocokan sesuai dengan adat Batak, dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan saya.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">6. Syarat & Ketentuan Platform</p>
              <p>Saya sudah membaca, mengerti, dan setuju dengan seluruh Syarat & Ketentuan yang berlaku di PARIBAN Match.</p>
            </div>
          </div>

          {/* Checkbox Persetujuan */}
          <label className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
            disetujui ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
          }`}>
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={disetujui}
                onChange={(e) => setDisetujui(e.target.checked)}
                className="sr-only"
              />
              <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                disetujui ? "border-primary bg-primary" : "border-border bg-background"
              }`}>
                {disetujui && (
                  <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              Saya sudah membaca, mengerti, dan setuju dengan{" "}
              <strong>Syarat & Ketentuan PARIBAN Match</strong>. Saya berjanji untuk
              <strong> jujur</strong>, menjaga <strong>sikap & perilaku</strong>, berusia{" "}
              <strong>21 tahun ke atas</strong>, serta berstatus <strong>single</strong>.
            </p>
          </label>

          {/* Tombol */}
          <button
            type="button"
            onClick={lanjutkan}
            disabled={!disetujui}
            className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Mulai Daftar →
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/masuk" className="text-primary hover:underline font-medium">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PersetujuanPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <PersetujuanForm />
    </Suspense>
  );
}
