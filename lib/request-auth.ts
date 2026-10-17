import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminToken } from "@/lib/admin-token";

/**
 * Penjaga akses sementara (tambalan darurat). Cookie peserta `pariban_kode`
 * masih berupa kode mentah yang bisa dipalsukan — ini hanya menutup akses
 * TANPA cookie sama sekali. Cookie sesi bertanda tangan menyusul di tahap
 * berikutnya; cukup ganti isi fungsi di file ini.
 */

export const PESERTA_COOKIE_NAME = "pariban_kode";

export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  return isValidAdminToken(store.get(ADMIN_COOKIE_NAME)?.value);
}

/** True bila cookie admin valid ATAU cookie peserta nilainya sama dengan `kode`. */
export async function canActAs(kode: string): Promise<boolean> {
  const store = await cookies();
  if (isValidAdminToken(store.get(ADMIN_COOKIE_NAME)?.value)) return true;
  const mine = store.get(PESERTA_COOKIE_NAME)?.value;
  return !!mine && mine === kode;
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
