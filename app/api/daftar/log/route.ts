import { NextResponse } from "next/server";
import { incrementDaftarStart } from "@/lib/daftar-log";

export async function POST() {
  try {
    await incrementDaftarStart();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Gagal log daftar start:", e);
    return NextResponse.json({ ok: false });
  }
}
