import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SYARAT_KETENTUAN } from "@/lib/content/syarat";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — PARIBAN",
  description: "Syarat & Ketentuan penggunaan platform PARIBAN Match.",
};

export default function SyaratPage() {
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
              Syarat & Ketentuan
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
              Berlaku untuk semua pengguna PARIBAN Match. Dengan mendaftar dan
              menggunakan platform ini, Anda dianggap sudah membaca dan
              menyetujui ketentuan berikut.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
            {SYARAT_KETENTUAN.map((k) => (
              <div key={k.judul}>
                <p className="font-semibold text-foreground mb-1">{k.judul}</p>
                <p>{k.isi}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
