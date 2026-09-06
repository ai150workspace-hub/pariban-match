import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — PARIBAN",
  description: "Kebijakan privasi PARIBAN Match: data apa yang kami kumpulkan, untuk apa, dan hak Anda.",
};

function Bagian({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-heading text-lg font-bold text-foreground mb-2">{judul}</h2>
      <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

export default function PrivasiPage() {
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
              Kebijakan Privasi
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
              Disusun mengacu pada Undang-Undang No. 27 Tahun 2022 tentang
              Pelindungan Data Pribadi (UU PDP).
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-8">
            <Bagian judul="1. Data yang Kami Kumpulkan">
              <p>Saat mendaftar dan menggunakan PARIBAN Match, kami mengumpulkan:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Data identitas: nama, email, nomor WhatsApp, tahun lahir, jenis kelamin, kota domisili</li>
                <li>Data adat & agama: suku, marga, marga ibu, sub-marga, agama, preferensi agama pasangan</li>
                <li>Data latar belakang: pendidikan, pekerjaan, jabatan, status ibadah, kebiasaan merokok/alkohol, posisi dalam keluarga</li>
                <li>Preferensi & kesiapan menikah: rencana pindah kota, kesediaan LDR, target waktu menikah, tabungan, rencana anak, rencana tinggal setelah menikah</li>
                <li>Data kepribadian: bahasa kasih, gaya menghadapi konflik, skala introvert-ekstrovert</li>
                <li>Bio opsional: tinggi/berat badan, minat & hobi, akun LinkedIn/Instagram/TikTok, deskripsi diri</li>
                <li>Foto profil (wajib minimal 3), termasuk penanda apakah foto diambil langsung dari kamera (live) untuk verifikasi keaslian</li>
                <li>Kata sandi akun (disimpan dalam bentuk hash, bukan teks asli)</li>
                <li>Jika mendaftar lewat Google/Facebook: nama dan email dari akun tersebut</li>
                <li>Riwayat percakapan dengan kandidat yang saling cocok (isi pesan, waktu kirim)</li>
                <li>Data transaksi pembayaran: paket yang dibeli dan status aktif langganan (nomor kartu/rekening tidak pernah kami terima atau simpan — proses pembayaran ditangani langsung oleh Midtrans)</li>
              </ul>
            </Bagian>

            <Bagian judul="2. Untuk Apa Data Ini Digunakan">
              <ul className="list-disc pl-5 space-y-1">
                <li>Menjalankan sistem pencocokan (matching) berdasarkan 22 aturan adat Batak dan skor kompatibilitas 4 pilar (Bibit, Bebet, Bobot, Kepribadian)</li>
                <li>Menampilkan profil Anda kepada kandidat yang cocok, dan sebaliknya</li>
                <li>Memverifikasi identitas saat login dan mencegah penyalahgunaan akun</li>
                <li>Memproses pembayaran langganan premium</li>
                <li>Mengirim email terkait akun (konfirmasi pendaftaran, notifikasi pesan masuk, konfirmasi pembayaran, reset password)</li>
                <li>Menjaga keamanan platform, termasuk menindak pelaporan penyalahgunaan antar-pengguna</li>
              </ul>
            </Bagian>

            <Bagian judul="3. Dibagikan kepada Siapa">
              <p>Kami tidak menjual data Anda. Data dibagikan secara terbatas kepada pihak yang membantu kami menjalankan layanan:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-foreground">Supabase</strong> — penyedia basis data dan penyimpanan foto profil kami</li>
                <li><strong className="text-foreground">Midtrans</strong> — payment gateway yang memproses pembayaran langganan; kami hanya mengirim nama, email, dan nomor WhatsApp untuk keperluan transaksi, tidak pernah data kartu/rekening</li>
                <li><strong className="text-foreground">Google / Facebook</strong> — jika Anda memilih mendaftar/masuk lewat akun tersebut</li>
                <li><strong className="text-foreground">Resend</strong> — layanan pengiriman email transaksional kami</li>
                <li>Kandidat lain di platform — inisial nama, foto, dan sebagian profil ditampilkan kepada peserta yang cocok dengan Anda sebagai bagian inti dari fitur pencocokan</li>
              </ul>
              <p className="mt-2">
                Catatan teknis: foto profil disimpan di storage privat, bukan publik. Setiap kali foto ditampilkan di aplikasi, server kami membuatkan tautan sementara (signed URL) yang otomatis kedaluwarsa dalam 1 jam — bukan tautan permanen yang bisa diakses langsung dari internet.
              </p>
            </Bagian>

            <Bagian judul="4. Berapa Lama Data Disimpan">
              <p>
                Data profil disimpan selama akun Anda aktif. Jika Anda menghapus akun
                melalui fitur "Hapus Akun" di halaman Hasil, data profil, foto, dan
                riwayat chat Anda dihapus secara permanen dari sistem kami.
              </p>
              <p>
                Pengecualian: saat Anda menghapus akun, kami mencatat nama, marga, dan
                alasan penghapusan (dan catatan tambahan jika memilih "Lainnya") ke
                dalam log internal untuk keperluan evaluasi produk. Catatan ini{" "}
                <strong className="text-foreground">tidak menyertakan email, nomor WhatsApp, kata sandi, atau foto Anda</strong>,
                dan saat ini disimpan tanpa batas waktu penghapusan otomatis.
              </p>
            </Bagian>

            <Bagian judul="5. Hak Anda">
              <ul className="list-disc pl-5 space-y-1">
                <li>Melihat dan memperbarui sebagian data profil Anda sendiri melalui aplikasi</li>
                <li>Menghapus akun dan seluruh data profil, foto, serta riwayat chat Anda kapan saja, secara mandiri, tanpa perlu menghubungi kami</li>
                <li>Meminta salinan atau penjelasan lebih lanjut atas data yang kami simpan dengan menghubungi kami (lihat halaman Kontak)</li>
              </ul>
            </Bagian>

            <Bagian judul="6. Cara Menghubungi Kami">
              <p>
                Pertanyaan seputar data pribadi dan privasi dapat disampaikan melalui
                halaman{" "}
                <a href="/kontak" className="text-brand hover:underline">Kontak</a>.
              </p>
            </Bagian>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
