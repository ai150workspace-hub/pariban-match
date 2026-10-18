import type { Peserta } from "./adat/types";
import { hitungPasangan, topTiga } from "./adat";

/**
 * Apakah `a` dan `b` SALING COCOK: masing-masing masuk top-3 yang lain.
 * Dihitung ulang di server dengan cara yang sama persis seperti hasil
 * matching yang ditampilkan ke peserta (/api/matching/[kode]): akun yang
 * diblokir dikeluarkan lebih dulu, lalu pasangan dihitung dan di-top-3-kan.
 */
export function salingCocok(semua: Peserta[], a: string, b: string): boolean {
  const aktif = semua.filter((p) => !p.banned);
  const top = topTiga(aktif, hitungPasangan(aktif));
  return (top[a] ?? []).some((m) => m.lawan.kode === b && m.saling);
}
