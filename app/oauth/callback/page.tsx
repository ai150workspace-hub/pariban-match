"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { saveOauthPrefill } from "@/lib/oauth-prefill";
import { safeNext } from "@/lib/safe-next";

function OAuthCallbackInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [msg, setMsg] = useState("Memproses login...");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      setErr("Login tidak berhasil. Silakan coba lagi.");
      return;
    }

    const email = session?.user?.email;
    if (!email) {
      setErr("Tidak dapat membaca email dari akun OAuth.");
      return;
    }

    setMsg(`Memeriksa akun untuk ${email}...`);

    // Identitas diverifikasi SERVER dari sesi Google/Facebook (bukan dari email
    // kiriman klien); server menerbitkan cookie sesi bertanda tangan.
    fetch("/api/masuk/oauth", { method: "POST" })
      .then((res) => res.json().then((data) => ({ ok: res.ok, status: res.status, data })))
      .then(({ ok, status, data }) => {
        if (ok && data.kode) {
          router.replace(safeNext(params.get("next")) ?? "/hasil");
        } else if (status !== 404) {
          setErr(data.error || "Login tidak berhasil. Silakan coba lagi.");
        } else {
          // Belum terdaftar — arahkan ke halaman persetujuan dulu.
          // Email/nama dititipkan lewat sessionStorage, bukan query
          // string, supaya tidak tercetak di address bar.
          const nama = session?.user?.name ?? "";
          saveOauthPrefill({ email, ...(nama && { nama }) });
          router.replace("/persetujuan");
        }
      })
      .catch(() => {
        setErr("Gagal menghubungi server. Periksa koneksi internet Anda.");
      });
  }, [session, status, router, params]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        {err ? (
          <>
            <p className="text-red-600 font-medium mb-4">{err}</p>
            <Link href="/masuk" className="text-sm text-primary hover:underline">
              ← Kembali ke halaman masuk
            </Link>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">{msg}</p>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <OAuthCallbackInner />
    </Suspense>
  );
}
