import { NextResponse } from "next/server";
import { loadPeserta } from "@/lib/storage";
import { buatSesiPeserta, opsiCookieSesi } from "@/lib/session";
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

  // Akun tanpa password (daftar lewat Google/Facebook) TIDAK boleh masuk hanya
  // dengan email — siapa pun bisa mengetik email orang lain. Mereka masuk lewat
  // tombol Google/Facebook (POST /api/masuk/oauth, identitasnya diverifikasi server).
  if (!peserta.passwordHash) {
    return NextResponse.json(
      { error: "Akun ini terdaftar lewat Google/Facebook. Silakan masuk dengan tombol Google atau Facebook." },
      { status: 401 },
    );
  }

  // Verifikasi password
  {
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

  const sesi = buatSesiPeserta(peserta.kode);
  if (!sesi) {
    console.error("SESSION_SECRET belum diset — tidak bisa menerbitkan sesi");
    return NextResponse.json({ error: "Server belum siap, coba lagi nanti." }, { status: 500 });
  }
  const res = NextResponse.json({ kode: peserta.kode, inisial: peserta.inisial });
  res.cookies.set("pariban_kode", sesi, opsiCookieSesi);
  return res;
}
