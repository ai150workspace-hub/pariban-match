import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Kontak — PARIBAN",
  description: "Hubungi tim PARIBAN Match.",
};

const KONTAK = [
  { label: "Email", value: "[ISI]" },
  { label: "WhatsApp", value: "[ISI]" },
  { label: "Jam Operasional", value: "[ISI]" },
  { label: "Alamat Usaha", value: "[ISI]" },
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
              <div key={k.label} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-foreground">{k.label}</p>
                <p className="text-sm text-muted-foreground">{k.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
