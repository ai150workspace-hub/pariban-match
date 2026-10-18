import { NextResponse } from "next/server";
import { loadPeserta } from "@/lib/storage";
import { buatTokenReset } from "@/lib/reset-token";
import { lewatBatas } from "@/lib/rate-limit";
import { BASE_URL, sendResetPassword, sendInfoMasukSosial } from "@/lib/email";

const JEDA_PER_EMAIL_MS = 5 * 60 * 1000; // 1 permintaan per email per 5 menit
const BATAS_PER_IP = 10; // 10 permintaan per IP per jam
const JENDELA_IP_MS = 60 * 60 * 1000;

/**
 * Selalu menjawab sukses yang sama (tidak membocorkan apakah email terdaftar,
 * apakah akunnya punya password, atau apakah permintaan dibatasi). Yang
 * terdaftar dan punya password menerima tautan reset; akun Google/Facebook
 * (tanpa password) menerima email penjelasan TANPA tautan reset.
 */
export async function POST(req: Request) {
  let body: { email: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email diperlukan" }, { status: 400 });
  }

  // Pembatasan per instance (lihat lib/rate-limit.ts). Saat terkena batas
  // jawabannya tetap "ok", hanya emailnya tidak dikirim.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "tanpa-ip";
  if (lewatBatas(`lupa:ip:${ip}`, BATAS_PER_IP, JENDELA_IP_MS) || lewatBatas(`lupa:email:${email}`, 1, JEDA_PER_EMAIL_MS)) {
    return NextResponse.json({ ok: true });
  }

  const list = await loadPeserta();
  const peserta = list.find((p) => p.email.toLowerCase() === email);
  if (!peserta || peserta.banned) {
    return NextResponse.json({ ok: true });
  }

  try {
    if (!peserta.passwordHash) {
      await sendInfoMasukSosial(peserta);
    } else {
      const token = buatTokenReset(peserta.kode, peserta.passwordHash);
      if (!token) {
        console.error("[lupa-password] SESSION_SECRET belum diset — tautan reset tidak bisa dibuat");
      } else {
        await sendResetPassword(peserta, `${BASE_URL}/reset-password?token=${encodeURIComponent(token)}`);
      }
    }
  } catch (e) {
    // Detail kegagalan (pengirim belum terverifikasi dll.) sudah dicatat oleh
    // kirimEmail di lib/email.ts. Jawaban ke pengguna tetap netral.
    console.error(`[lupa-password] email untuk ${peserta.kode} tidak terkirim:`, e instanceof Error ? e.message : e);
  }

  return NextResponse.json({ ok: true });
}
