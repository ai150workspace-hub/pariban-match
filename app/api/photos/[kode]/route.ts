import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { updatePeserta } from "@/lib/storage";

const PHOTOS_DIR = join(process.cwd(), ".data", "photos");
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;
const USE_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;
const BUCKET = "pariban-photos";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  const { kode } = await params;

  if (USE_SUPABASE) {
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    for (const ext of ["jpg", "jpeg", "png", "webp"]) {
      const { data } = sb.storage.from(BUCKET).getPublicUrl(`${kode}.${ext}`);
      // Verify the file exists by trying to download a tiny range
      const check = await fetch(data.publicUrl, { method: "HEAD" });
      if (check.ok) {
        return NextResponse.redirect(data.publicUrl, { status: 302 });
      }
    }
    return new NextResponse("Not found", { status: 404 });
  }

  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const filePath = join(PHOTOS_DIR, `${kode}.${ext}`);
    if (existsSync(filePath)) {
      const file = await readFile(filePath);
      const contentType =
        ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      return new Response(file, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
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
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: "Format harus JPG, PNG, atau WebP" }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "Ukuran maksimal 2MB" }, { status: 400 });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const buffer = Buffer.from(await file.arrayBuffer());

  if (USE_SUPABASE) {
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    const { error } = await sb.storage
      .from(BUCKET)
      .upload(`${kode}.${ext}`, buffer, {
        contentType: file.type,
        upsert: true,
      });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    await mkdir(PHOTOS_DIR, { recursive: true });
    await writeFile(join(PHOTOS_DIR, `${kode}.${ext}`), buffer);
  }

  await updatePeserta(kode, { foto: ext });
  return NextResponse.json({ ok: true, fotoUrl: `/api/photos/${kode}` });
}
