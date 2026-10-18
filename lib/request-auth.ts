import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminToken } from "@/lib/admin-token";
import { PESERTA_COOKIE_NAME, verifikasiSesiPeserta } from "@/lib/session";

/**
 * Penjaga akses. Cookie peserta dan admin adalah sesi BERTANDA TANGAN
 * (lib/session.ts): cookie yang tidak valid, dipalsukan, kedaluwarsa, atau
 * masih berformat lama (kode mentah) dianggap tidak login.
 */

export { PESERTA_COOKIE_NAME };

/** Kode peserta dari sesi yang valid, atau null kalau tidak login. */
export async function getKodeSesi(): Promise<string | null> {
  const store = await cookies();
  return verifikasiSesiPeserta(store.get(PESERTA_COOKIE_NAME)?.value);
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
