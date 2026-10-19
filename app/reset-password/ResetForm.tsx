"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [tampil, setTampil] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selesai, setSelesai] = useState(false);
  const [tautanBermasalah, setTautanBermasalah] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password minimal 8 karakter.");
    if (password !== konfirmasi) return setError("Password dan konfirmasi tidak cocok.");

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return setSelesai(true);
      if (res.status === 400 && /tautan/i.test(data.error ?? "")) setTautanBermasalah(true);
      setError(data.error || "Terjadi kesalahan, coba lagi.");
    } catch {
      setError("Gagal menghubungi server. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  }

  const tanpaToken = !token;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <nav className="border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-6">
          <Link href="/" className="text-xl font-bold tracking-[0.15em] text-primary">
            PARIBAN
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground">Atur Password Baru</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Buat password baru untuk akun PARIBAN Anda.
            </p>
          </div>

          {selesai ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="font-semibold text-foreground">Password berhasil diubah.</p>
              <p className="mt-1 text-sm text-muted-foreground">Silakan masuk dengan password baru Anda.</p>
              <Link
                href="/masuk"
                className="mt-4 inline-flex h-10 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Masuk
              </Link>
            </div>
          ) : tanpaToken || tautanBermasalah ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="font-semibold text-foreground">Tautan tidak valid atau sudah kedaluwarsa.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tautan reset hanya berlaku 1 jam dan hanya bisa dipakai sekali. Silakan minta tautan yang baru.
              </p>
              <Link
                href="/lupa-password"
                className="mt-4 inline-flex h-10 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Minta tautan baru
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                  Password baru
                </label>
                <input
                  id="password"
                  type={tampil ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  autoFocus
                  placeholder="Minimal 8 karakter"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label htmlFor="konfirmasi" className="mb-1.5 block text-sm font-medium text-foreground">
                  Ulangi password baru
                </label>
                <input
                  id="konfirmasi"
                  type={tampil ? "text" : "password"}
                  value={konfirmasi}
                  onChange={(e) => setKonfirmasi(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={tampil} onChange={(e) => setTampil(e.target.checked)} />
                Tampilkan password
              </label>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password || !konfirmasi}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
