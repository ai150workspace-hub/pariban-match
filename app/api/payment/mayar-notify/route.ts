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

interface MayarWebhookBody {
  event?: string;
  data?: {
    status?: unknown;
    amount?: number;
    customerEmail?: string;
    transactionId?: string;
    id?: string;
  };
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

  const data = body.data;
  if (!data || !isPaid(data.status)) {
    // Event selain pembayaran sukses (mis. payment.reminder) — abaikan
    // tanpa error, supaya Mayar tidak retry terus-menerus.
    return NextResponse.json({ ok: true, skipped: true });
  }

  const email = data.customerEmail?.trim().toLowerCase();
  if (!email) {
    console.error("Mayar webhook: payload tidak punya customerEmail", body);
    return NextResponse.json({ error: "customerEmail tidak ada di payload" }, { status: 400 });
  }

  const peserta = await loadPeserta();
  const target = peserta.find((p) => p.email.toLowerCase() === email);
  if (!target) {
    console.error(`Mayar webhook: tidak ada peserta dengan email ${email}`);
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  const paketInfo = PAKET_PREMIUM.find((p) => p.harga === data.amount);
  if (!paketInfo) {
    console.error(`Mayar webhook: nominal ${data.amount} tidak cocok paket manapun`);
    return NextResponse.json({ error: "Nominal tidak dikenali" }, { status: 400 });
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
