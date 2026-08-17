import { Resend } from "resend";
import type { Peserta } from "./adat/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "PARIBAN <noreply@pariban.id>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// ── Template dasar ──

function wrap(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF6F1;font-family:Arial,'Helvetica Neue',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F1;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">

      <!-- Header -->
      <tr>
        <td style="background:#7A1F2A;border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
          <p style="margin:0;color:#fff;font-size:26px;font-weight:bold;letter-spacing:6px;font-family:Georgia,serif;">PARIBAN</p>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.65);font-size:12px;letter-spacing:1px;">PENCOCOKAN ADAT BATAK</p>
        </td>
      </tr>

      <!-- Content -->
      <tr>
        <td style="background:#fff;padding:40px 40px 36px;">
          ${content}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#F0EBE5;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #E8DDD5;">
          <p style="margin:0;color:#999;font-size:12px;">© ${new Date().getFullYear()} PARIBAN — Pencocokan Adat Batak</p>
          <p style="margin:6px 0 0;color:#bbb;font-size:11px;">Email ini dikirim otomatis. Jangan membalas email ini.</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

function btn(url: string, text: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr>
      <td style="background:#B8860B;border-radius:10px;padding:0;">
        <a href="${url}" style="display:inline-block;padding:14px 32px;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;letter-spacing:0.5px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function kodeBox(kode: string): string {
  return `<div style="background:#FAF6F1;border:2px dashed #B8860B;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
    <p style="margin:0 0 4px;color:#888;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Kode Peserta Anda</p>
    <p style="margin:0;color:#7A1F2A;font-size:32px;font-weight:bold;font-family:'Courier New',monospace;letter-spacing:4px;">${kode}</p>
    <p style="margin:6px 0 0;color:#aaa;font-size:11px;">Simpan kode ini untuk melihat hasil pencocokan Anda</p>
  </div>`;
}

// ── Email 1: Konfirmasi Pendaftaran ──

export async function sendKonfirmasiDaftar(peserta: Peserta): Promise<void> {
  const content = `
    <p style="margin:0 0 8px;color:#7A1F2A;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Pendaftaran Berhasil</p>
    <h1 style="margin:0 0 16px;color:#1A1A1A;font-size:24px;font-family:Georgia,serif;">Selamat datang, ${peserta.inisial}!</h1>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Terima kasih telah mendaftar di PARIBAN. Data Anda telah kami terima dan akan segera diproses oleh tim kami menggunakan sistem pencocokan adat Batak.
    </p>
    ${kodeBox(peserta.kode)}
    <p style="margin:20px 0 0;color:#555;font-size:14px;line-height:1.6;">
      Kami akan mengirimkan email lagi setelah hasil pencocokan siap. Proses biasanya membutuhkan <strong>1–3 hari kerja</strong>.
    </p>
    <p style="margin:12px 0 0;color:#555;font-size:14px;line-height:1.6;">
      Jika ada pertanyaan, balas email ini atau hubungi kami melalui WhatsApp.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to: peserta.email,
    subject: `Kode Peserta PARIBAN Anda: ${peserta.kode}`,
    html: wrap("Konfirmasi Pendaftaran PARIBAN", content),
  });
}

// ── Email 2: Hasil Matching ──

interface MatchRingkas {
  inisial: string;
  marga: string;
  skor: number;
  statusLabel: string;
  saling: boolean;
}

function matchRow(m: MatchRingkas, rank: number): string {
  const salingBadge = m.saling
    ? `<span style="background:#FEF3C7;color:#92400E;font-size:10px;font-weight:bold;padding:2px 8px;border-radius:20px;margin-left:8px;">SALING COCOK ♥</span>`
    : "";
  return `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #F0EAE0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:32px;">
              <div style="width:28px;height:28px;background:#7A1F2A;border-radius:50%;text-align:center;line-height:28px;color:#fff;font-size:12px;font-weight:bold;">${rank}</div>
            </td>
            <td style="padding-left:12px;">
              <p style="margin:0;color:#1A1A1A;font-size:15px;font-weight:bold;">${m.inisial} ${salingBadge}</p>
              <p style="margin:3px 0 0;color:#888;font-size:13px;">${m.marga} · ${m.statusLabel}</p>
            </td>
            <td style="text-align:right;white-space:nowrap;">
              <span style="color:#7A1F2A;font-size:22px;font-weight:bold;">${m.skor}</span>
              <span style="color:#aaa;font-size:12px;">/110</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

export async function sendHasilMatching(
  peserta: Peserta,
  top3: MatchRingkas[],
): Promise<void> {
  const hasilUrl = `${BASE_URL}/hasil/${peserta.kode}`;
  const adaBlur = top3.some((m) => m.skor > 90);

  const matchRows = top3.map((m, i) => matchRow(m, i + 1)).join("");

  const premiumNote = adaBlur
    ? `<div style="background:#FFFBEB;border:1px solid #FCD34D;border-radius:10px;padding:16px;margin:20px 0 0;">
        <p style="margin:0;color:#92400E;font-size:13px;">🔒 <strong>Ada kandidat dengan skor di atas 90</strong> yang tersembunyi di halaman hasil. Upgrade ke PARIBAN Premium untuk membukanya.</p>
       </div>`
    : "";

  const content = `
    <p style="margin:0 0 8px;color:#7A1F2A;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Hasil Pencocokan</p>
    <h1 style="margin:0 0 16px;color:#1A1A1A;font-size:24px;font-family:Georgia,serif;">Hasil Anda sudah siap, ${peserta.inisial}!</h1>
    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
      Sistem pencocokan adat PARIBAN telah memproses data Anda. Berikut pratinjau 3 kandidat teratas:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8DDD5;border-radius:12px;overflow:hidden;">
      <tr><td style="background:#F8F3EE;padding:12px 16px;border-bottom:1px solid #E8DDD5;">
        <p style="margin:0;color:#888;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Top 3 Kecocokan</p>
      </td></tr>
      ${matchRows || `<tr><td style="padding:24px;text-align:center;color:#aaa;">Belum ada pasangan yang memenuhi syarat adat.</td></tr>`}
    </table>

    ${premiumNote}
    ${btn(hasilUrl, "Lihat Hasil Lengkap →")}

    <p style="margin:20px 0 0;color:#aaa;font-size:12px;line-height:1.6;">
      Atau salin link ini ke browser: <span style="color:#7A1F2A;">${hasilUrl}</span>
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to: peserta.email,
    subject: `Hasil Pencocokan PARIBAN ${peserta.kode} Sudah Siap!`,
    html: wrap("Hasil Pencocokan PARIBAN", content),
  });
}

// ── Email 3: Konfirmasi Premium ──

const NAMA_PAKET: Record<string, string> = {
  trial: "Promo Launch 1 Bulan",
  "3bln": "3 Bulan",
  "6bln": "6 Bulan",
};

export async function sendKonfirmasiPremium(
  peserta: Peserta,
  paket?: string,
  expiry?: Date,
): Promise<void> {
  const hasilUrl = `${BASE_URL}/hasil/${peserta.kode}`;
  const namaPaket = paket ? NAMA_PAKET[paket] ?? paket : "Premium";
  const expiryStr = expiry
    ? expiry.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const content = `
    <p style="margin:0 0 8px;color:#B8860B;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">★ Premium Aktif</p>
    <h1 style="margin:0 0 16px;color:#1A1A1A;font-size:24px;font-family:Georgia,serif;">Selamat, ${peserta.inisial}!</h1>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Pembayaran Anda telah berhasil diproses. Akses <strong>PARIBAN Premium — ${namaPaket}</strong> kini aktif — Anda dapat melihat seluruh hasil pencocokan tanpa batas.
    </p>

    <div style="background:#FFFBF0;border:1px solid #B8860B;border-radius:12px;padding:24px;text-align:center;">
      <p style="margin:0 0 4px;color:#B8860B;font-size:28px;">★</p>
      <p style="margin:0;color:#7A1F2A;font-size:18px;font-weight:bold;font-family:Georgia,serif;">PARIBAN Premium</p>
      <p style="margin:6px 0 0;color:#888;font-size:13px;">Paket: ${namaPaket}</p>
      ${expiryStr ? `<p style="margin:4px 0 0;color:#aaa;font-size:12px;">Berlaku hingga: ${expiryStr}</p>` : ""}
    </div>

    ${btn(hasilUrl, "Lihat Hasil Tanpa Blur →")}
  `;

  await resend.emails.send({
    from: FROM,
    to: peserta.email,
    subject: "PARIBAN Premium Aktif — Selamat!",
    html: wrap("PARIBAN Premium Aktif", content),
  });
}

// ── Email 4: Notifikasi Pesan Baru ──

export async function sendNotifikasiPesan(
  penerima: Peserta,
  pengirimInisial: string,
  chatUrl: string,
): Promise<void> {
  const content = `
    <p style="margin:0 0 8px;color:#7A1F2A;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Pesan Baru</p>
    <h1 style="margin:0 0 16px;color:#1A1A1A;font-size:24px;font-family:Georgia,serif;">Ada pesan dari ${pengirimInisial}</h1>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      <strong>${pengirimInisial}</strong> telah mengirim pesan baru kepada Anda di PARIBAN. Buka aplikasi untuk melihat dan membalas pesan.
    </p>

    <div style="background:#FAF6F1;border-left:4px solid #B8860B;border-radius:4px;padding:16px 20px;">
      <p style="margin:0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Dari</p>
      <p style="margin:4px 0 0;color:#1A1A1A;font-size:17px;font-weight:bold;">${pengirimInisial}</p>
    </div>

    ${btn(chatUrl, "Buka Percakapan →")}

    <p style="margin:20px 0 0;color:#aaa;font-size:12px;">
      Jika kamu tidak mengenali pengirim ini, kamu dapat melaporkan percakapan dari dalam aplikasi.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to: penerima.email,
    subject: `Pesan baru dari ${pengirimInisial} di PARIBAN`,
    html: wrap("Pesan Baru di PARIBAN", content),
  });
}
