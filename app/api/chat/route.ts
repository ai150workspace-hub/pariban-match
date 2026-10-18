import { NextResponse } from "next/server";
import { getKodeSesi } from "@/lib/request-auth";
import { loadPeserta } from "@/lib/storage";

const USE_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

export async function POST(req: Request) {
  if (!USE_SUPABASE) {
    return NextResponse.json(
      { error: "Fitur chat memerlukan Supabase. Hubungi admin untuk mengaktifkan." },
      { status: 503 },
    );
  }

  // Pembuat percakapan = pemilik sesi terverifikasi; kode dari klien diabaikan,
  // jadi tidak ada lagi percakapan antara dua kode sembarang.
  const kode = await getKodeSesi();
  if (!kode) return NextResponse.json({ error: "Sesi berakhir, silakan masuk lagi." }, { status: 401 });

  let body: { lawanKode: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { lawanKode } = body;
  // Format dicek ketat: nilai ini dimasukkan ke filter PostgREST di bawah.
  if (typeof lawanKode !== "string" || !/^P\d{1,9}$/.test(lawanKode)) {
    return NextResponse.json({ error: "lawanKode tidak valid" }, { status: 400 });
  }
  if (lawanKode === kode) {
    return NextResponse.json({ error: "Tidak bisa memulai percakapan dengan diri sendiri" }, { status: 400 });
  }
  const list = await loadPeserta();
  const lawan = list.find((p) => p.kode === lawanKode);
  if (!lawan || lawan.banned) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  const { getSupabase } = await import("@/lib/supabase");
  const sb = getSupabase();

  // Cari percakapan yang sudah ada
  const { data: existing } = await sb
    .from("percakapan")
    .select("id")
    .or(
      `and(peserta_a.eq.${kode},peserta_b.eq.${lawanKode}),and(peserta_a.eq.${lawanKode},peserta_b.eq.${kode})`,
    )
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json({ id: existing.id });
  }

  // Buat baru (peserta_a selalu yang lebih kecil secara alfabet agar konsisten)
  const [a, b] = [kode, lawanKode].sort();
  const { data: baru, error } = await sb
    .from("percakapan")
    .insert({ peserta_a: a, peserta_b: b })
    .select("id")
    .single();

  if (error) {
    console.error("Gagal buat percakapan:", error);
    return NextResponse.json({ error: "Gagal membuat percakapan" }, { status: 500 });
  }

  return NextResponse.json({ id: baru.id });
}
