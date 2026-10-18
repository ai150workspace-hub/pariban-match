import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { ADMIN_COOKIE_NAME, computeAdminToken } from "@/lib/admin-token";
import { opsiCookieSesi } from "@/lib/session";

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

  const given = Buffer.from(String(body.password ?? ""));
  const real = Buffer.from(adminPassword);
  if (given.length !== real.length || !timingSafeEqual(given, real)) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  const token = computeAdminToken();
  if (!token) {
    console.error("SESSION_SECRET belum diset — tidak bisa menerbitkan sesi admin");
    return NextResponse.json({ error: "Server belum siap (SESSION_SECRET)" }, { status: 500 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, opsiCookieSesi);
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
