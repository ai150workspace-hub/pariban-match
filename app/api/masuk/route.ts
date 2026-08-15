import { NextResponse } from "next/server";
import { loadPeserta } from "@/lib/storage";

export async function POST(req: Request) {
  let body: { email: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = body;
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email diperlukan" }, { status: 400 });
  }

  const list = await loadPeserta();
  const peserta = list.find(
    (p) => p.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!peserta) {
    return NextResponse.json(
      { error: "Email tidak terdaftar. Pastikan email yang kamu masukkan sama dengan saat mendaftar." },
      { status: 404 },
    );
  }

  return NextResponse.json({ kode: peserta.kode, inisial: peserta.inisial });
}
