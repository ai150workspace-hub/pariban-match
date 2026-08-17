import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { Peserta } from "./adat/types";

const DATA_DIR = join(process.cwd(), ".data");
const PESERTA_FILE = join(DATA_DIR, "peserta.json");

const USE_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_KEY;

// ── File-based (development) ──────────────────────────────────────

async function fileLoad(): Promise<Peserta[]> {
  try {
    const raw = await readFile(PESERTA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function fileSave(list: Peserta[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(PESERTA_FILE, JSON.stringify(list, null, 2), "utf-8");
}

// ── Supabase (production) ─────────────────────────────────────────

type DbRow = {
  kode: string; nama: string; email: string; wa: string;
  gender: string; tahun_lahir: number; kota: string;
  agama: string; cari_agama: string; suku: string;
  marga: string; marga_ibu: string; sub_marga: string;
  klg_besar: number; ibadah: string; rokok: string;
  alkohol: string; anak_ke: string; pendidikan: string;
  kerja: string; pindah: string; ldr: string;
  timeline: string; tabungan: string; anak: string;
  ortu: string; bahasa_kasih: string; konflik: string;
  introvert: number; boleh_hubung: string; catatan: string;
  inisial: string; status_data: string;
  foto: string | null; premium: boolean; password_hash: string | null;
  premium_expiry: string | null; premium_paket: string | null;
  pekerjaan: string | null; jabatan: string | null;
  tinggi_badan: number | null; berat_badan: string | null;
  minat: string[] | null;
  sosmed_linkedin: string | null; sosmed_instagram: string | null; sosmed_tiktok: string | null;
};

function dbToTs(r: DbRow): Peserta {
  return {
    kode: r.kode, nama: r.nama, email: r.email, wa: r.wa,
    gender: r.gender as "Perempuan" | "Laki-laki",
    tahunLahir: r.tahun_lahir, kota: r.kota, agama: r.agama,
    cariAgama: r.cari_agama, suku: r.suku, marga: r.marga,
    margaIbu: r.marga_ibu ?? "", subMarga: r.sub_marga ?? "",
    klgBesar: r.klg_besar, ibadah: r.ibadah ?? "",
    rokok: r.rokok ?? "", alkohol: r.alkohol ?? "",
    anakKe: r.anak_ke ?? "", pendidikan: r.pendidikan ?? "",
    kerja: r.kerja ?? "", pindah: r.pindah ?? "",
    ldr: r.ldr ?? "", timeline: r.timeline ?? "",
    tabungan: r.tabungan ?? "", anak: r.anak ?? "",
    ortu: r.ortu ?? "", bahasaKasih: r.bahasa_kasih ?? "",
    konflik: r.konflik ?? "", introvert: r.introvert,
    bolehHubung: r.boleh_hubung ?? "", catatan: r.catatan ?? "",
    inisial: r.inisial, statusData: r.status_data,
    foto: r.foto ?? undefined, premium: r.premium,
    passwordHash: r.password_hash ?? undefined,
    premiumExpiry: r.premium_expiry ?? undefined,
    premiumPaket: (r.premium_paket as "trial" | "3bln" | "6bln") ?? undefined,
    pekerjaan: r.pekerjaan ?? undefined,
    jabatan: r.jabatan ?? undefined,
    tinggiBadan: r.tinggi_badan ?? undefined,
    beratBadan: (r.berat_badan as "Kurus" | "Sedang" | "Berisi") ?? undefined,
    minat: r.minat ?? undefined,
    sosmedLinkedIn: r.sosmed_linkedin ?? undefined,
    sosmedInstagram: r.sosmed_instagram ?? undefined,
    sosmedTikTok: r.sosmed_tiktok ?? undefined,
  };
}

function tsToDb(p: Peserta): Record<string, unknown> {
  return {
    kode: p.kode, nama: p.nama, email: p.email, wa: p.wa,
    gender: p.gender, tahun_lahir: p.tahunLahir, kota: p.kota,
    agama: p.agama, cari_agama: p.cariAgama, suku: p.suku,
    marga: p.marga, marga_ibu: p.margaIbu, sub_marga: p.subMarga,
    klg_besar: p.klgBesar, ibadah: p.ibadah, rokok: p.rokok,
    alkohol: p.alkohol, anak_ke: p.anakKe, pendidikan: p.pendidikan,
    kerja: p.kerja, pindah: p.pindah, ldr: p.ldr,
    timeline: p.timeline, tabungan: p.tabungan, anak: p.anak,
    ortu: p.ortu, bahasa_kasih: p.bahasaKasih, konflik: p.konflik,
    introvert: p.introvert, boleh_hubung: p.bolehHubung,
    catatan: p.catatan, inisial: p.inisial, status_data: p.statusData,
    ...(p.foto !== undefined && { foto: p.foto }),
    ...(p.passwordHash !== undefined && { password_hash: p.passwordHash }),
    premium: p.premium ?? false,
    ...(p.premiumExpiry !== undefined && { premium_expiry: p.premiumExpiry }),
    ...(p.premiumPaket !== undefined && { premium_paket: p.premiumPaket }),
    ...(p.pekerjaan !== undefined && { pekerjaan: p.pekerjaan }),
    ...(p.jabatan !== undefined && { jabatan: p.jabatan }),
    ...(p.tinggiBadan !== undefined && { tinggi_badan: p.tinggiBadan }),
    ...(p.beratBadan !== undefined && { berat_badan: p.beratBadan }),
    ...(p.minat !== undefined && { minat: p.minat }),
    ...(p.sosmedLinkedIn !== undefined && { sosmed_linkedin: p.sosmedLinkedIn }),
    ...(p.sosmedInstagram !== undefined && { sosmed_instagram: p.sosmedInstagram }),
    ...(p.sosmedTikTok !== undefined && { sosmed_tiktok: p.sosmedTikTok }),
  };
}

function partialToDb(updates: Partial<Peserta>): Record<string, unknown> {
  const map: Record<string, string> = {
    premium: "premium", foto: "foto", nama: "nama", email: "email",
    wa: "wa", kota: "kota", inisial: "inisial", statusData: "status_data",
    tahunLahir: "tahun_lahir", agama: "agama", cariAgama: "cari_agama",
    suku: "suku", marga: "marga", margaIbu: "marga_ibu",
    premiumExpiry: "premium_expiry", premiumPaket: "premium_paket",
    pekerjaan: "pekerjaan", jabatan: "jabatan",
    tinggiBadan: "tinggi_badan", beratBadan: "berat_badan", minat: "minat",
    sosmedLinkedIn: "sosmed_linkedin", sosmedInstagram: "sosmed_instagram",
    sosmedTikTok: "sosmed_tiktok",
    fotoCount: "foto_count", fotoLiveVerified: "foto_live_verified",
    banned: "banned", passwordHash: "password_hash",
  };
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(updates)) {
    const col = map[key] ?? key;
    out[col] = val;
  }
  return out;
}

async function sbLoad(): Promise<Peserta[]> {
  const { getSupabase } = await import("./supabase");
  const { data, error } = await getSupabase()
    .from("peserta").select("*").order("kode");
  if (error) throw new Error(error.message);
  return (data as DbRow[]).map(dbToTs);
}

async function sbAdd(p: Peserta): Promise<void> {
  const { getSupabase } = await import("./supabase");
  const { error } = await getSupabase().from("peserta").insert(tsToDb(p));
  if (error) throw new Error(error.message);
}

async function sbUpdate(kode: string, updates: Partial<Peserta>): Promise<void> {
  const { getSupabase } = await import("./supabase");
  const { error } = await getSupabase()
    .from("peserta").update(partialToDb(updates)).eq("kode", kode);
  if (error) throw new Error(error.message);
}

async function sbNextKode(): Promise<string> {
  const { getSupabase } = await import("./supabase");
  const { count } = await getSupabase()
    .from("peserta").select("*", { count: "exact", head: true });
  return `P${String((count ?? 0) + 1).padStart(3, "0")}`;
}

// ── Public API ────────────────────────────────────────────────────

export async function loadPeserta(): Promise<Peserta[]> {
  return USE_SUPABASE ? sbLoad() : fileLoad();
}

export async function savePeserta(list: Peserta[]): Promise<void> {
  if (!USE_SUPABASE) await fileSave(list);
}

export async function addPeserta(p: Peserta): Promise<Peserta> {
  if (USE_SUPABASE) {
    const kode = await sbNextKode();
    const saved: Peserta = { ...p, kode };
    await sbAdd(saved);
    return saved;
  }
  const list = await fileLoad();
  const kode = `P${String(list.length + 1).padStart(3, "0")}`;
  const peserta: Peserta = { ...p, kode };
  list.push(peserta);
  await fileSave(list);
  return peserta;
}

export async function updatePeserta(kode: string, updates: Partial<Peserta>): Promise<void> {
  if (USE_SUPABASE) {
    await sbUpdate(kode, updates);
    return;
  }
  const list = await fileLoad();
  const idx = list.findIndex((p) => p.kode === kode);
  if (idx === -1) throw new Error("Peserta tidak ditemukan");
  list[idx] = { ...list[idx], ...updates };
  await fileSave(list);
}
