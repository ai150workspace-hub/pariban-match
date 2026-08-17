"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Pesan {
  id: string;
  pengirim: string;
  isi: string;
  created_at: string;
}

interface ChatData {
  id: string;
  lawanKode: string;
  dilaporkan: boolean;
  pesan: Pesan[];
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const kode = searchParams.get("kode") ?? "";

  const [chat, setChat] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isi, setIsi] = useState("");
  const [kirimLoading, setKirimLoading] = useState(false);
  const [showLaporan, setShowLaporan] = useState(false);
  const [alasanLaporan, setAlasanLaporan] = useState("");
  const [laporanLoading, setLaporanLoading] = useState(false);
  const [laporanSent, setLaporanSent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadChat = useCallback(async () => {
    if (!kode) return;
    try {
      const res = await fetch(`/api/chat/${id}?kode=${kode}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Percakapan tidak ditemukan");
        return;
      }
      setChat(await res.json());
    } catch {
      setError("Gagal memuat percakapan");
    } finally {
      setLoading(false);
    }
  }, [id, kode]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  // Polling setiap 4 detik untuk pesan baru
  useEffect(() => {
    if (!kode || loading) return;
    const interval = setInterval(loadChat, 4000);
    return () => clearInterval(interval);
  }, [kode, loading, loadChat]);

  // Scroll ke bawah saat ada pesan baru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.pesan?.length]);

  async function kirimPesan() {
    if (!isi.trim() || kirimLoading) return;
    setKirimLoading(true);
    const teks = isi.trim();
    setIsi("");
    try {
      const res = await fetch(`/api/chat/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode, isi: teks }),
      });
      if (!res.ok) {
        const err = await res.json();
        setIsi(teks);
        alert(err.error || "Gagal mengirim pesan");
        return;
      }
      await loadChat();
    } catch {
      setIsi(teks);
      alert("Gagal mengirim pesan");
    } finally {
      setKirimLoading(false);
    }
  }

  async function kirimLaporan() {
    if (!alasanLaporan.trim() || laporanLoading) return;
    setLaporanLoading(true);
    try {
      const res = await fetch(`/api/chat/${id}/laporan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode, alasan: alasanLaporan }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Gagal mengirim laporan");
        return;
      }
      setLaporanSent(true);
      setShowLaporan(false);
    } catch {
      alert("Gagal mengirim laporan");
    } finally {
      setLaporanLoading(false);
    }
  }

  function formatWaktu(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }

  function formatTanggal(iso: string) {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric", month: "long",
    });
  }

  if (!kode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div>
          <p className="text-lg font-semibold text-foreground">Kode peserta tidak ditemukan</p>
          <p className="mt-2 text-sm text-muted-foreground">Buka chat melalui halaman hasil matching Anda.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-primary hover:underline">Beranda</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Memuat percakapan...</p>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <p className="text-lg font-semibold text-foreground">{error || "Percakapan tidak ditemukan"}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Fitur chat memerlukan koneksi Supabase. Pastikan database sudah dikonfigurasi.
        </p>
        <Link href="/" className="mt-4 text-sm text-primary hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  // Kelompokkan pesan per tanggal
  const grouped: { tanggal: string; pesan: Pesan[] }[] = [];
  for (const p of chat.pesan) {
    const tgl = formatTanggal(p.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.tanggal === tgl) {
      last.pesan.push(p);
    } else {
      grouped.push({ tanggal: tgl, pesan: [p] });
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Modal Laporan */}
      {showLaporan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="font-semibold text-foreground">Laporkan Percakapan</h3>
            <p className="mt-1 text-sm text-muted-foreground mb-4">
              Ceritakan alasan pelaporan. Admin akan meninjau percakapan ini.
            </p>
            <textarea
              value={alasanLaporan}
              onChange={(e) => setAlasanLaporan(e.target.value)}
              placeholder="Contoh: Pengguna mengirim konten yang tidak pantas"
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowLaporan(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                Batal
              </button>
              <button
                onClick={kirimLaporan}
                disabled={!alasanLaporan.trim() || laporanLoading}
                className="flex-1 rounded-lg bg-adat-blokir px-4 py-2 text-sm font-semibold text-white hover:bg-adat-blokir/90 transition-colors disabled:opacity-50"
              >
                {laporanLoading ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border bg-card/95 backdrop-blur px-4 py-3 flex items-center gap-3">
        <Link href="/hasil" className="text-muted-foreground hover:text-foreground transition-colors">
          ←
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
          {chat.lawanKode.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{chat.lawanKode}</p>
          <p className="text-xs text-muted-foreground">SALING COCOK ♥</p>
        </div>
        <div className="flex items-center gap-2">
          {laporanSent && (
            <span className="text-xs text-muted-foreground">Laporan terkirim ✓</span>
          )}
          {!laporanSent && !chat.dilaporkan && (
            <button
              onClick={() => setShowLaporan(true)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-adat-blokir/40 hover:text-adat-blokir transition-colors"
            >
              Laporkan
            </button>
          )}
          {chat.dilaporkan && (
            <span className="rounded-lg bg-adat-blokir/10 px-3 py-1.5 text-xs text-adat-blokir">
              Dilaporkan
            </span>
          )}
        </div>
      </div>

      {/* Pesan */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {chat.pesan.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-3xl mb-3">💬</div>
            <p className="text-sm font-medium text-foreground">Mulai percakapan!</p>
            <p className="mt-1 text-xs text-muted-foreground">Kirim pesan pertamamu ke {chat.lawanKode}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(({ tanggal, pesan: pesanHari }) => (
              <div key={tanggal}>
                <div className="flex justify-center my-4">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                    {tanggal}
                  </span>
                </div>
                <div className="space-y-2">
                  {pesanHari.map((p) => {
                    const isMine = p.pengirim === kode;
                    return (
                      <div key={p.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isMine
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-card border border-border text-foreground rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{p.isi}</p>
                          <p className={`mt-1 text-[10px] ${isMine ? "text-primary-foreground/60 text-right" : "text-muted-foreground"}`}>
                            {formatWaktu(p.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3">
        <div className="flex items-end gap-3">
          <textarea
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                kirimPesan();
              }
            }}
            placeholder="Ketik pesan..."
            rows={1}
            style={{ resize: "none" }}
            className="flex-1 min-h-[40px] max-h-[120px] rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={kirimPesan}
            disabled={!isi.trim() || kirimLoading}
            className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {kirimLoading ? "…" : "↑"}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          Enter untuk kirim · Shift+Enter untuk baris baru
        </p>
      </div>
    </div>
  );
}
