import { NextResponse } from "next/server";
import { getDeletionLogs } from "@/lib/deletion-log";

export async function GET() {
  try {
    const logs = await getDeletionLogs();
    return NextResponse.json({ logs });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
