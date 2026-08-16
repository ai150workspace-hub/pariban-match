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
      profil: {
        agama: m.lawan.agama,
        pendidikan: m.lawan.pendidikan,
        kerja: m.lawan.kerja,
        ibadah: m.lawan.ibadah,
        rokok: m.lawan.rokok,
        alkohol: m.lawan.alkohol,
        pindah: m.lawan.pindah,
        ldr: m.lawan.ldr,
        timeline: m.lawan.timeline,
        anak: m.lawan.anak,
        margaIbu: m.lawan.margaIbu,
      },
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
      margaIbu: target.margaIbu,
      gender: target.gender,
      kota: target.kota,
      usia: new Date().getFullYear() - target.tahunLahir,
      agama: target.agama,
      pendidikan: target.pendidikan,
      kerja: target.kerja,
      ibadah: target.ibadah,
      rokok: target.rokok,
      alkohol: target.alkohol,
      pindah: target.pindah,
      ldr: target.ldr,
      timeline: target.timeline,
      tabungan: target.tabungan,
      anak: target.anak,
      ortu: target.ortu,
      catatan: target.catatan,
      fotoUrl: target.foto ? `/api/photos/${target.kode}` : null,
      fotoCount: target.fotoCount ?? 1,
      fotoLiveVerified: target.fotoLiveVerified ?? false,
      premium: target.premium ?? false,
      premiumExpiry: target.premiumExpiry ?? null,
      premiumPaket: target.premiumPaket ?? null,
      pekerjaan: target.pekerjaan,
      jabatan: target.jabatan,
      tinggiBadan: target.tinggiBadan,
      beratBadan: target.beratBadan,
      minat: target.minat,
    },
    top3: hasil,
  });
}
