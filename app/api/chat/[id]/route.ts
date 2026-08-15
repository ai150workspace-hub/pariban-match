import { NextResponse } from "next/server";
import { loadPeserta } from "@/lib/storage";
import { sendNotifikasiPesan } from "@/lib/email";

const USE_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!USE_SUPABASE) {
    return NextResponse.json({ error: "Fitur chat memerlukan Supabase" }, { status: 503 });
  }

  const { id } = await params;
  const kode = new URL(req.url).searchParams.get("kode");
  if (!kode) return NextResponse.json({ error: "kode diperlukan" }, { status: 400 });

  const { getSupabase } = await import("@/lib/supabase");
  const sb = getSupabase();

  // Verifikasi peserta adalah anggota percakapan ini
  const { data: conv, error: convErr } = await sb
    .from("percakapan")
    .select("id, peserta_a, peserta_b, dilaporkan")
    .eq("id", id)
    .single();

  if (convErr || !conv) {
    return NextResponse.json({ error: "Percakapan tidak ditemukan" }, { status: 404 });
  }

  if (conv.peserta_a !== kode && conv.peserta_b !== kode) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const lawanKode = conv.peserta_a === kode ? conv.peserta_b : conv.peserta_a;

  const { data: pesan } = await sb
    .from("pesan")
    .select("id, pengirim, isi, created_at")
    .eq("percakapan_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    id: conv.id,
    lawanKode,
    dilaporkan: conv.dilaporkan,
    pesan: pesan ?? [],
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!USE_SUPABASE) {
    return NextResponse.json({ error: "Fitur chat memerlukan Supabase" }, { status: 503 });
  }

  const { id } = await params;

  let body: { kode: string; isi: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { kode, isi } = body;
  if (!kode || !isi?.trim()) {
    return NextResponse.json({ error: "kode dan isi diperlukan" }, { status: 400 });
  }

  const { getSupabase } = await import("@/lib/supabase");
  const sb = getSupabase();

  // Verifikasi percakapan
  const { data: conv, error: convErr } = await sb
    .from("percakapan")
    .select("id, peserta_a, peserta_b")
    .eq("id", id)
    .single();

  if (convErr || !conv) {
    return NextResponse.json({ error: "Percakapan tidak ditemukan" }, { status: 404 });
  }

  if (conv.peserta_a !== kode && conv.peserta_b !== kode) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { data: pesan, error: pesanErr } = await sb
    .from("pesan")
    .insert({ percakapan_id: id, pengirim: kode, isi: isi.trim() })
    .select("id, pengirim, isi, created_at")
    .single();

  if (pesanErr) {
    console.error("Gagal kirim pesan:", pesanErr);
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 });
  }

  // Notifikasi email ke penerima (fire-and-forget)
  const penerimakode = conv.peserta_a === kode ? conv.peserta_b : conv.peserta_a;
  const chatUrl = `${BASE_URL}/chat/${id}?kode=${penerimakode}`;

  loadPeserta()
    .then((list) => {
      const pengirim = list.find((p) => p.kode === kode);
      const penerima = list.find((p) => p.kode === penerimakode);
      if (pengirim && penerima) {
        return sendNotifikasiPesan(penerima, pengirim.inisial, chatUrl);
      }
    })
    .catch((e) => console.error("Gagal kirim notifikasi pesan:", e));

  return NextResponse.json({ pesan });
}
