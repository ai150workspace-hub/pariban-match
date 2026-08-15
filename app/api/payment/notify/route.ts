import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { updatePeserta, loadPeserta } from "@/lib/storage";
import { sendKonfirmasiPremium } from "@/lib/email";

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? "";

const DURASI_HARI: Record<string, number> = {
  trial: 30,
  "3bln": 90,
  "6bln": 180,
};

export async function POST(req: Request) {
  let body: {
    order_id: string;
    status_code: string;
    gross_amount: string;
    transaction_status: string;
    fraud_status?: string;
    signature_key: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { order_id, status_code, gross_amount, transaction_status, fraud_status, signature_key } = body;

  // Verifikasi signature Midtrans
  const raw = order_id + status_code + gross_amount + SERVER_KEY;
  const expected = createHash("sha512").update(raw).digest("hex");
  if (expected !== signature_key) {
    console.warn("Midtrans signature mismatch:", { order_id });
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const berhasil =
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept");

  if (!berhasil) {
    return NextResponse.json({ ok: true, status: transaction_status });
  }

  // Format order_id: PARIBAN-P001-trial-1234567890
  const parts = order_id.split("-");
  const kode = parts[1];   // P001
  const paket = parts[2];  // trial | 3bln | 6bln

  if (!kode || !kode.startsWith("P")) {
    console.error("Tidak bisa parse kode dari order_id:", order_id);
    return NextResponse.json({ error: "Invalid order_id format" }, { status: 400 });
  }

  const durasi = DURASI_HARI[paket] ?? 30;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + durasi);
  const expiryISO = expiry.toISOString();

  try {
    await updatePeserta(kode, {
      premium: true,
      premiumExpiry: expiryISO,
      premiumPaket: paket as "trial" | "3bln" | "6bln",
    });
    console.log(`Premium aktif untuk ${kode} via ${paket}, expiry: ${expiryISO}`);
  } catch (e) {
    console.error("Gagal update premium:", e);
    return NextResponse.json({ error: "Gagal update peserta" }, { status: 500 });
  }

  loadPeserta()
    .then((list) => list.find((p) => p.kode === kode))
    .then((p) => p && sendKonfirmasiPremium(p, paket, expiry))
    .catch((e) => console.error(`Gagal kirim email premium ke ${kode}:`, e));

  return NextResponse.json({ ok: true });
}
