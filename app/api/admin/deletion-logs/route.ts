import { NextResponse } from "next/server";
import { getDeletionLogs } from "@/lib/deletion-log";
import { isAdminRequest, forbidden } from "@/lib/request-auth";

export async function GET() {
  if (!(await isAdminRequest())) return forbidden();
  try {
    const logs = await getDeletionLogs();
    return NextResponse.json({ logs });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
