/**
 * Satu-satunya sumber harga, durasi paket, dan durasi trial.
 * Diimpor oleh: app/hasil/HasilClient.tsx, app/api/payment/create/route.ts,
 * app/api/admin/stats/route.ts, app/harga/page.tsx, lib/membership.ts.
 */

export type PaketId = "1bln" | "3bln" | "6bln";

export interface PaketInfo {
  id: PaketId;
  nama: string;
  deskripsi: string;
  harga: number;
  durasiHari: number;
  hargaCoret: number | null;
  perBulan: number | null;
  hemat: string | null;
  badge: string | null;
}

/** Durasi trial gratis untuk pendaftaran baru. Perubahan nilai ini TIDAK
 * memengaruhi trial yang sudah berjalan — trialEndsAt dihitung dan disimpan
 * sebagai tanggal absolut sekali saat pendaftaran (lihat newTrialExpiry di
 * lib/membership.ts), bukan dihitung ulang dari nilai ini setiap saat. */
export const TRIAL_DURASI_HARI = 14;

export const PAKET_PREMIUM: PaketInfo[] = [
  {
    id: "1bln",
    nama: "1 Bulan",
    deskripsi: "Akses penuh selama 30 hari",
    harga: 19900,
    durasiHari: 30,
    hargaCoret: null,
    perBulan: null,
    hemat: null,
    badge: null,
  },
  {
    id: "3bln",
    nama: "3 Bulan",
    deskripsi: "90 hari akses penuh tanpa batas",
    harga: 49900,
    durasiHari: 90,
    hargaCoret: 59700,
    perBulan: 16633,
    hemat: "Hemat ~16%",
    badge: null,
  },
  {
    id: "6bln",
    nama: "6 Bulan",
    deskripsi: "180 hari akses penuh tanpa batas",
    harga: 89900,
    durasiHari: 180,
    hargaCoret: 119400,
    perBulan: 14983,
    hemat: "Hemat ~25%",
    badge: "Paling Hemat",
  },
];

export function getPaket(id: string): PaketInfo | undefined {
  return PAKET_PREMIUM.find((p) => p.id === id);
}

export function isPaketId(id: string): id is PaketId {
  return PAKET_PREMIUM.some((p) => p.id === id);
}
