import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { loadPeserta } from "@/lib/storage";
import { buatSesiPeserta, opsiCookieSesi } from "@/lib/session";

/**
 * Masuk lewat Google/Facebook. Email diambil dari sesi NextAuth yang
 * diverifikasi SERVER (cookie JWT NextAuth), bukan dari body permintaan —
 * jadi tidak bisa dipakai untuk masuk sebagai email orang lain.
 *
 * 404 = login OAuth valid tapi emailnya belum terdaftar di PARIBAN
 * (halaman callback lalu mengarahkan ke pendaftaran).
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Sesi login Google/Facebook tidak ditemukan." }, { status: 401 });
  }

  const list = await loadPeserta();
  const peserta = list.find((p) => p.email.toLowerCase() === email);
  if (!peserta) {
    return NextResponse.json({ error: "Email belum terdaftar", terdaftar: false }, { status: 404 });
  }

  if (peserta.banned) {
    return NextResponse.json(
      { error: "Akun ini telah diblokir. Hubungi admin untuk informasi lebih lanjut." },
      { status: 403 },
    );
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
