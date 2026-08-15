import { NextResponse } from "next/server";
import { loadPeserta } from "@/lib/storage";
import { hitungPasangan, topTiga } from "@/lib/adat";
import { sendHasilMatching } from "@/lib/email";

export async function GET() {
  const peserta = await loadPeserta();

  if (peserta.length < 2) {
    return NextResponse.json({
      error: "Minimal 2 peserta untuk menjalankan matching.",
      count: peserta.length,
    });
  }

  const pasangan = hitungPasangan(peserta);
  const top = topTiga(peserta, pasangan);

  const summary = Object.entries(top).map(([kode, matches]) => {
    const p = peserta.find((x) => x.kode === kode);
    return {
      kode,
      nama: p?.inisial ?? kode,
      gender: p?.gender,
      marga: p?.marga,
      top3: matches.map((m) => ({
        nama: m.lawan.inisial,
        marga: m.lawan.marga,
        skor: m.skor,
        status: m.adat.status,
        label: m.adat.label,
        saling: m.saling,
      })),
    };
  });

  // Kirim email hasil ke setiap peserta (fire-and-forget)
  for (const [kode, matches] of Object.entries(top)) {
    const p = peserta.find((x) => x.kode === kode);
    if (!p) continue;
    const top3Email = matches.map((m) => ({
      inisial: m.lawan.inisial,
      marga: m.lawan.marga,
      skor: m.skor,
      statusLabel: m.adat.label,
      saling: m.saling,
    }));
    sendHasilMatching(p, top3Email).catch((e) =>
      console.error(`Gagal kirim email hasil ke ${kode}:`, e),
    );
  }

  return NextResponse.json({
    totalPeserta: peserta.length,
    totalPasangan: pasangan.length,
    diblokir: pasangan.filter((p) => p.blok).length,
    hasil: summary,
  });
}
