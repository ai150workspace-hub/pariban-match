import Link from "next/link";

export function TenunBand() {
  return (
    <div
      aria-hidden="true"
      className="h-12 w-full sm:h-[72px]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, var(--brand) 0px, var(--brand) 8px, var(--ink) 8px, var(--ink) 10px, var(--brand-tint) 10px, var(--brand-tint) 18px, var(--ink) 18px, var(--ink) 20px)",
      }}
    />
  );
}

const FOOTER_LINKS = [
  { href: "/harga", label: "Harga" },
  { href: "/syarat", label: "Syarat & Ketentuan" },
  { href: "/privasi", label: "Kebijakan Privasi" },
  { href: "/langganan", label: "Ketentuan Langganan" },
  { href: "/kontak", label: "Kontak" },
];

export function Footer() {
  return (
    <>
      <TenunBand />
      <footer className="bg-brand py-12 text-center">
        <p className="text-2xl font-bold tracking-[0.15em] text-surface">
          PARIBAN
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/65">
          Platform kesiapan menikah untuk masyarakat Batak.
          <br />
          Dibuat dengan menghormati adat dan budaya Batak.
        </p>
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-6 text-xs text-white/70">
          {FOOTER_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-xs text-white/70">
          &copy; 2026 PARIBAN. Hak cipta dilindungi.
        </p>
      </footer>
    </>
  );
}
