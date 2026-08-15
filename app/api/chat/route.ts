import { NextResponse } from "next/server";

const USE_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

export async function POST(req: Request) {
  if (!USE_SUPABASE) {
    return NextResponse.json(
      { error: "Fitur chat memerlukan Supabase. Hubungi admin untuk mengaktifkan." },
      { status: 503 },
    );
  }

  let body: { kode: string; lawanKode: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { kode, lawanKode } = body;
  if (!kode || !lawanKode) {
    return NextResponse.json({ error: "kode dan lawanKode diperlukan" }, { status: 400 });
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
