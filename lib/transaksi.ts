import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

/**
 * Jejak semua notifikasi pembayaran dari payment gateway + dasar idempotency.
 * Pasangan (provider, transactionId) unik. Dual-mode seperti lib/storage.ts:
 * Supabase di produksi, file .data/transaksi.json untuk pengembangan lokal.
 */

const DATA_DIR = join(process.cwd(), ".data");
const FILE = join(DATA_DIR, "transaksi.json");
const USE_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

export type TransaksiStatus =
  | "test"
  | "diabaikan"
  | "tidak_cocok"
  | "paket_tidak_dikenal"
  | "gagal"
  | "aktif";

/** Status yang masih perlu ditangani admin (Premium belum aktif). */
export const STATUS_BELUM_DIPROSES: TransaksiStatus[] = [
  "tidak_cocok",
  "paket_tidak_dikenal",
  "gagal",
];

export interface Transaksi {
  id: string;
  provider: string;
  transactionId: string;
  orderId: string | null;
  emailPembayar: string | null;
  nomorHpPembayar: string | null;
  nominal: number | null;
  paket: string | null;
  status: TransaksiStatus;
  pesertaKode: string | null;
  rawPayload: unknown;
  catatan: string | null;
  dicocokkanOleh: string | null;
  dicocokkanPada: string | null;
  createdAt: string;
}

export type NewTransaksi = Omit<
  Transaksi,
  "id" | "createdAt" | "dicocokkanOleh" | "dicocokkanPada"
>;

interface DbRow {
  id: string;
  provider: string;
  transaction_id: string;
  order_id: string | null;
  email_pembayar: string | null;
  nomor_hp_pembayar: string | null;
  nominal: number | null;
  paket: string | null;
  status: string;
  peserta_kode: string | null;
  raw_payload: unknown;
  catatan: string | null;
  dicocokkan_oleh: string | null;
  dicocokkan_pada: string | null;
  created_at: string;
}

function fromDb(r: DbRow): Transaksi {
  return {
    id: r.id,
    provider: r.provider,
    transactionId: r.transaction_id,
    orderId: r.order_id,
    emailPembayar: r.email_pembayar,
    nomorHpPembayar: r.nomor_hp_pembayar,
    nominal: r.nominal,
    paket: r.paket,
    status: r.status as TransaksiStatus,
    pesertaKode: r.peserta_kode,
    rawPayload: r.raw_payload,
    catatan: r.catatan,
    dicocokkanOleh: r.dicocokkan_oleh,
    dicocokkanPada: r.dicocokkan_pada,
    createdAt: r.created_at,
  };
}

function patchToDb(p: Partial<Transaksi>): Record<string, unknown> {
  const m: Record<string, string> = {
    orderId: "order_id",
    emailPembayar: "email_pembayar",
    nomorHpPembayar: "nomor_hp_pembayar",
    nominal: "nominal",
    paket: "paket",
    status: "status",
    pesertaKode: "peserta_kode",
    rawPayload: "raw_payload",
    catatan: "catatan",
    dicocokkanOleh: "dicocokkan_oleh",
    dicocokkanPada: "dicocokkan_pada",
  };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) {
    if (m[k] && v !== undefined) out[m[k]] = v;
  }
  return out;
}

// ── mode file (lokal) ─────────────────────────────────────────────

async function fileLoad(): Promise<Transaksi[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf-8"));
  } catch {
    return [];
  }
}

async function fileSave(list: Transaksi[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(list, null, 2), "utf-8");
}

// ── API publik ────────────────────────────────────────────────────

export async function getTransaksiByTxId(
  provider: string,
  transactionId: string,
): Promise<Transaksi | null> {
  if (USE_SUPABASE) {
    const { getSupabase } = await import("./supabase");
    const { data, error } = await getSupabase()
      .from("transaksi")
      .select("*")
      .eq("provider", provider)
      .eq("transaction_id", transactionId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromDb(data as DbRow) : null;
  }
  const list = await fileLoad();
  return list.find((t) => t.provider === provider && t.transactionId === transactionId) ?? null;
}

export async function getTransaksi(id: string): Promise<Transaksi | null> {
  if (USE_SUPABASE) {
    const { getSupabase } = await import("./supabase");
    const { data, error } = await getSupabase()
      .from("transaksi").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromDb(data as DbRow) : null;
  }
  return (await fileLoad()).find((t) => t.id === id) ?? null;
}

/**
 * Simpan baris baru. Kalau (provider, transactionId) sudah ada, kembalikan
 * baris yang ada dengan created=false (tanpa mengubahnya). Melempar error
 * untuk kegagalan lain (mis. tabel belum dibuat) — jangan ditelan.
 */
export async function simpanTransaksi(
  input: NewTransaksi,
): Promise<{ row: Transaksi; created: boolean }> {
  if (USE_SUPABASE) {
    const { getSupabase } = await import("./supabase");
    const { data, error } = await getSupabase()
      .from("transaksi")
      .insert({
        provider: input.provider,
        transaction_id: input.transactionId,
        ...patchToDb(input),
      })
      .select("*")
      .single();
    if (!error && data) return { row: fromDb(data as DbRow), created: true };
    if (error?.code === "23505") {
      const existing = await getTransaksiByTxId(input.provider, input.transactionId);
      if (existing) return { row: existing, created: false };
    }
    throw new Error(error?.message ?? "Gagal menyimpan transaksi");
  }

  const list = await fileLoad();
  const existing = list.find(
    (t) => t.provider === input.provider && t.transactionId === input.transactionId,
  );
  if (existing) return { row: existing, created: false };
  const row: Transaksi = {
    ...input,
    id: crypto.randomUUID(),
    dicocokkanOleh: null,
    dicocokkanPada: null,
    createdAt: new Date().toISOString(),
  };
  list.push(row);
  await fileSave(list);
  return { row, created: true };
}

export async function updateTransaksi(id: string, patch: Partial<Transaksi>): Promise<void> {
  if (USE_SUPABASE) {
    const { getSupabase } = await import("./supabase");
    const { error } = await getSupabase()
      .from("transaksi").update(patchToDb(patch)).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const list = await fileLoad();
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Transaksi tidak ditemukan");
  list[idx] = { ...list[idx], ...patch };
  await fileSave(list);
}

/**
 * Tandai transaksi "aktif" HANYA bila belum aktif (satu UPDATE bersyarat,
 * jadi dua notifikasi yang masuk bersamaan tidak bisa sama-sama lolos).
 * True = pemanggil ini yang berhak mengaktifkan Premium.
 */
export async function klaimAktif(
  id: string,
  fields: Partial<Transaksi>,
): Promise<boolean> {
  if (USE_SUPABASE) {
    const { getSupabase } = await import("./supabase");
    const { data, error } = await getSupabase()
      .from("transaksi")
      .update({ ...patchToDb(fields), status: "aktif" })
      .eq("id", id)
      .neq("status", "aktif")
      .select("id");
    if (error) throw new Error(error.message);
    return (data ?? []).length > 0;
  }
  const list = await fileLoad();
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Transaksi tidak ditemukan");
  if (list[idx].status === "aktif") return false;
  list[idx] = { ...list[idx], ...fields, status: "aktif" };
  await fileSave(list);
  return true;
}

/** Transaksi terbaru, terbaru dulu. `statuses` kosong = semua kecuali test/diabaikan. */
export async function listTransaksi(
  opts: { statuses?: TransaksiStatus[]; limit?: number } = {},
): Promise<Transaksi[]> {
  const limit = opts.limit ?? 50;
  const statuses = opts.statuses ?? ["tidak_cocok", "paket_tidak_dikenal", "gagal", "aktif"];
  if (USE_SUPABASE) {
    const { getSupabase } = await import("./supabase");
    const { data, error } = await getSupabase()
      .from("transaksi")
      .select("*")
      .in("status", statuses)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data as DbRow[]).map(fromDb);
  }
  return (await fileLoad())
    .filter((t) => statuses.includes(t.status))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
