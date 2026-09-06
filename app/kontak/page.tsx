import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Kontak — PARIBAN",
  description: "Hubungi tim PARIBAN Match.",
};

const KONTAK = [
  {
    label: "Email",
    value: "financepariban@gmail.com",
    href: "mailto:financepariban@gmail.com",
  },
  {
    label: "WhatsApp",
    value: "+62 852-7515-7574",
    href: "https://wa.me/6285275157574",
  },
  {
    label: "Jam Operasional",
    value: (
      <>
        Senin–Jumat 09.00–17.00 WIB
        <br />
        Sabtu, Minggu, dan hari libur nasional tutup (dukungan terbatas melalui email)
      </>
    ),
  },
  {
    label: "Alamat",
    value: (
      <>
        Jl. Sunburst CBD, Jl. Kapten Soebijanto Djojohadikusumo No. 8 Lot I,
        Lengkong Gudang, Kec. Serpong, Kota Tangerang Selatan, Banten 15321
      </>
    ),
  },
  {
    label: "Penanggung Jawab",
    value: "Betty Luciana Situmorang (usaha perorangan)",
  },
];

export default function KontakPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="mb-10 text-center">
            <p className="mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-brand">
              Kontak
            </p>
            <h1 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              Hubungi Kami
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
              Ada pertanyaan seputar akun, pembayaran, atau data pribadi Anda?
              Kontak PARIBAN Match:
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 divide-y divide-border">
            {KONTAK.map((k) => (
              <div key={k.label} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-foreground">{k.label}</p>
                {k.href ? (
                  <a href={k.href} className="mt-1 block text-sm text-brand hover:underline">
                    {k.value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{k.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
