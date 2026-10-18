import { NextResponse } from "next/server";
import { getKodeSesi } from "@/lib/request-auth";

const USE_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!USE_SUPABASE) {
    return NextResponse.json({ error: "Fitur chat memerlukan Supabase" }, { status: 503 });
  }

  const { id } = await params;
  // Identitas dari sesi bertanda tangan — kode dari query/body diabaikan.
  const kode = await getKodeSesi();
  if (!kode) return NextResponse.json({ error: "Sesi berakhir, silakan masuk lagi." }, { status: 401 });

  let body: { alasan: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { alasan } = body;
  if (!alasan?.trim()) {
    return NextResponse.json({ error: "alasan diperlukan" }, { status: 400 });
  }

  const { getSupabase } = await import("@/lib/supabase");
  const sb = getSupabase();

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

  // Catat laporan TANPA mengubah peserta_a/peserta_b: keduanya tetap anggota
  // percakapan. Yang dilaporkan = anggota yang bukan pelapor (diturunkan dari
  // peserta_a/b + pelapor_kode, mis. di panel admin).
  const { error: updateErr } = await sb
    .from("percakapan")
    .update({ dilaporkan: true, alasan_laporan: alasan.trim(), pelapor_kode: kode })
    .eq("id", id);

  if (updateErr) {
    console.error("Gagal laporan:", updateErr);
    return NextResponse.json({ error: "Gagal mengirim laporan" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
