import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { StatusAdatBadge } from "@/components/ui/status-adat-badge";

const STEPS = [
  {
    num: "1",
    title: "Isi Formulir",
    desc: "Lengkapi data diri, marga, dan preferensi pasangan hidup Anda dalam formulir yang mudah dipahami.",
  },
  {
    num: "2",
    title: "Cek Kesesuaian Adat",
    desc: "Sistem memeriksa 22 aturan adat Batak secara otomatis — semarga, padan, dongan sabutuha, dan lainnya.",
  },
  {
    num: "3",
    title: "Lihat Hasil Matching",
    desc: "Dapatkan 3 rekomendasi terbaik dengan skor kompatibilitas dari 4 pilar penilaian.",
  },
];

const PILARS = [
  {
    name: "Bibit",
    score: 30,
    desc: "Latar keluarga, ibadah, gaya hidup",
    color: "text-primary",
    bar: "bg-primary",
  },
  {
    name: "Bebet",
    score: 20,
    desc: "Pendidikan, pekerjaan, mobilitas",
    color: "text-accent",
    bar: "bg-accent",
  },
  {
    name: "Bobot",
    score: 30,
    desc: "Timeline, kesiapan finansial, visi anak",
    color: "text-adat-aman",
    bar: "bg-adat-aman",
  },
  {
    name: "Kepribadian",
    score: 20,
    desc: "Bahasa kasih, gaya konflik, introvert",
    color: "text-[#604AA6]",
    bar: "bg-[#604AA6]",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary via-[#5A1720] to-[#331014] text-white">
          <div className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-20 pt-28 text-center sm:pt-36">
            <div className="mb-6 h-1 w-24 rounded-full bg-accent" />
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] uppercase text-accent">
              Pencocokan Adat Batak
            </p>
            <h1 className="font-heading text-6xl font-bold tracking-[0.04em] sm:text-8xl">
              PARIBAN
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75 sm:text-xl">
              Platform kesiapan menikah untuk masyarakat Batak yang menghormati
              adat
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/daftar"
                className="inline-flex h-12 items-center rounded-xl bg-accent px-10 text-lg font-semibold text-white hover:bg-accent/90 transition-colors"
              >
                Daftar Sekarang
              </Link>
              <Link
                href="/masuk"
                className="inline-flex h-12 items-center rounded-xl border border-primary/30 bg-card px-8 text-base font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                Sudah Daftar? Lihat Hasil →
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-14 flex justify-center gap-20">
              {[
                ["255", "Marga Terverifikasi"],
                ["22", "Aturan Adat"],
              ].map(([num, label]) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-bold text-accent sm:text-4xl">
                    {num}
                  </p>
                  <p className="mt-1 text-sm text-white/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cara Kerja ── */}
        <section id="cara-kerja" className="bg-card py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-16 text-center">
              <p className="mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                Cara Kerja
              </p>
              <h2 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                Tiga Langkah Sederhana
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
                Proses yang dirancang agar mudah dan menghormati nilai-nilai adat
                Batak
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div
                  key={s.num}
                  className="flex flex-col items-center rounded-2xl border border-border bg-secondary/50 px-8 pb-10 pt-10 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                    {s.num}
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4 Pilar ── */}
        <section id="pilar" className="bg-secondary/60 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-16 text-center">
              <p className="mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                Sistem Penilaian
              </p>
              <h2 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                Empat Pilar Penilaian
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PILARS.map((p) => (
                <div
                  key={p.name}
                  className="rounded-2xl border border-border bg-card px-7 pb-8 pt-8"
                >
                  <div className={`mb-4 h-1 w-16 rounded-full ${p.bar}`} />
                  <p className={`text-5xl font-bold ${p.color}`}>{p.score}</p>
                  <h3 className="mt-4 text-lg font-bold text-foreground">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Status Adat Preview ── */}
        <section className="bg-card py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-12 text-center">
              <p className="mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                Gerbang Adat
              </p>
              <h2 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                Empat Status Kesesuaian
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
                Setiap pasangan diperiksa melalui 22 aturan adat Batak dan
                mendapat salah satu status berikut
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  status: "AMAN" as const,
                  title: "Sesuai Adat",
                  desc: "Tidak ditemukan larangan adat antara kedua marga.",
                },
                {
                  status: "PARIBAN" as const,
                  title: "Marpariban",
                  desc: "Hubungan pariban yang dianjurkan dalam adat Batak.",
                },
                {
                  status: "PERLU_DICEK" as const,
                  title: "Perlu Dicek",
                  desc: "Ada catatan yang perlu dikonfirmasi ke keluarga.",
                },
                {
                  status: "DIBLOKIR" as const,
                  title: "Diblokir Adat",
                  desc: "Terdapat larangan adat yang tidak dapat dilanggar.",
                },
              ].map((item) => (
                <div
                  key={item.status}
                  className="flex flex-col items-center rounded-2xl border border-border bg-secondary/30 p-8 text-center"
                >
                  <StatusAdatBadge status={item.status} />
                  <h3 className="mt-4 text-lg font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-brand-maroon py-12 text-center">
          <p className="text-2xl font-bold tracking-[0.15em] text-brand-cream">
            PARIBAN
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/50">
            Platform kesiapan menikah untuk masyarakat Batak.
            <br />
            Dibuat dengan menghormati adat dan budaya Batak.
          </p>
          <p className="mt-6 text-xs text-white/55">
            &copy; 2026 PARIBAN. Hak cipta dilindungi.
          </p>
        </footer>
      </main>
    </>
  );
}
