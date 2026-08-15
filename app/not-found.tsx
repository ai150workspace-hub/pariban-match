import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="font-mono text-6xl font-bold text-primary/20">404</p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-3 text-muted-foreground">
        Mungkin tautan sudah berubah atau kode peserta tidak valid.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
