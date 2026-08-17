import { NextResponse } from "next/server";
import { loadPeserta } from "@/lib/storage";

export async function POST(req: Request) {
  let body: { email: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = body;
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email diperlukan" }, { status: 400 });
  }

  const list = await loadPeserta();
  const peserta = list.find(
    (p) => p.email.toLowerCase() === email.trim().toLowerCase(),
  );

  // Selalu return sukses agar tidak mengekspos apakah email terdaftar
  if (!peserta) {
    return NextResponse.json({ ok: true });
  }

  // Kirim email reset password jika Resend dikonfigurasi
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://pariban-match.vercel.app";
    // Token sederhana: base64 dari kode + timestamp (expire 1 jam)
    const token = Buffer.from(`${peserta.kode}:${Date.now()}`).toString("base64url");
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await resend.emails.send({
      from: "PARIBAN <noreply@resend.dev>",
      to: email.trim(),
      subject: "Reset Password PARIBAN",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <p style="font-size:22px;font-weight:700;color:#7A1E28">PARIBAN</p>
          <h2 style="font-size:18px;margin-top:24px">Reset Password</h2>
          <p style="color:#555;line-height:1.6">
            Halo ${peserta.inisial},<br/>
            Kami menerima permintaan reset password untuk akun Anda.
          </p>
          <a href="${resetUrl}" style="display:inline-block;margin:24px 0;background:#7A1E28;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px">
            Reset Password Saya
          </a>
          <p style="color:#888;font-size:12px">Tautan ini berlaku selama 1 jam. Jika Anda tidak meminta reset, abaikan email ini.</p>
        </div>
      `,
    });
  } catch (e) {
    console.error("Gagal kirim email reset:", e);
    // Tetap return sukses agar UX konsisten
  }

  return NextResponse.json({ ok: true });
}
