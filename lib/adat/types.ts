/** Data peserta yang dibutuhkan engine pencocokan */
export interface Peserta {
  kode: string;
  nama: string;
  email: string;
  wa: string;
  gender: "Perempuan" | "Laki-laki";
  tahunLahir: number;
  kota: string;
  agama: string;
  cariAgama: string;
  suku: string;
  marga: string;
  margaIbu: string;
  subMarga: string;

  // Bibit
  klgBesar: number; // 1-5
  ibadah: string;
  rokok: string;
  alkohol: string;
  anakKe: string;

  // Bebet
  pendidikan: string;
  kerja: string;
  pindah: string;
  ldr: string;

  // Bobot
  timeline: string;
  tabungan: string;
  anak: string;
  ortu: string;

  // Kepribadian
  bahasaKasih: string;
  konflik: string;
  introvert: number; // 1-5

  bolehHubung: string;
  catatan: string;
  inisial: string;
  statusData: string;

  banned?: boolean;       // akun diblokir admin
  foto?: string;          // file extension: "jpg" | "png" | "webp"
  fotoCount?: number;     // jumlah foto yang diunggah
  fotoLiveVerified?: boolean; // apakah foto profil diambil langsung dari kamera
  premium?: boolean;
  premiumExpiry?: string;
  premiumPaket?: "trial" | "3bln" | "6bln";

  // Bio opsional
  pekerjaan?: string;
  jabatan?: string;
  tinggiBadan?: number;
  beratBadan?: "Kurus" | "Sedang" | "Berisi";
  minat?: string[];
  sosmedLinkedIn?: string;
  sosmedInstagram?: string;
  sosmedTikTok?: string;
}

export type StatusAdat = "DIBLOKIR" | "PARIBAN" | "AMAN" | "PERLU_DICEK";

export interface HasilAdat {
  status: StatusAdat;
  label: string;
  alasan: string;
}

export interface SkorRinci {
  bibit: number;
  bebet: number;
  bobot: number;
  kepribadian: number;
  total: number;
}

export interface HasilPasangan {
  a: Peserta;
  b: Peserta;
  adat: HasilAdat;
  skor: number;
  rinci?: SkorRinci;
  blok: boolean;
}

export interface HasilTop {
  lawan: Peserta;
  skor: number;
  adat: HasilAdat;
  saling: boolean;
}
