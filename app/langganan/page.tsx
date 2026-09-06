import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Ketentuan Langganan — PARIBAN",
  description: "Ketentuan Langganan, Penghapusan Akun, dan Pengembalian Dana PARIBAN Match.",
};

function Bagian({ judul }: { judul: string }) {
  return (
    <div>
      <h2 className="font-heading text-lg font-bold text-foreground mb-2">{judul}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed italic">
        [Konten menyusul]
      </p>
    </div>
  );
}

export default function LanggananPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="mb-10 text-center">
            <p className="mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-brand">
              Legal
            </p>
            <h1 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              Ketentuan Langganan, Penghapusan Akun, dan Pengembalian Dana
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
              Halaman ini sedang disusun. Kerangka bagian di bawah akan diisi
              dengan ketentuan lengkap.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-8">
            <Bagian judul="1. Ketentuan Langganan" />
            <Bagian judul="2. Penghapusan Akun" />
            <Bagian judul="3. Pengembalian Dana (Refund)" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
