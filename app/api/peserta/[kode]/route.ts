import { NextResponse } from "next/server";
import { updatePeserta, deletePeserta } from "@/lib/storage";

const USE_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;
const PHOTO_EXTS = ["jpg", "jpeg", "png", "webp"];
const PHOTO_SLOTS: (string | null)[] = [null, "1", "2", "3", "4", "5"];

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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  const { kode } = await params;

  if (USE_SUPABASE) {
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();

    // Hapus semua foto (profil + slot tambahan), best-effort
    for (const slot of PHOTO_SLOTS) {
      const prefix = slot ? `${kode}_${slot}` : kode;
      for (const ext of PHOTO_EXTS) {
        await sb.storage.from("pariban-photos").remove([`${prefix}.${ext}`]).catch(() => {});
      }
    }

    // Hapus riwayat chat yang melibatkan peserta ini, best-effort
    try {
      const { data: percakapan } = await sb
        .from("percakapan")
        .select("id")
        .or(`peserta_a.eq.${kode},peserta_b.eq.${kode}`);
      if (percakapan && percakapan.length > 0) {
        const ids = percakapan.map((p: { id: string }) => p.id);
        await sb.from("pesan").delete().in("percakapan_id", ids);
        await sb.from("percakapan").delete().in("id", ids);
      }
    } catch {
      // Non-critical — jangan gagalkan penghapusan akun kalau ini error
    }
  } else {
    const { unlink } = await import("fs/promises");
    const { existsSync } = await import("fs");
    const { join } = await import("path");
    const PHOTOS_DIR = join(process.cwd(), ".data", "photos");
    for (const slot of PHOTO_SLOTS) {
      const prefix = slot ? `${kode}_${slot}` : kode;
      for (const ext of PHOTO_EXTS) {
        const filePath = join(PHOTOS_DIR, `${prefix}.${ext}`);
        if (existsSync(filePath)) await unlink(filePath).catch(() => {});
      }
    }
  }

  try {
    await deletePeserta(kode);
  } catch {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("pariban_kode", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
