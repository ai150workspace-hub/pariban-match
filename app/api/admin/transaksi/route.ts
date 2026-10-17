import { NextResponse } from "next/server";
import { listTransaksi, STATUS_BELUM_DIPROSES } from "@/lib/transaksi";
import { isAdminRequest, forbidden } from "@/lib/request-auth";

export async function GET() {
  if (!(await isAdminRequest())) return forbidden();
  try {
    const [belumDiproses, aktif] = await Promise.all([
      listTransaksi({ statuses: STATUS_BELUM_DIPROSES, limit: 100 }),
      listTransaksi({ statuses: ["aktif"], limit: 30 }),
    ]);
    return NextResponse.json({ belumDiproses, aktif });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
