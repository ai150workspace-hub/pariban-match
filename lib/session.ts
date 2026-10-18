import { createHash, createHmac, timingSafeEqual } from "crypto";

/**
 * Sesi bertanda tangan untuk cookie peserta (`pariban_kode`) dan admin
 * (`pariban_admin`).
 *
 * Format isi cookie: `v1.<subjek>.<exp>.<tanda tangan>`
 *   - subjek : kode peserta (mis. "P006"), atau "admin"
 *   - exp    : waktu kedaluwarsa (detik epoch) — ikut ditandatangani, jadi masa
 *              berlaku ditegakkan SERVER, bukan hanya `maxAge` cookie
 *   - tanda tangan : HMAC-SHA256(SESSION_SECRET, peran + subjek + exp), base64url
 *
 * Peran ("peserta" / "admin") ikut masuk ke tanda tangan, jadi token peserta
 * tidak bisa dipakai sebagai token admin. Tanda tangan admin juga memuat hash
 * ADMIN_PASSWORD, jadi mengganti password admin mencabut semua sesi admin.
 *
 * Cookie lama berisi kode mentah ("P006") tidak berawalan "v1." → otomatis
 * dianggap tidak login. Tanpa SESSION_SECRET, penerbitan gagal dan verifikasi
 * selalu menolak (gagal tertutup, tanpa nilai cadangan).
 */

export const PESERTA_COOKIE_NAME = "pariban_kode";
export const SESI_DURASI_DETIK = 60 * 60 * 24 * 7; // 7 hari

type Peran = "peserta" | "admin";

const VERSI = "v1";

function secret(): string | null {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 16 ? s : null;
}

function tandatangani(peran: Peran, subjek: string, exp: number): string | null {
  const key = secret();
  if (!key) return null;
  let bahan = `${VERSI}.${peran}.${subjek}.${exp}`;
  if (peran === "admin") {
    const pw = process.env.ADMIN_PASSWORD;
    if (!pw) return null;
    bahan += `.${createHash("sha256").update(pw).digest("hex")}`;
  }
  return createHmac("sha256", key).update(bahan).digest("base64url");
}

function buatToken(peran: Peran, subjek: string, now = Date.now()): string | null {
  const exp = Math.floor(now / 1000) + SESI_DURASI_DETIK;
  const sig = tandatangani(peran, subjek, exp);
  return sig ? `${VERSI}.${subjek}.${exp}.${sig}` : null;
}

function verifikasiToken(peran: Peran, token: string | undefined | null, now = Date.now()): string | null {
  if (!token) return null;
  const bagian = token.split(".");
  if (bagian.length !== 4 || bagian[0] !== VERSI) return null;
  const [, subjek, expStr, sig] = bagian;
  const exp = Number(expStr);
  if (!subjek || !Number.isInteger(exp) || exp * 1000 <= now) return null;
  const harapan = tandatangani(peran, subjek, exp);
  if (!harapan) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(harapan);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return subjek;
}

/** Isi cookie sesi peserta, atau null kalau SESSION_SECRET belum diset. */
export function buatSesiPeserta(kode: string): string | null {
  return buatToken("peserta", kode);
}

/** Kode peserta dari cookie yang valid, atau null (tidak login / dipalsukan / kedaluwarsa). */
export function verifikasiSesiPeserta(token: string | undefined | null): string | null {
  return verifikasiToken("peserta", token);
}

export function buatSesiAdmin(): string | null {
  return buatToken("admin", "admin");
}

export function verifikasiSesiAdmin(token: string | undefined | null): boolean {
  return verifikasiToken("admin", token) === "admin";
}

/** Opsi cookie yang sama untuk sesi peserta dan admin. */
export const opsiCookieSesi = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESI_DURASI_DETIK,
  secure: process.env.NODE_ENV === "production",
};
