import { NextResponse } from "next/server";
import { loadPeserta } from "@/lib/storage";
import { PAKET_PREMIUM, isPaketId, type PaketId } from "@/lib/pricing";

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? "";
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

const SNAP_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";

type Paket = PaketId;

export async function POST(req: Request) {
  if (!SERVER_KEY) {
    return NextResponse.json(
      { error: "Server key Midtrans belum dikonfigurasi" },
      { status: 500 },
    );
  }

  let body: { kode: string; paket: Paket };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { kode, paket } = body;
  if (!kode) return NextResponse.json({ error: "Kode peserta diperlukan" }, { status: 400 });
  if (!paket || !isPaketId(paket)) {
    return NextResponse.json({ error: "Paket tidak valid (1bln/3bln/6bln)" }, { status: 400 });
  }

  const peserta = await loadPeserta();
  const target = peserta.find((p) => p.kode === kode);
  if (!target) return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });

  // Cek apakah sudah punya premium berbayar yang masih aktif
  const premiumAktif =
    target.premium &&
    (!target.premiumExpiry || new Date(target.premiumExpiry) > new Date());
  if (premiumAktif) {
    return NextResponse.json({ error: "Peserta sudah memiliki premium berbayar yang aktif" }, { status: 400 });
  }

  const paketInfo = PAKET_PREMIUM.find((p) => p.id === paket)!;
  const harga = paketInfo.harga;
  const orderId = `PARIBAN-${kode}-${paket}-${Date.now()}`;
  const auth = Buffer.from(SERVER_KEY + ":").toString("base64");

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: harga,
    },
    customer_details: {
      first_name: target.inisial,
      email: target.email,
      phone: target.wa,
    },
    item_details: [
      {
        id: `PARIBAN-PREMIUM-${paket.toUpperCase()}`,
        price: harga,
        quantity: 1,
        name: `PARIBAN Premium — ${paketInfo.nama}`,
      },
    ],
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/hasil?payment=success`,
    },
  };

  const res = await fetch(SNAP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Midtrans error:", err);
    return NextResponse.json({ error: "Gagal membuat transaksi Midtrans" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({ snapToken: data.token, orderId });
}
