import { NextResponse } from "next/server";
import { loadPeserta, updatePeserta } from "@/lib/storage";
import { hashPassword } from "@/lib/hash";
import { kodeDariTokenReset, tokenResetSah } from "@/lib/reset-token";
import { lewatBatas } from "@/lib/rate-limit";

const GAGAL_TOKEN = {
  error: "Tautan tidak valid atau sudah kedaluwarsa. Silakan minta tautan reset yang baru.",
};

/**
 * Simpan password baru memakai token dari email. Token hanya sah untuk hash
 * password SAAT INI dan 1 jam, jadi setelah dipakai (password berubah) tautan
 * yang sama tidak bisa dipakai lagi.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "tanpa-ip";
  if (lewatBatas(`reset:ip:${ip}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, password } = body;
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 });
  }
  if (password.length > 200) {
    return NextResponse.json({ error: "Password terlalu panjang" }, { status: 400 });
  }

  const kode = kodeDariTokenReset(token);
  if (!kode) return NextResponse.json(GAGAL_TOKEN, { status: 400 });

  const peserta = (await loadPeserta()).find((p) => p.kode === kode);
  // Akun tidak ada / diblokir / tanpa password → jawaban sama dengan token salah.
  if (!peserta || peserta.banned || !peserta.passwordHash || !tokenResetSah(token, peserta.passwordHash)) {
    return NextResponse.json(GAGAL_TOKEN, { status: 400 });
  }

  try {
    await updatePeserta(kode, { passwordHash: await hashPassword(password) });
  } catch (e) {
    console.error("[reset-password] gagal menyimpan password baru:", e);
    return NextResponse.json({ error: "Gagal menyimpan password. Coba lagi." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
