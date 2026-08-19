import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { updatePeserta } from "@/lib/storage";

const PHOTOS_DIR = join(process.cwd(), ".data", "photos");
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const USE_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;
const BUCKET = "pariban-photos";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  const { kode } = await params;
  const url = new URL(req.url);
  const index = url.searchParams.get("index"); // null = profile foto
  const prefix = index ? `${kode}_${index}` : kode;

  if (USE_SUPABASE) {
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    for (const ext of ["jpg", "jpeg", "png", "webp"]) {
      const { data } = sb.storage.from(BUCKET).getPublicUrl(`${prefix}.${ext}`);
      const check = await fetch(data.publicUrl, { method: "HEAD" });
      if (check.ok) return NextResponse.redirect(data.publicUrl, { status: 302 });
    }
    return new NextResponse("Not found", { status: 404 });
  }

  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const filePath = join(PHOTOS_DIR, `${prefix}.${ext}`);
    if (existsSync(filePath)) {
      const file = await readFile(filePath);
      const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      return new Response(file, {
        headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" },
      });
    }
  }
  return new NextResponse("Not found", { status: 404 });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  const { kode } = await params;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("foto") as File | null;
  if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });

  const mimeType = file.type || "image/jpeg";
  if (!ALLOWED_TYPES.includes(mimeType))
    return NextResponse.json({ error: "Format harus JPG, PNG, atau WebP" }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "Ukuran maksimal 5MB" }, { status: 400 });

  const index = formData.get("index")?.toString() ?? "1";
  const isProfile = formData.get("isProfile") === "true";
  const isLive = formData.get("isLive") === "true";

  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const buffer = Buffer.from(await file.arrayBuffer());

  // Profile foto: saved as {kode}.{ext}
  // Extra fotos: saved as {kode}_{index}.{ext}
  const storageKey = isProfile ? `${kode}.${ext}` : `${kode}_${index}.${ext}`;

  if (USE_SUPABASE) {
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    const { error } = await sb.storage.from(BUCKET).upload(storageKey, buffer, {
      contentType: mimeType,
      upsert: true,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    await mkdir(PHOTOS_DIR, { recursive: true });
    await writeFile(join(PHOTOS_DIR, storageKey), buffer);
  }

  if (isProfile) {
    try {
      await updatePeserta(kode, { foto: ext, fotoLiveVerified: isLive });
    } catch {
      // Non-critical if new columns don't exist yet — foto extension update only
      await updatePeserta(kode, { foto: ext }).catch(() => {});
    }
  }

  // Update fotoCount — non-critical, ignore failures
  try {
    const numIndex = parseInt(index, 10);
    if (!isNaN(numIndex)) {
      const { loadPeserta } = await import("@/lib/storage");
      const all = await loadPeserta();
      const current = all.find((p) => p.kode === kode);
      if (current && (!current.fotoCount || numIndex > current.fotoCount)) {
        await updatePeserta(kode, { fotoCount: numIndex }).catch(() => {});
      }
    }
  } catch {}

  return NextResponse.json({ ok: true, storageKey });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  const { kode } = await params;
  const url = new URL(req.url);
  const index = url.searchParams.get("index");
  const prefix = index ? `${kode}_${index}` : kode;

  if (USE_SUPABASE) {
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    for (const ext of ["jpg", "jpeg", "png", "webp"]) {
      await sb.storage.from(BUCKET).remove([`${prefix}.${ext}`]).catch(() => {});
    }
    if (!index) {
      await updatePeserta(kode, { foto: null as unknown as string }).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  }

  let deleted = false;
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const filePath = join(PHOTOS_DIR, `${prefix}.${ext}`);
    if (existsSync(filePath)) {
      await unlink(filePath).catch(() => {});
      deleted = true;
    }
  }

  if (!index && deleted) {
    await updatePeserta(kode, { foto: null as unknown as string }).catch(() => {});
  }

  return NextResponse.json({ ok: true, deleted });
}
