import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-[0.15em] text-brand"
        >
          PARIBAN
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="#cara-kerja"
            className="hidden text-sm font-medium text-muted-foreground hover:text-foreground transition-colors sm:inline"
          >
            Cara Kerja
          </Link>
          <Link
            href="#pilar"
            className="hidden text-sm font-medium text-muted-foreground hover:text-foreground transition-colors sm:inline"
          >
            Penilaian
          </Link>
          <Link
            href="/daftar"
            className="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
          >
            Daftar
          </Link>
        </div>
      </div>
    </nav>
  );
}
