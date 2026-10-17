import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { loadPeserta } from "@/lib/storage";
import { PAKET_PREMIUM } from "@/lib/pricing";
import {
  simpanTransaksi,
  updateTransaksi,
  type TransaksiStatus,
} from "@/lib/transaksi";
import { aktifkanPremiumUntukTransaksi } from "@/lib/aktivasi-premium";

const PROVIDER = "mayar";

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
 *
 * Mayar (per dokumentasi) hanya menyediakan kolom URL di dashboard — tidak
 * ada header kustom/secret/signature — jadi token tetap di query string.
 *
 * Aturan penting: SETIAP payload yang lolos token disimpan ke tabel
 * `transaksi` SEBELUM mencoba mencocokkan peserta. Pembayaran yang gagal
 * cocok tetap tercatat dan bisa dicocokkan manual dari /admin; endpoint ini
 * tidak lagi menjawab 404 tanpa menyimpan apa pun.
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
  invoiceCode?: string;
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

  const data = body.data;
  const paid = !!data && isPaid(data.status);
  const email = data?.customerEmail?.trim().toLowerCase() || undefined;
  const phone = normalizePhone(data?.customerMobile);
  const paketInfo = data ? detectPaket(data) : undefined;

  // Kunci idempotency. Pembayaran lunas dikunci ke id transaksi Mayar; event
  // lain (reminder, test, ...) diberi akhiran agar tidak menabrak baris
  // pembayaran yang nanti memakai id transaksi yang sama.
  const idDasar =
    data?.transactionId ??
    data?.id ??
    `hash:${createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 32)}`;
  const jenis: TransaksiStatus = body.event === "testing" ? "test" : paid ? "tidak_cocok" : "diabaikan";
  const transactionId = paid ? idDasar : `${idDasar}#${body.event ?? "event"}`;

  // 1. SIMPAN dulu, apa pun hasilnya nanti. Kalau gagal menyimpan (mis. tabel
  //    belum dibuat) jawab 500 supaya Mayar mengirim ulang — jangan sampai
  //    pembayaran diproses tanpa jejak.
  let saved;
  try {
    saved = await simpanTransaksi({
      provider: PROVIDER,
      transactionId,
      orderId: data?.invoiceCode ?? data?.id ?? null,
      emailPembayar: data?.customerEmail ?? null,
      nomorHpPembayar: data?.customerMobile ?? null,
      nominal: typeof data?.amount === "number" ? data.amount : null,
      paket: paketInfo?.id ?? null,
      status: jenis,
      pesertaKode: null,
      rawPayload: body,
      catatan: null,
    });
  } catch (e) {
    console.error("Mayar webhook: GAGAL menyimpan transaksi:", e);
    return NextResponse.json({ error: "Gagal menyimpan transaksi" }, { status: 500 });
  }

  if (body.event === "testing") {
    // Tombol "TEST URL" di dashboard Mayar: cukup balas 200.
    return NextResponse.json({ ok: true, test: true });
  }
  if (!paid) {
    // Event selain pembayaran sukses (mis. payment.reminder) — sudah dicatat,
    // balas 200 supaya Mayar tidak retry terus-menerus.
    return NextResponse.json({ ok: true, skipped: true });
  }

  const trx = saved.row;
  if (trx.status === "aktif") {
    // Notifikasi yang sama dikirim ulang — jangan ubah apa pun.
    return NextResponse.json({ ok: true, duplicate: true });
  }

  // 2. Cocokkan peserta. Utama: email pembeli = email akun. Cadangan: nomor HP
  //    pembeli = nomor WA akun, hanya kalau tepat satu peserta yang cocok.
  const tandai = async (status: TransaksiStatus, catatan: string, pesertaKode: string | null = null) => {
    await updateTransaksi(trx.id, { status, catatan, pesertaKode }).catch((e) =>
      console.error("Mayar webhook: gagal memperbarui status transaksi:", e),
    );
  };

  if (!email && !phone) {
    await tandai("tidak_cocok", "Payload tidak punya email maupun nomor HP pembeli");
    return NextResponse.json({ ok: true, matched: false });
  }

  const peserta = await loadPeserta();
  let target = email ? peserta.find((p) => p.email.toLowerCase() === email) : undefined;
  if (!target && phone) {
    const byPhone = peserta.filter((p) => normalizePhone(p.wa) === phone);
    if (byPhone.length === 1) target = byPhone[0];
  }
  if (!target) {
    console.error(`Mayar webhook: tidak ada peserta dengan email ${email ?? "-"} / HP ${phone || "-"} (tersimpan sebagai transaksi ${trx.id})`);
    await tandai("tidak_cocok", "Email/HP pembayar tidak cocok dengan peserta manapun");
    return NextResponse.json({ ok: true, matched: false });
  }

  if (!paketInfo) {
    console.error(`Mayar webhook: nominal ${data?.amount} / produk "${data?.productName}" tidak cocok paket manapun (transaksi ${trx.id})`);
    await tandai("paket_tidak_dikenal", "Nominal/nama produk tidak cocok paket manapun", target.kode);
    return NextResponse.json({ ok: true, matched: true, activated: false });
  }

  // 3. Aktifkan (idempotent: klaim bersyarat di tabel transaksi).
  try {
    const hasil = await aktifkanPremiumUntukTransaksi(trx, target, paketInfo);
    return NextResponse.json({ ok: true, ...(hasil === "duplikat" && { duplicate: true }) });
  } catch (e) {
    console.error("Mayar webhook: gagal mengaktifkan premium:", e);
    return NextResponse.json({ error: "Gagal update peserta" }, { status: 500 });
  }
}
