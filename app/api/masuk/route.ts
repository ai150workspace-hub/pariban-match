import { NextResponse } from "next/server";
import { loadPeserta } from "@/lib/storage";
import { verifyPassword } from "@/lib/hash";

export async function POST(req: Request) {
  let body: { email: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email diperlukan" }, { status: 400 });
  }

  const list = await loadPeserta();
  const peserta = list.find(
    (p) => p.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!peserta) {
    return NextResponse.json(
      { error: "Email tidak terdaftar. Pastikan email yang kamu masukkan sama dengan saat mendaftar." },
      { status: 404 },
    );
  }

  if (peserta.banned) {
    return NextResponse.json(
      { error: "Akun ini telah diblokir. Hubungi admin untuk informasi lebih lanjut." },
      { status: 403 },
    );
  }

  // Verifikasi password jika akun sudah punya password
  if (peserta.passwordHash) {
    if (!password) {
      return NextResponse.json(
        { error: "Password diperlukan untuk akun ini." },
        { status: 401 },
      );
    }
    const valid = await verifyPassword(password, peserta.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Password salah. Coba lagi." },
        { status: 401 },
      );
    }
  }
  // Akun lama tanpa password: izinkan login hanya dengan email (backward compat)

  return NextResponse.json({ kode: peserta.kode, inisial: peserta.inisial });
}
