import { NextResponse } from "next/server";
import { loadPeserta } from "@/lib/storage";
import { getDaftarStarts } from "@/lib/daftar-log";

const HARGA: Record<string, number> = {
  trial: 79000,
  "3bln": 199000,
  "6bln": 329000,
};

export async function GET() {
  const [peserta, daftarMulai] = await Promise.all([
    loadPeserta(),
    getDaftarStarts(),
  ]);

  const totalPremium = peserta.filter((p) => p.premium).length;

  const totalPemasukan = peserta
    .filter((p) => p.premium && p.premiumPaket)
    .reduce((sum, p) => sum + (HARGA[p.premiumPaket!] ?? 0), 0);

  const daftarSelesai = peserta.length;
  const abandoned = Math.max(0, daftarMulai - daftarSelesai);

  return NextResponse.json({
    totalPremium,
    totalPemasukan,
    daftarMulai,
    daftarSelesai,
    abandoned,
  });
}
