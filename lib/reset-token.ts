import { createHash, createHmac, timingSafeEqual } from "crypto";

/**
 * Token reset password: `r1.<kode>.<exp>.<HMAC>`.
 *
 *  - kedaluwarsa 1 jam (exp ikut ditandatangani, ditegakkan server)
 *  - tanda tangan HMAC-SHA256 dengan SESSION_SECRET, domain terpisah dari sesi
 *  - SIDIK JARI hash password saat ini ikut ditandatangani → begitu password
 *    berubah, token lama otomatis tidak sah. Jadi token sekali pakai tanpa
 *    tabel/kolom tambahan.
 *
 * Tanpa SESSION_SECRET token tidak bisa dibuat maupun diverifikasi.
 */

export const RESET_DURASI_DETIK = 60 * 60; // 1 jam
const VERSI = "r1";

function secret(): string | null {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 16 ? s : null;
}

function sidikJari(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 24);
}

function tandatangani(kode: string, exp: number, passwordHash: string): string | null {
  const key = secret();
  if (!key) return null;
  return createHmac("sha256", key)
    .update(`reset.${VERSI}.${kode}.${exp}.${sidikJari(passwordHash)}`)
    .digest("base64url");
}

/** Token reset untuk akun dengan hash password saat ini; null kalau SESSION_SECRET kosong. */
export function buatTokenReset(kode: string, passwordHash: string, now = Date.now()): string | null {
  const exp = Math.floor(now / 1000) + RESET_DURASI_DETIK;
  const sig = tandatangani(kode, exp, passwordHash);
  return sig ? `${VERSI}.${kode}.${exp}.${sig}` : null;
}

/** Kode di dalam token TANPA diverifikasi — hanya untuk mencari akunnya. Jangan dipercaya. */
export function kodeDariTokenReset(token: unknown): string | null {
  if (typeof token !== "string") return null;
  const bagian = token.split(".");
  if (bagian.length !== 4 || bagian[0] !== VERSI || !/^P\d{1,9}$/.test(bagian[1])) return null;
  return bagian[1];
}

/** Benar hanya bila tanda tangan cocok untuk hash password SAAT INI dan belum kedaluwarsa. */
export function tokenResetSah(token: unknown, passwordHash: string, now = Date.now()): boolean {
  const kode = kodeDariTokenReset(token);
  if (!kode || typeof token !== "string") return false;
  const [, , expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!Number.isInteger(exp) || exp * 1000 <= now) return false;
  const harapan = tandatangani(kode, exp, passwordHash);
  if (!harapan) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(harapan);
  return a.length === b.length && timingSafeEqual(a, b);
}
