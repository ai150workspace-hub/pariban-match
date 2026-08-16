import { NextResponse } from "next/server";
import { updatePeserta } from "@/lib/storage";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  const { kode } = await params;

  let body: { banned: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await updatePeserta(kode, { banned: body.banned });
    return NextResponse.json({ ok: true, kode, banned: body.banned });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal update";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
