import type { ReactNode } from "react";

export interface KlausulSyarat {
  judul: string;
  isi: ReactNode;
}

/**
 * Satu sumber teks Syarat & Ketentuan — dipakai di /syarat (halaman publik)
 * dan /persetujuan (dialog persetujuan sebelum daftar).
 */
export const SYARAT_KETENTUAN: KlausulSyarat[] = [
  {
    judul: "1. Kejujuran & Keaslian Data",
    isi: "Saya bersedia mengisi data profil dengan jujur dan apa adanya. Data palsu dapat menyebabkan penghapusan akun secara permanen.",
  },
  {
    judul: "2. Persyaratan Usia & Status",
    isi: (
      <>
        Saya menyatakan bahwa saya berusia <strong>minimal 21 tahun</strong> dan
        berstatus <strong>lajang / single</strong> (belum menikah dan tidak dalam
        hubungan terikat).
      </>
    ),
  },
  {
    judul: "3. Niat Serius",
    isi: "Saya menggunakan PARIBAN Match dengan niat serius untuk menemukan pasangan hidup, bukan sekadar iseng atau mengumpulkan kontak.",
  },
  {
    judul: "4. Sopan Santun & Etika",
    isi: "Saya berjanji untuk menjaga sopan santun, tidak mengirim konten tidak pantas, dan menghormati privasi sesama pengguna.",
  },
  {
    judul: "5. Privasi Data",
    isi: "Saya memahami bahwa data yang saya masukkan akan digunakan untuk proses pencocokan sesuai dengan adat Batak, dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan saya.",
  },
  {
    judul: "6. Trial Gratis & Penyalahgunaan",
    isi: (
      <>
        Trial gratis berlaku <strong>satu kali per pengguna</strong>. PARIBAN
        berhak menghentikan akses atau menonaktifkan akun tanpa pemberitahuan
        sebelumnya apabila terbukti ada penyalahgunaan trial melalui
        pendaftaran berulang — termasuk namun tidak terbatas pada menghapus
        akun lalu mendaftar ulang untuk memperoleh trial baru.
      </>
    ),
  },
  {
    judul: "7. Syarat & Ketentuan Platform",
    isi: "Saya sudah membaca, mengerti, dan setuju dengan seluruh Syarat & Ketentuan yang berlaku di PARIBAN Match.",
  },
];
