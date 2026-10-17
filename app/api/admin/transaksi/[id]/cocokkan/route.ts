import { NextResponse } from "next/server";
import { loadPeserta } from "@/lib/storage";
import { getPaket } from "@/lib/pricing";
import { getTransaksi, updateTransaksi } from "@/lib/transaksi";
import { aktifkanPremiumUntukTransaksi } from "@/lib/aktivasi-premium";
import { isAdminRequest, forbidden } from "@/lib/request-auth";

/**
 * Cocokkan manual transaksi yang gagal dicocokkan otomatis (mis. pembayar
 * memakai email berbeda) ke satu peserta, lalu aktifkan Premium. Pelaksana
 * dicatat (nama yang diisi admin + IP + waktu) di baris transaksi.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) return forbidden();
  const { id } = await params;

  let body: { kode?: string; paket?: string; oleh?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const kode = body.kode?.trim().toUpperCase();
  const oleh = body.oleh?.trim();
  if (!kode) return NextResponse.json({ error: "Kode peserta wajib diisi" }, { status: 400 });
  if (!oleh) return NextResponse.json({ error: "Nama pelaksana wajib diisi" }, { status: 400 });

  const trx = await getTransaksi(id);
  if (!trx) return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  if (trx.status === "aktif") {
    return NextResponse.json({ error: "Transaksi ini sudah diproses" }, { status: 409 });
  }

  const paket = getPaket(body.paket ?? trx.paket ?? "");
  if (!paket) {
    return NextResponse.json({ error: "Paket belum dipilih atau tidak valid" }, { status: 400 });
  }

  const target = (await loadPeserta()).find((p) => p.kode === kode);
  if (!target) {
    return NextResponse.json({ error: `Peserta ${kode} tidak ditemukan` }, { status: 404 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const pelaksana = ip ? `${oleh} (${ip})` : oleh;

  try {
    const hasil = await aktifkanPremiumUntukTransaksi(trx, target, paket, { oleh: pelaksana });
    if (hasil === "duplikat") {
      return NextResponse.json({ error: "Transaksi ini sudah diproses" }, { status: 409 });
    }
    await updateTransaksi(trx.id, { catatan: `Dicocokkan manual ke ${kode}` }).catch(() => {});
    return NextResponse.json({ ok: true, kode, paket: paket.id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Gagal mengaktifkan" }, { status: 500 });
  }
}
