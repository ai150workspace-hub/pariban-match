import { NextResponse } from "next/server";
import { getKodeSesi } from "@/lib/request-auth";
import { loadPeserta } from "@/lib/storage";
import { hasActiveAccess } from "@/lib/membership";
import { salingCocok } from "@/lib/matching-check";

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

  // Percakapan yang sudah ada selalu boleh dibuka (dibaca) oleh anggotanya.
  if (existing) {
    return NextResponse.json({ id: existing.id });
  }

  // Percakapan BARU: pemanggil harus punya akses aktif (trial/premium berjalan)
  // dan kedua pihak harus saling cocok — keduanya diperiksa di server, tidak
  // dipercaya dari tampilan klien.
  const saya = list.find((p) => p.kode === kode);
  if (!saya || !hasActiveAccess(saya)) {
    return NextResponse.json(
      { error: "Masa trial atau langgananmu sudah berakhir. Pilih paket premium untuk memulai percakapan baru." },
      { status: 403 },
    );
  }
  if (!salingCocok(list, kode, lawanKode)) {
    return NextResponse.json(
      { error: "Kamu dan peserta ini tidak (lagi) saling cocok, jadi percakapan belum bisa dimulai." },
      { status: 403 },
    );
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
