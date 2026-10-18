/**
 * Pembatas permintaan sederhana, di MEMORI per instance server.
 *
 * Keterbatasan (disengaja, tanpa tabel): di Vercel tiap instance serverless
 * punya memori sendiri dan bisa dimulai ulang kapan saja, jadi pembatas ini
 * hanya meredam penyalahgunaan yang kasar (mis. membanjiri satu inbox),
 * bukan jaminan keras.
 */
const jejak = new Map<string, number[]>();

/** True bila `kunci` SUDAH mencapai `maks` permintaan dalam `jendelaMs` (permintaan ini tidak dihitung). */
export function lewatBatas(kunci: string, maks: number, jendelaMs: number): boolean {
  const sekarang = Date.now();
  const waktu = (jejak.get(kunci) ?? []).filter((t) => sekarang - t < jendelaMs);
  if (waktu.length >= maks) {
    jejak.set(kunci, waktu);
    return true;
  }
  waktu.push(sekarang);
  jejak.set(kunci, waktu);

  // Bersihkan sesekali supaya memori tidak tumbuh tanpa batas.
  if (jejak.size > 5000) {
    for (const [k, v] of jejak) {
      if (v.every((t) => sekarang - t >= jendelaMs)) jejak.delete(k);
    }
  }
  return false;
}
