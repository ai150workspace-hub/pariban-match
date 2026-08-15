import { NextResponse } from "next/server";
import { loadPeserta } from "@/lib/storage";
import { hitungPasangan, topTiga, skorPasangan, gerbangAdat } from "@/lib/adat";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  const { kode } = await params;
  const peserta = await loadPeserta();
  const target = peserta.find((p) => p.kode === kode);

  if (!target) {
    return NextResponse.json(
      { error: "Peserta tidak ditemukan" },
      { status: 404 },
    );
  }

  const pasangan = hitungPasangan(peserta);
  const top = topTiga(peserta, pasangan);
  const myTop = top[kode] || [];

  const hasil = myTop.map((m) => {
    const skor = skorPasangan(target, m.lawan);
    const adat = gerbangAdat(target, m.lawan);
    return {
      kode: m.lawan.kode,
      nama: m.lawan.inisial,
      marga: m.lawan.marga,
      gender: m.lawan.gender,
      kota: m.lawan.kota,
      usia: new Date().getFullYear() - m.lawan.tahunLahir,
      skor: m.skor,
      fotoUrl: m.lawan.foto ? `/api/photos/${m.lawan.kode}` : null,
      rinci: {
        bibit: Math.round(skor.bibit * 10) / 10,
        bebet: Math.round(skor.bebet * 10) / 10,
        bobot: Math.round(skor.bobot * 10) / 10,
        kepribadian: Math.round(skor.kepribadian * 10) / 10,
      },
      adat: {
        status: adat.status,
        label: adat.label,
        alasan: adat.alasan,
      },
      saling: m.saling,
      bio: {
        pekerjaan: m.lawan.pekerjaan,
        jabatan: m.lawan.jabatan,
        tinggiBadan: m.lawan.tinggiBadan,
        beratBadan: m.lawan.beratBadan,
        minat: m.lawan.minat,
        sosmedLinkedIn: m.lawan.sosmedLinkedIn,
        sosmedInstagram: m.lawan.sosmedInstagram,
        sosmedTikTok: m.lawan.sosmedTikTok,
      },
    };
  });

  return NextResponse.json({
    peserta: {
      kode: target.kode,
      inisial: target.inisial,
      marga: target.marga,
      gender: target.gender,
      kota: target.kota,
      usia: new Date().getFullYear() - target.tahunLahir,
      fotoUrl: target.foto ? `/api/photos/${target.kode}` : null,
      premium: target.premium ?? false,
      premiumExpiry: target.premiumExpiry ?? null,
      premiumPaket: target.premiumPaket ?? null,
    },
    top3: hasil,
  });
}
