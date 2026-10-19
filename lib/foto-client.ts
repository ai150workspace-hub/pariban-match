/**
 * Utilitas foto SISI KLIEN (dipakai halaman daftar dan halaman hasil).
 *
 * Mengapa ada: fungsi Vercel menolak badan permintaan > 4,5 MB sebelum kode
 * kita jalan, dan foto galeri ponsel sering 3–8 MB. Semua foto — dari galeri
 * MAUPUN kamera aplikasi — diperkecil di perangkat sebelum dikirim, jadi
 * selalu di bawah batas FOTO_BATAS_BYTE (4 MB, sama dengan batas server).
 *
 * Penanda "foto live" (badge Terverifikasi) TIDAK ikut hilang karena
 * kompresi: penandanya adalah field `isLive` pada form upload yang ditentukan
 * dari mana foto diambil (kamera aplikasi atau galeri), bukan metadata di
 * dalam berkas gambar.
 */

export const FOTO_BATAS_BYTE = 4 * 1024 * 1024;
export const FOTO_SISI_MAKS = 1600;
/** Foto asli lebih besar dari ini tidak dicoba didekode (hindari tab kehabisan memori). */
export const FOTO_MENTAH_MAKS_BYTE = 30 * 1024 * 1024;

export const PESAN_FOTO_TERLALU_BESAR =
  "Foto terlalu besar. Pilih foto lain yang lebih kecil (maksimal 4MB), atau ambil foto langsung dengan kamera aplikasi.";

export class FotoError extends Error {
  constructor(public jenis: "terlalu_besar" | "tidak_bisa_dibuka" | "gagal_proses", message: string) {
    super(message);
    this.name = "FotoError";
  }
}

function muatGambar(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("gambar tidak bisa didekode"));
    img.src = url;
  });
}

function keBlobJpeg(canvas: HTMLCanvasElement, kualitas: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", kualitas));
}

/**
 * Perkecil ke sisi terpanjang ≤ FOTO_SISI_MAKS dan kompres ke JPEG (kualitas
 * diturunkan bertahap bila masih > FOTO_BATAS_BYTE). Orientasi EXIF mengikuti
 * browser saat menggambar <img>. Melempar FotoError dengan pesan yang bisa
 * langsung ditampilkan ke pengguna.
 */
export async function kompresFoto(sumber: Blob): Promise<Blob> {
  if (sumber.size > FOTO_MENTAH_MAKS_BYTE) {
    throw new FotoError("terlalu_besar", PESAN_FOTO_TERLALU_BESAR);
  }

  const url = URL.createObjectURL(sumber);
  try {
    let img: HTMLImageElement;
    try {
      img = await muatGambar(url);
    } catch {
      throw new FotoError(
        "tidak_bisa_dibuka",
        "Foto tidak bisa dibuka. Pastikan berformat JPG, PNG, atau WebP, lalu coba lagi.",
      );
    }

    const w0 = img.naturalWidth;
    const h0 = img.naturalHeight;
    if (!w0 || !h0) {
      throw new FotoError("tidak_bisa_dibuka", "Foto tidak bisa dibuka. Coba pilih foto lain.");
    }

    const skala = Math.min(1, FOTO_SISI_MAKS / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * skala));
    const h = Math.max(1, Math.round(h0 * skala));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new FotoError("gagal_proses", "Peramban tidak bisa memproses foto. Coba peramban lain.");
    // Latar putih supaya PNG/WebP transparan tidak menjadi hitam di JPEG.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    for (const kualitas of [0.85, 0.75, 0.65, 0.5]) {
      const hasil = await keBlobJpeg(canvas, kualitas);
      if (hasil && hasil.size <= FOTO_BATAS_BYTE) return hasil;
    }
    throw new FotoError("terlalu_besar", PESAN_FOTO_TERLALU_BESAR);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function blobKeDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error ?? new Error("gagal membaca foto"));
    r.readAsDataURL(blob);
  });
}

// ── Diagnostik kegagalan upload ───────────────────────────────────

export interface GalatUpload {
  /** Kalimat untuk pengguna: apa yang terjadi dan apa yang harus dilakukan. */
  pesan: string;
  /** Detail teknis singkat (jenis exception / kode HTTP) agar penyebab asli terlihat. */
  rincian: string;
}

/** Kegagalan SEBELUM ada balasan HTTP (fetch melempar exception). */
export function jelaskanExceptionUpload(e: unknown): GalatUpload {
  const nama = e instanceof Error ? e.name : typeof e;
  const isi = e instanceof Error ? e.message : String(e);
  const rincian = `${nama}: ${isi}`;

  if (e instanceof FotoError) return { pesan: e.message, rincian };
  if (nama === "NotReadableError" || nama === "NotFoundError") {
    return {
      pesan: "File foto tidak bisa dibaca lagi (mungkin dipindah, dihapus, atau berasal dari penyimpanan awan). Hapus foto ini lalu pilih ulang.",
      rincian,
    };
  }
  if (nama === "AbortError") {
    return { pesan: "Unggahan dibatalkan. Silakan coba lagi.", rincian };
  }
  if (nama === "TypeError") {
    return {
      pesan: "Permintaan tidak sampai ke server: koneksi internet terputus, atau permintaan diblokir (mis. oleh pemblokir iklan/mode privasi). Coba lagi, atau matikan pemblokir untuk situs ini.",
      rincian,
    };
  }
  return { pesan: "Terjadi kesalahan tak terduga saat mengunggah foto. Silakan coba lagi.", rincian };
}

/** Kegagalan dengan balasan HTTP (status bukan 2xx). Membaca isi balasan untuk rincian. */
export async function jelaskanResponUpload(res: Response): Promise<GalatUpload> {
  let teks = "";
  try {
    teks = (await res.text()).slice(0, 200);
  } catch {}
  let pesanServer = "";
  try {
    pesanServer = (JSON.parse(teks) as { error?: string }).error ?? "";
  } catch {}
  const rincian = `HTTP ${res.status} ${res.statusText}`.trim() + (teks ? ` — ${teks}` : "");

  if (res.status === 413) return { pesan: PESAN_FOTO_TERLALU_BESAR, rincian };
  if (res.status === 401) {
    return { pesan: "Sesi login berakhir. Silakan masuk lagi, lalu ulangi unggah foto.", rincian };
  }
  if (res.status === 403) {
    return { pesan: "Akses ditolak (403). Muat ulang halaman atau masuk ulang, lalu coba lagi.", rincian };
  }
  if (res.status >= 500) {
    return { pesan: `Server sedang bermasalah (kode ${res.status}). Coba lagi beberapa saat lagi.`, rincian };
  }
  return { pesan: pesanServer || `Gagal mengunggah foto (kode ${res.status}).`, rincian };
}

/** Catat ke console dengan konteks, supaya penyebab asli bisa dibaca di DevTools. */
export function catatGalatUpload(konteks: Record<string, unknown>, galat: GalatUpload, asli?: unknown) {
  console.error("[upload foto] GAGAL", { ...konteks, rincian: galat.rincian }, asli ?? "");
}
