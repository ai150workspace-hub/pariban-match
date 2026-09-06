import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "pariban_admin";

/**
 * Token admin adalah hash dari ADMIN_PASSWORD saat ini — server bisa
 * memverifikasinya ulang tanpa perlu session store terpisah. Cukup untuk
 * kebutuhan sekarang (satu password admin bersama, bukan akun per-admin).
 */
export function computeAdminToken(): string | null {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return null;
  return createHash("sha256").update(adminPassword).digest("hex");
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  const expected = computeAdminToken();
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
