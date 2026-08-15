import { NextResponse } from "next/server";
import { updatePeserta } from "@/lib/storage";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  const { kode } = await params;

  let body: { premium?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.premium !== "boolean") {
    return NextResponse.json({ error: "Field premium harus boolean" }, { status: 400 });
  }

  try {
    await updatePeserta(kode, { premium: body.premium });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }
}
