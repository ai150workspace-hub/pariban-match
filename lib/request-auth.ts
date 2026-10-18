import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminToken } from "@/lib/admin-token";
import { PESERTA_COOKIE_NAME, verifikasiSesiPeserta } from "@/lib/session";
import { getStatusAkun } from "@/lib/storage";

/**
 * Penjaga akses. Cookie peserta dan admin adalah sesi BERTANDA TANGAN
 * (lib/session.ts): cookie yang tidak valid, dipalsukan, kedaluwarsa, atau
 * masih berformat lama (kode mentah) dianggap tidak login.
 */

export { PESERTA_COOKIE_NAME };

/**
 * Kode peserta dari sesi yang valid, atau null kalau tidak login. Sesi milik
 * akun yang diblokir atau sudah dihapus juga dianggap tidak login (cookie
 * yang masih sah secara tanda tangan tidak lagi cukup).
 */
export async function getKodeSesi(): Promise<string | null> {
  const store = await cookies();
  const kode = verifikasiSesiPeserta(store.get(PESERTA_COOKIE_NAME)?.value);
  if (!kode) return null;
  try {
    return (await getStatusAkun(kode)) === "ok" ? kode : null;
  } catch (e) {
    // Gagal tertutup: tidak bisa memastikan status akun -> anggap tidak login.
    console.error("Gagal memeriksa status akun untuk sesi:", e);
    return null;
  }
}

export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  return isValidAdminToken(store.get(ADMIN_COOKIE_NAME)?.value);
}

/** True bila sesi admin valid ATAU sesi peserta valid dengan kode sama dengan `kode`. */
export async function canActAs(kode: string): Promise<boolean> {
  if (await isAdminRequest()) return true;
  const mine = await getKodeSesi();
  return !!mine && mine === kode;
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
