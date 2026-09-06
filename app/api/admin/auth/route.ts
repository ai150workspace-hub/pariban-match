import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, computeAdminToken } from "@/lib/admin-token";

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

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, computeAdminToken()!, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari, sama seperti sesi peserta
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
