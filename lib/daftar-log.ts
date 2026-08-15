import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".data");
const LOG_FILE = join(DATA_DIR, "daftar_log.json");
const USE_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_KEY;

export async function incrementDaftarStart(): Promise<void> {
  if (USE_SUPABASE) {
    const { getSupabase } = await import("./supabase");
    await getSupabase().from("daftar_log").insert({});
    return;
  }
  await mkdir(DATA_DIR, { recursive: true });
  let data = { starts: 0 };
  try {
    data = JSON.parse(await readFile(LOG_FILE, "utf-8"));
  } catch {}
  data.starts += 1;
  await writeFile(LOG_FILE, JSON.stringify(data), "utf-8");
}

export async function getDaftarStarts(): Promise<number> {
  if (USE_SUPABASE) {
    const { getSupabase } = await import("./supabase");
    const { count } = await getSupabase()
      .from("daftar_log")
      .select("*", { count: "exact", head: true });
    return count ?? 0;
  }
  try {
    return JSON.parse(await readFile(LOG_FILE, "utf-8")).starts ?? 0;
  } catch {
    return 0;
  }
}
