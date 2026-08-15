"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="font-mono text-6xl font-bold text-adat-blokir/20">!</p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
        Terjadi kesalahan
      </h1>
      <p className="mt-3 text-muted-foreground">
        {error.message || "Sesuatu tidak berjalan dengan baik."}
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Coba lagi
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-lg border border-border px-6 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
        >
          Beranda
        </Link>
      </div>
    </div>
  );
}
