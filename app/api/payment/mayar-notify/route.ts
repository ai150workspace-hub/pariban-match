import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { loadPeserta, updatePeserta } from "@/lib/storage";
import { sendKonfirmasiPremium } from "@/lib/email";
import { PAKET_PREMIUM } from "@/lib/pricing";

/**
 * Webhook Mayar.id. Daftarkan URL ini di dashboard Mayar (Integrasi →
 * Webhook) sebagai:
 *   https://www.paribanmatch.id/api/payment/mayar-notify?token=<MAYAR_WEBHOOK_TOKEN>
 *
 * Dokumentasi resmi Mayar tidak menjelaskan skema signature untuk webhook-nya
 * (beda dengan Midtrans yang punya signature_key). Verifikasi di sini pakai
 * token rahasia di query string sebagai gantinya — nilainya harus SAMA
 * persis dengan env var MAYAR_WEBHOOK_TOKEN di Vercel, dan hanya Kakak yang
 * tahu nilainya (generate sendiri, jangan tebakan).
 */

const WEBHOOK_TOKEN = process.env.MAYAR_WEBHOOK_TOKEN ?? "";

function isValidToken(token: string | null): boolean {
  if (!WEBHOOK_TOKEN || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(WEBHOOK_TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Payload "status" pembayaran sukses dari Mayar tidak konsisten di berbagai
 * sumber dokumentasi — kadang boolean, kadang string "SUCCESS". Terima
 * keduanya supaya tidak rapuh terhadap perbedaan versi payload.
 */
function isPaid(status: unknown): boolean {
  if (status === true) return true;
  if (typeof status === "string") {
    return ["SUCCESS", "PAID", "SETTLED"].includes(status.toUpperCase());
  }
  return false;
}

interface MayarWebhookData {
  status?: unknown;
  amount?: number;
  customerEmail?: string;
  customerMobile?: string;
  productName?: string;
  transactionId?: string;
  id?: string;
}

interface MayarWebhookBody {
  event?: string;
  data?: MayarWebhookData;
}

/** Samakan format nomor HP: "+62812...", "62812...", "0812..." -> "0812..." */
function normalizePhone(raw: string | undefined): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return "0" + digits.slice(2);
  if (digits.startsWith("0")) return digits;
  return "0" + digits;
}

/**
 * Tentukan paket dari nominal; kalau tidak persis cocok (mis. nominal sudah
 * ditambah biaya admin/kanal yang ditanggung pembeli), cocokkan dari nama
 * produk Mayar, mis. "PARIBAN Match Premium - 1 Bulan".
 */
function detectPaket(data: MayarWebhookData) {
  const byAmount = PAKET_PREMIUM.find((p) => p.harga === data.amount);
  if (byAmount) return byAmount;
  const m = data.productName?.match(/(\d+)\s*bulan/i);
  if (m) {
    return PAKET_PREMIUM.find((p) => p.nama.toLowerCase() === `${m[1]} bulan`);
  }
  return undefined;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  if (!isValidToken(url.searchParams.get("token"))) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  let body: MayarWebhookBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("Mayar webhook diterima:", body.event, JSON.stringify(body.data));

  // Tombol "TEST URL" di dashboard Mayar mengirim event "testing" dengan data
  // contoh (email & produk palsu). Cukup balas 200 supaya tes lolos — tidak
  // ada yang diaktifkan.
  if (body.event === "testing") {
    return NextResponse.json({ ok: true, test: true });
  }

  const data = body.data;
  if (!data || !isPaid(data.status)) {
    // Event selain pembayaran sukses (mis. payment.reminder) — abaikan
    // tanpa error, supaya Mayar tidak retry terus-menerus.
    return NextResponse.json({ ok: true, skipped: true });
  }

  const email = data.customerEmail?.trim().toLowerCase();
  const phone = normalizePhone(data.customerMobile);
  if (!email && !phone) {
    console.error("Mayar webhook: payload tidak punya customerEmail maupun customerMobile", body);
    return NextResponse.json({ error: "Identitas pembeli tidak ada di payload" }, { status: 400 });
  }

  const peserta = await loadPeserta();
  // Utama: email pembeli = email akun. Cadangan: nomor HP pembeli = nomor WA
  // akun, hanya kalau tepat satu peserta yang cocok.
  let target = email ? peserta.find((p) => p.email.toLowerCase() === email) : undefined;
  if (!target && phone) {
    const byPhone = peserta.filter((p) => normalizePhone(p.wa) === phone);
    if (byPhone.length === 1) target = byPhone[0];
  }
  if (!target) {
    console.error(`Mayar webhook: tidak ada peserta dengan email ${email ?? "-"} / HP ${phone || "-"}`);
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  const paketInfo = detectPaket(data);
  if (!paketInfo) {
    console.error(`Mayar webhook: nominal ${data.amount} / produk "${data.productName}" tidak cocok paket manapun`);
    return NextResponse.json({ error: "Paket tidak dikenali" }, { status: 400 });
  }

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + paketInfo.durasiHari);
  const expiryISO = expiry.toISOString();

  try {
    await updatePeserta(target.kode, {
      premium: true,
      premiumExpiry: expiryISO,
      premiumPaket: paketInfo.id,
    });
    console.log(`Premium aktif untuk ${target.kode} via Mayar (${paketInfo.id}), expiry: ${expiryISO}`);
  } catch (e) {
    console.error("Mayar webhook: gagal update peserta:", e);
    return NextResponse.json({ error: "Gagal update peserta" }, { status: 500 });
  }

  sendKonfirmasiPremium(target, paketInfo.id, expiry).catch((e) =>
    console.error(`Gagal kirim email premium ke ${target.kode}:`, e),
  );

  return NextResponse.json({ ok: true });
}
