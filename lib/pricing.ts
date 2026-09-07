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
  perBulan: number | null;
  badge: string | null;
  /** Link Pembayaran Mayar.id statis untuk paket ini. */
  mayarLink: string;
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
    perBulan: null,
    badge: null,
    mayarLink: "https://pariban-match.myr.id/pl/pariban-match-premium-1-bulan",
  },
  {
    id: "3bln",
    nama: "3 Bulan",
    deskripsi: "90 hari akses penuh tanpa batas",
    harga: 49900,
    durasiHari: 90,
    perBulan: 16633,
    badge: null,
    mayarLink: "https://pariban-match.myr.id/pl/pariban-match-premium-3-bulan",
  },
  {
    id: "6bln",
    nama: "6 Bulan",
    deskripsi: "180 hari akses penuh tanpa batas",
    harga: 89900,
    durasiHari: 180,
    perBulan: 14983,
    badge: "Paling Hemat",
    mayarLink: "https://pariban-match.myr.id/pl/pariban-match-premium-6-bulan",
  },
];

export function getPaket(id: string): PaketInfo | undefined {
  return PAKET_PREMIUM.find((p) => p.id === id);
}

export function isPaketId(id: string): id is PaketId {
  return PAKET_PREMIUM.some((p) => p.id === id);
}
