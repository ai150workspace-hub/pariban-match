import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: { password: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "Admin password belum dikonfigurasi" }, { status: 500 });
  }

  if (body.password !== adminPassword) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
