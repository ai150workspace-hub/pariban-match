"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OAuthCallback() {
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

    fetch("/api/masuk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data.kode) {
          sessionStorage.setItem("pariban_kode", data.kode);
          router.replace(`/hasil/${data.kode}`);
        } else {
          // Belum terdaftar — arahkan ke form dengan email terisi
          router.replace(`/daftar?email=${encodeURIComponent(email)}`);
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
