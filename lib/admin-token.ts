import { buatSesiAdmin, verifikasiSesiAdmin } from "@/lib/session";

export const ADMIN_COOKIE_NAME = "pariban_admin";

/**
 * Cookie admin = sesi bertanda tangan (lihat lib/session.ts), bukan lagi hash
 * ADMIN_PASSWORD apa adanya. Null kalau SESSION_SECRET / ADMIN_PASSWORD belum diset.
 */
export function computeAdminToken(): string | null {
  return buatSesiAdmin();
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  return verifikasiSesiAdmin(token);
}
