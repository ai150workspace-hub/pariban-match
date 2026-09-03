import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".data");
const LOG_FILE = join(DATA_DIR, "deletion_logs.json");
const USE_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_KEY;

export interface DeletionLog {
  id: string;
  userId: string;
  namaUser: string;
  marga: string;
  alasan: string;
  catatanLainnya?: string;
  createdAt: string;
}

interface NewDeletionLog {
  userId: string;
  namaUser: string;
  marga: string;
  alasan: string;
  catatanLainnya?: string;
}

export async function logDeletion(entry: NewDeletionLog): Promise<void> {
  if (USE_SUPABASE) {
    const { getSupabase } = await import("./supabase");
    const { error } = await getSupabase().from("deletion_logs").insert({
      user_id: entry.userId,
      nama_user: entry.namaUser,
      marga: entry.marga,
      alasan: entry.alasan,
      ...(entry.catatanLainnya && { catatan_lainnya: entry.catatanLainnya }),
    });
    if (error) throw new Error(error.message);
    return;
  }

  await mkdir(DATA_DIR, { recursive: true });
  let list: DeletionLog[] = [];
  try {
    list = JSON.parse(await readFile(LOG_FILE, "utf-8"));
  } catch {}
  list.push({
    id: crypto.randomUUID(),
    userId: entry.userId,
    namaUser: entry.namaUser,
    marga: entry.marga,
    alasan: entry.alasan,
    catatanLainnya: entry.catatanLainnya,
    createdAt: new Date().toISOString(),
  });
  await writeFile(LOG_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export async function getDeletionLogs(): Promise<DeletionLog[]> {
  if (USE_SUPABASE) {
    const { getSupabase } = await import("./supabase");
    const { data, error } = await getSupabase()
      .from("deletion_logs")
      .select("id, user_id, nama_user, marga, alasan, catatan_lainnya, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      namaUser: r.nama_user,
      marga: r.marga ?? "",
      alasan: r.alasan,
      catatanLainnya: r.catatan_lainnya ?? undefined,
      createdAt: r.created_at,
    }));
  }

  try {
    const list: DeletionLog[] = JSON.parse(await readFile(LOG_FILE, "utf-8"));
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}
