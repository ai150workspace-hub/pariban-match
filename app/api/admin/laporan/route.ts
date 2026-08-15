import { NextResponse } from "next/server";

const USE_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

export async function GET() {
  if (!USE_SUPABASE) {
    return NextResponse.json({ laporan: [] });
  }

  const { getSupabase } = await import("@/lib/supabase");
  const { data, error } = await getSupabase()
    .from("percakapan")
    .select("id, peserta_a, peserta_b, alasan_laporan, created_at")
    .eq("dilaporkan", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ laporan: data ?? [] });
}

export async function PATCH(req: Request) {
  if (!USE_SUPABASE) {
    return NextResponse.json({ error: "Supabase tidak aktif" }, { status: 503 });
  }

  let body: { id: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { getSupabase } = await import("@/lib/supabase");
  const { error } = await getSupabase()
    .from("percakapan")
    .update({ dilaporkan: false, alasan_laporan: null })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
