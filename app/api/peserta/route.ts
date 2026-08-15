import { NextResponse } from "next/server";
import { addPeserta, loadPeserta } from "@/lib/storage";
import { inisial } from "@/lib/adat";
import type { Peserta } from "@/lib/adat/types";
import { sendKonfirmasiDaftar } from "@/lib/email";

export async function GET() {
  const list = await loadPeserta();
  return NextResponse.json({ count: list.length, peserta: list });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const required = [
      "nama",
      "email",
      "wa",
      "gender",
      "tahunLahir",
      "kota",
      "agama",
      "cariAgama",
      "suku",
      "marga",
    ];
    const missing = required.filter((k) => !body[k]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Field wajib belum diisi: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    const peserta: Peserta = {
      kode: "",
      nama: body.nama,
      email: body.email,
      wa: body.wa,
      gender: body.gender,
      tahunLahir: Number(body.tahunLahir),
      kota: body.kota,
      agama: body.agama,
      cariAgama: body.cariAgama,
      suku: body.suku,
      marga: body.marga,
      margaIbu: body.margaIbu || "",
      subMarga: body.subMarga || "",
      klgBesar: Number(body.klgBesar) || 3,
      ibadah: body.ibadah || "",
      rokok: body.rokok || "",
      alkohol: body.alkohol || "",
      anakKe: body.anakKe || "",
      pendidikan: body.pendidikan || "",
      kerja: body.kerja || "",
      pindah: body.pindah || "",
      ldr: body.ldr || "",
      timeline: body.timeline || "",
      tabungan: body.tabungan || "",
      anak: body.anak || "",
      ortu: body.ortu || "",
      bahasaKasih: body.bahasaKasih || "",
      konflik: body.konflik || "",
      introvert: Number(body.introvert) || 3,
      bolehHubung: body.bolehHubung || "",
      catatan: body.catatan || "",
      inisial: inisial(body.nama),
      statusData: "LENGKAP",
      pekerjaan: body.pekerjaan || undefined,
      jabatan: body.jabatan || undefined,
      tinggiBadan: body.tinggiBadan ? Number(body.tinggiBadan) : undefined,
      beratBadan: body.beratBadan || undefined,
      minat: Array.isArray(body.minat) && body.minat.length > 0 ? body.minat : undefined,
      sosmedLinkedIn: body.sosmedLinkedIn || undefined,
      sosmedInstagram: body.sosmedInstagram || undefined,
      sosmedTikTok: body.sosmedTikTok || undefined,
    };

    const saved = await addPeserta(peserta);

    // Kirim email konfirmasi (fire-and-forget, tidak blokir response)
    sendKonfirmasiDaftar(saved).catch((e) =>
      console.error("Gagal kirim email konfirmasi:", e),
    );

    return NextResponse.json(
      { ok: true, kode: saved.kode, inisial: saved.inisial },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menyimpan data: " + String(err) },
      { status: 500 },
    );
  }
}
