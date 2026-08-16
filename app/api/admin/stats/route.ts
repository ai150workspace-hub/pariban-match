import { NextResponse } from "next/server";
import { loadPeserta } from "@/lib/storage";
import { getDaftarStarts } from "@/lib/daftar-log";

const HARGA: Record<string, number> = {
  trial: 79000,
  "3bln": 199000,
  "6bln": 329000,
};

const USE_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

export async function GET() {
  const [peserta, daftarMulai] = await Promise.all([
    loadPeserta(),
    getDaftarStarts(),
  ]);

  const totalPremium = peserta.filter((p) => p.premium).length;
  const totalBanned = peserta.filter((p) => p.banned).length;

  const totalPemasukan = peserta
    .filter((p) => p.premium && p.premiumPaket)
    .reduce((sum, p) => sum + (HARGA[p.premiumPaket!] ?? 0), 0);

  const daftarSelesai = peserta.length;
  const abandoned = Math.max(0, daftarMulai - daftarSelesai);

  // Count active laporan from Supabase
  let totalLaporan = 0;
  if (USE_SUPABASE) {
    try {
      const { getSupabase } = await import("@/lib/supabase");
      const { count } = await getSupabase()
        .from("percakapan")
        .select("*", { count: "exact", head: true })
        .eq("dilaporkan", true);
      totalLaporan = count ?? 0;
    } catch {}
  }

  return NextResponse.json({
    totalPremium,
    totalPemasukan,
    totalBanned,
    totalLaporan,
    daftarMulai,
    daftarSelesai,
    abandoned,
  });
}
