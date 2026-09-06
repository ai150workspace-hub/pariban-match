import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Ketentuan Langganan — PARIBAN",
  description: "Ketentuan Langganan, Penghapusan Akun, dan Pengembalian Dana PARIBAN Match.",
};

function Bagian({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-heading text-lg font-bold text-foreground mb-2">{judul}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
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
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-8">
            <Bagian judul="1. Sifat Langganan">
              <p>
                Paket dibeli untuk satu periode tertentu (30, 90, atau 180 hari)
                dengan pembayaran sekali di muka. Tidak ada perpanjangan otomatis
                dan tidak ada penagihan berulang.
              </p>
              <p>
                Trial gratis 14 hari tidak berubah menjadi berlangganan berbayar
                secara otomatis; setelah masa trial berakhir, akses premium
                berhenti dan pengguna dapat membeli paket secara manual bila ingin
                melanjutkan. Trial berlaku satu kali per pengguna.
              </p>
            </Bagian>

            <Bagian judul="2. Menghentikan Langganan">
              <p>
                Karena tidak ada perpanjangan otomatis, pelanggan tidak perlu
                melakukan pembatalan. Jika ingin berhenti sebelum masa aktif
                berakhir, pelanggan cukup berhenti menggunakan layanan atau
                menghapus akunnya. Akses tetap berlaku sampai masa aktif habis dan
                tidak ada penagihan lanjutan.
              </p>
            </Bagian>

            <Bagian judul="3. Penghapusan Akun">
              <p>
                Pelanggan berhak menghapus akun beserta data pribadinya kapan
                saja, sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data
                Pribadi. Permohonan dapat diajukan melalui menu penghapusan akun
                di halaman hasil, atau melalui email{" "}
                <a href="mailto:financepariban@gmail.com" className="text-brand hover:underline">
                  financepariban@gmail.com
                </a>
                , dan diproses paling lama 30 hari kalender.
              </p>
              <p>
                <strong className="text-foreground">Data yang dihapus:</strong> profil, marga,
                preferensi pasangan, hasil pencocokan, foto, dan riwayat percakapan.
              </p>
              <p>
                <strong className="text-foreground">Data yang tetap disimpan:</strong> catatan
                penghapusan akun (nama, marga, alasan) untuk keperluan audit
                internal, serta catatan transaksi pembayaran yang tersimpan pada
                sistem penyedia layanan pembayaran (Midtrans) sesuai kewajiban
                pembukuan dan perpajakan.
              </p>
              <p>
                Penghapusan akun bersifat permanen. Masa aktif langganan yang
                tersisa hangus dan tidak dikembalikan dalam bentuk uang.
              </p>
            </Bagian>

            <Bagian judul="4. Pengembalian Dana">
              <p>
                Pembelian bersifat final. Pengembalian dana hanya diberikan pada
                kondisi berikut:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Pembayaran berhasil tetapi akses premium tidak aktif dan tidak dapat diperbaiki dalam 3 hari kerja</li>
                <li>Terjadi tagihan ganda atas satu pesanan yang sama</li>
                <li>Layanan tidak dapat diakses secara total karena kegagalan sistem selama lebih dari 3 hari berturut-turut</li>
              </ul>
              <p>
                Permohonan diajukan paling lambat 7 hari sejak pembayaran melalui{" "}
                <a href="mailto:financepariban@gmail.com" className="text-brand hover:underline">
                  financepariban@gmail.com
                </a>{" "}
                atau WhatsApp{" "}
                <a href="https://wa.me/6285275157574" className="text-brand hover:underline">
                  +62 852-7515-7574
                </a>
                , disertai nomor pesanan. Dana dikembalikan ke metode pembayaran
                asal dalam 14 hari kerja setelah disetujui.
              </p>
              <p>
                Di luar kondisi tersebut pengembalian dana tidak diberikan,
                termasuk apabila pelanggan berubah pikiran, tidak menemukan
                kandidat yang sesuai, atau tidak menggunakan layanan selama masa
                aktif. PARIBAN menyediakan akses terhadap layanan pencocokan,
                bukan jaminan atas hasil tertentu.
              </p>
            </Bagian>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Pertanyaan lebih lanjut? Lihat halaman{" "}
            <Link href="/kontak" className="text-brand hover:underline">Kontak</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
