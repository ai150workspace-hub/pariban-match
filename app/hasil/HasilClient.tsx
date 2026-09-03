"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { StatusAdatBadge } from "@/components/ui/status-adat-badge";

const IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
const SNAP_JS = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    faceapi?: any;
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

const PREMIUM_THRESHOLD = 90;

type PaketId = "1bln" | "3bln" | "6bln";

interface PaketInfo {
  id: PaketId;
  nama: string;
  deskripsi: string;
  harga: number;
  hargaCoret: number | null;
  perBulan: number | null;
  hemat: string | null;
  badge: string | null;
}

const PAKET: PaketInfo[] = [
  {
    id: "1bln",
    nama: "1 Bulan",
    deskripsi: "Akses penuh selama 30 hari",
    harga: 19900,
    hargaCoret: null,
    perBulan: null,
    hemat: null,
    badge: null,
  },
  {
    id: "3bln",
    nama: "3 Bulan",
    deskripsi: "90 hari akses penuh tanpa batas",
    harga: 49900,
    hargaCoret: 59700,
    perBulan: 16633,
    hemat: "Hemat ~16%",
    badge: null,
  },
  {
    id: "6bln",
    nama: "6 Bulan",
    deskripsi: "180 hari akses penuh tanpa batas",
    harga: 89900,
    hargaCoret: 119400,
    perBulan: 14983,
    hemat: "Hemat ~25%",
    badge: "Paling Hemat",
  },
];

interface Rinci {
  bibit: number;
  bebet: number;
  bobot: number;
  kepribadian: number;
}

interface Adat {
  status: "AMAN" | "PARIBAN" | "PERLU_DICEK" | "DIBLOKIR";
  label: string;
  alasan: string;
}

interface Bio {
  catatan?: string;
  pekerjaan?: string;
  jabatan?: string;
  tinggiBadan?: number;
  beratBadan?: string;
  minat?: string[];
  sosmedLinkedIn?: string;
  sosmedInstagram?: string;
  sosmedTikTok?: string;
}

interface ProfilMatch {
  agama: string;
  pendidikan: string;
  kerja: string;
  ibadah: string;
  rokok: string;
  alkohol: string;
  pindah: string;
  ldr: string;
  timeline: string;
  anak: string;
  margaIbu: string;
}

interface Match {
  kode: string;
  nama: string;
  marga: string;
  gender: string;
  kota: string;
  usia: number;
  skor: number;
  fotoUrl: string | null;
  rinci: Rinci;
  adat: Adat;
  saling: boolean;
  profil?: ProfilMatch;
  bio?: Bio;
}

interface PesertaInfo {
  kode: string;
  inisial: string;
  marga: string;
  margaIbu: string;
  gender: string;
  kota: string;
  usia: number;
  agama: string;
  pendidikan: string;
  kerja: string;
  ibadah: string;
  rokok: string;
  alkohol: string;
  pindah: string;
  ldr: string;
  timeline: string;
  tabungan: string;
  anak: string;
  ortu: string;
  catatan: string;
  fotoUrl: string | null;
  fotoCount: number;
  fotoLiveVerified: boolean;
  trialEndsAt: string | null;
  premium: boolean;
  premiumExpiry: string | null;
  premiumPaket: string | null;
  pekerjaan?: string;
  jabatan?: string;
  tinggiBadan?: number;
  beratBadan?: string;
  minat?: string[];
}

interface HasilData {
  peserta: PesertaInfo;
  top3: Match[];
}

const PILAR = [
  { key: "bibit" as const, label: "Bibit", max: 30, color: "bg-brand", text: "text-brand" },
  { key: "bebet" as const, label: "Bebet", max: 20, color: "bg-brand", text: "text-brand" },
  { key: "bobot" as const, label: "Bobot", max: 30, color: "bg-brand", text: "text-brand" },
  { key: "kepribadian" as const, label: "Kepribadian", max: 20, color: "bg-brand", text: "text-brand" },
];

function Avatar({
  fotoUrl,
  inisial,
  size = "md",
}: {
  fotoUrl: string | null;
  inisial: string;
  size?: "sm" | "md" | "lg";
}) {
  const [imgError, setImgError] = useState(false);
  const dim =
    size === "lg" ? "h-20 w-20 text-2xl" : size === "sm" ? "h-10 w-10 text-sm" : "h-14 w-14 text-lg";

  if (fotoUrl && !imgError) {
    return (
      <img
        src={fotoUrl}
        alt={inisial}
        onError={() => setImgError(true)}
        className={`${dim} rounded-full object-cover border-2 border-border`}
      />
    );
  }

  return (
    <div
      className={`${dim} flex items-center justify-center rounded-full bg-primary/15 font-bold text-primary border-2 border-primary/20`}
    >
      {inisial.charAt(0)}
    </div>
  );
}

function ProfilRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <span className="w-32 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function FotoGaleri({ kode, fotoUrl, fotoLiveVerified }: {
  kode: string;
  fotoUrl: string | null;
  fotoLiveVerified: boolean;
}) {
  const MAX = 5;
  const ALL_EXTRA = [2, 3, 4, 5];
  const [loadedExtras, setLoadedExtras] = useState<Set<number>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [faceDetecting, setFaceDetecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceModelLoaded = useRef(false);

  const FACE_MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

  async function detectFaceInBlob(blob: Blob): Promise<boolean> {
    const api = window.faceapi;
    if (!api) return true; // Library belum dimuat — izinkan upload

    try {
      if (!faceModelLoaded.current) {
        await api.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL);
        faceModelLoaded.current = true;
      }
      const imgUrl = URL.createObjectURL(blob);
      try {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("load error"));
          img.src = imgUrl;
        });
        const detection = await api.detectSingleFace(img, new api.TinyFaceDetectorOptions());
        return detection !== undefined;
      } finally {
        URL.revokeObjectURL(imgUrl);
      }
    } catch {
      return true; // Jika deteksi gagal, izinkan upload
    }
  }

  const totalLoaded = 1 + loadedExtras.size;

  function markLoaded(idx: number) {
    setLoadedExtras((prev) => new Set([...prev, idx]));
  }
  function markFailed(idx: number) {
    setLoadedExtras((prev) => { const s = new Set(prev); s.delete(idx); return s; });
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch {
      setAddError("Kamera tidak dapat diakses. Gunakan pilih dari galeri.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  }

  async function uploadPhoto(blob: Blob, isLive: boolean) {
    setAddError("");
    setFaceDetecting(true);
    const hasFace = await detectFaceInBlob(blob);
    setFaceDetecting(false);
    if (!hasFace) {
      setAddError("Foto tidak valid. Harap unggah foto yang memperlihatkan wajah Anda secara jelas.");
      return;
    }

    const nextIdx = totalLoaded + 1;
    const fd = new FormData();
    fd.append("foto", blob, `foto_${nextIdx}.jpg`);
    fd.append("index", String(nextIdx));
    fd.append("isProfile", "false");
    fd.append("isLive", isLive ? "true" : "false");
    setAdding(true);
    try {
      const res = await fetch(`/api/photos/${kode}`, { method: "POST", body: fd });
      if (res.ok) {
        markLoaded(nextIdx);
        setRefreshKey((k) => k + 1);
        setShowAdd(false);
        stopCamera();
      } else {
        const r = await res.json().catch(() => ({}));
        setAddError(r.error || "Gagal upload foto");
      }
    } catch {
      setAddError("Gagal upload foto. Coba lagi.");
    } finally {
      setAdding(false);
    }
  }

  async function jadikanProfil(idx: number) {
    try {
      const imgRes = await fetch(`/api/photos/${kode}?index=${idx}&r=${refreshKey}`);
      if (!imgRes.ok) return;
      const blob = await imgRes.blob();
      const fd = new FormData();
      fd.append("foto", blob, "profile.jpg");
      fd.append("index", String(idx));
      fd.append("isProfile", "true");
      fd.append("isLive", "false");
      const res = await fetch(`/api/photos/${kode}`, { method: "POST", body: fd });
      if (res.ok) { setRefreshKey((k) => k + 1); setSelectedIdx(null); }
    } catch {}
  }

  function captureFromCamera() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      stopCamera();
      uploadPhoto(blob, true);
    }, "image/jpeg", 0.92);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setAddError("Ukuran maksimal 5MB"); return; }
    uploadPhoto(file, false);
  }

  const profileUrl = `${fotoUrl || `/api/photos/${kode}`}?r=${refreshKey}`;

  return (
    <>
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center text-xl hover:bg-white/30"
            onClick={() => setPreviewUrl(null)}
          >✕</button>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Foto Saya</h3>
          <span className="text-xs text-muted-foreground">{totalLoaded}/5 foto · klik foto untuk zoom</span>
        </div>

        {showCamera && (
          <div className="mb-4">
            <div className="relative overflow-hidden rounded-xl bg-black aspect-[4/3] max-h-64">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3">
                <button type="button" onClick={captureFromCamera} disabled={adding}
                  className="h-12 w-12 rounded-full bg-white border-4 border-primary shadow-lg flex items-center justify-center text-2xl">
                  📸
                </button>
                <button type="button" onClick={stopCamera}
                  className="h-10 w-10 rounded-full bg-black/60 text-white flex items-center justify-center">
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <div className="relative group">
            <img
              src={profileUrl}
              alt="Foto profil"
              onClick={() => setPreviewUrl(profileUrl)}
              className={`h-24 w-24 rounded-xl object-cover border-2 cursor-zoom-in transition-all group-hover:brightness-90 ${selectedIdx === 0 ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
            />
            <span className="absolute top-1 left-1 rounded-full bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 leading-tight shadow pointer-events-none">
              ★ PROFIL
            </span>
            {fotoLiveVerified && (
              <span className="absolute bottom-1 left-1 right-1 rounded-full bg-adat-aman text-white text-[9px] font-bold text-center py-0.5 shadow pointer-events-none">
                ✓ LIVE
              </span>
            )}
            <button
              type="button"
              onClick={() => setSelectedIdx(selectedIdx === 0 ? null : 0)}
              className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/10 transition-all"
            />
          </div>

          {ALL_EXTRA.map((idx) => {
            const src = `/api/photos/${kode}?index=${idx}&r=${refreshKey}`;
            return (
              <div
                key={idx}
                className={`relative group ${loadedExtras.has(idx) ? "block" : "hidden"}`}
              >
                <img
                  src={src}
                  alt={`Foto ${idx}`}
                  onLoad={() => markLoaded(idx)}
                  onError={() => markFailed(idx)}
                  onClick={() => setPreviewUrl(src)}
                  className={`h-24 w-24 rounded-xl object-cover border-2 cursor-zoom-in transition-all group-hover:brightness-90 ${selectedIdx === idx ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedIdx(selectedIdx === idx ? null : idx); }}
                  className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/10 transition-all"
                />
              </div>
            );
          })}

          {totalLoaded < MAX && !showCamera && (
            <button
              type="button"
              onClick={() => { setShowAdd(true); setSelectedIdx(null); setAddError(""); }}
              className="h-24 w-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
            >
              <span className="text-2xl font-light">+</span>
              <span className="text-[10px]">Tambah</span>
            </button>
          )}
        </div>

        {selectedIdx !== null && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setPreviewUrl(selectedIdx === 0 ? profileUrl : `/api/photos/${kode}?index=${selectedIdx}&r=${refreshKey}`)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors"
            >
              🔍 Lihat Besar
            </button>
            {selectedIdx !== 0 && (
              <button type="button" onClick={() => jadikanProfil(selectedIdx)}
                className="rounded-lg border border-accent/50 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors">
                ★ Jadikan Foto Profil
              </button>
            )}
            <label className="cursor-pointer rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors">
              🔄 Ganti
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file || file.size > 5 * 1024 * 1024) { setAddError("Ukuran maksimal 5MB"); return; }
                  const isProf = selectedIdx === 0;
                  const fd = new FormData();
                  fd.append("foto", file, `foto_replace.jpg`);
                  fd.append("index", String(selectedIdx === 0 ? 1 : selectedIdx));
                  fd.append("isProfile", isProf ? "true" : "false");
                  fd.append("isLive", "false");
                  setAdding(true);
                  const res = await fetch(`/api/photos/${kode}`, { method: "POST", body: fd });
                  setAdding(false);
                  if (res.ok) { setRefreshKey((k) => k + 1); setSelectedIdx(null); }
                  else { const r = await res.json().catch(() => ({})); setAddError(r.error || "Gagal mengganti foto"); }
                }}
              />
            </label>
            <button
              type="button"
              onClick={async () => {
                if (!confirm("Hapus foto ini?")) return;
                const idxParam = selectedIdx === 0 ? "" : `?index=${selectedIdx}`;
                const res = await fetch(`/api/photos/${kode}${idxParam}`, { method: "DELETE" });
                if (res.ok) {
                  if (selectedIdx !== 0) markFailed(selectedIdx);
                  setRefreshKey((k) => k + 1);
                  setSelectedIdx(null);
                } else {
                  setAddError("Gagal menghapus foto");
                }
              }}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 transition-colors dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
            >
              🗑️ Hapus
            </button>
            {selectedIdx === 0 && (
              <span className="text-xs text-muted-foreground py-1">Ini foto profil utama yang dilihat kandidat lain</span>
            )}
            <button type="button" onClick={() => setSelectedIdx(null)}
              className="ml-auto rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              Tutup
            </button>
          </div>
        )}

        {showAdd && !showCamera && (
          <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Tambah foto baru</p>
            <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-3 py-2">
              <p className="text-xs text-orange-700 dark:text-orange-400 leading-relaxed">
                ⚠️ Harap unggah foto asli yang memperlihatkan wajah Anda. Foto berupa logo, pemandangan, atau objek lain akan ditolak otomatis.
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={startCamera} disabled={faceDetecting || adding}
                className="flex-1 flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-4 hover:border-primary/50 transition-colors disabled:opacity-50">
                <span className="text-2xl">📸</span>
                <span className="text-xs font-medium text-foreground">Foto Live</span>
                <span className="text-[10px] text-adat-aman font-semibold">+ Badge Terverifikasi</span>
              </button>
              <label className={`flex-1 flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-4 hover:border-primary/50 transition-colors ${faceDetecting || adding ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
                <span className="text-2xl">🖼️</span>
                <span className="text-xs font-medium text-foreground">Dari Galeri</span>
                <span className="text-[10px] text-muted-foreground">JPG/PNG/WebP · 5MB</span>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileChange} className="hidden" disabled={faceDetecting || adding} />
              </label>
            </div>
            {faceDetecting && (
              <p className="text-xs text-primary animate-pulse">🔍 Memverifikasi wajah pada foto...</p>
            )}
            {addError && <p className="text-xs text-red-600">{addError}</p>}
            {adding && <p className="text-xs text-muted-foreground animate-pulse">Mengunggah foto...</p>}
            <button type="button" onClick={() => { setShowAdd(false); setAddError(""); }}
              className="text-xs text-muted-foreground hover:text-foreground">
              Batal
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function ProfilLengkapSaya({ p }: { p: PesertaInfo }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-6 rounded-2xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <span className="font-bold text-foreground">Profil Lengkap Saya</span>
        <span className="text-muted-foreground text-lg">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-border px-6 py-4">
          <div className="grid sm:grid-cols-2 gap-x-8">
            <div>
              <ProfilRow label="Marga" value={p.marga} />
              <ProfilRow label="Marga Ibu" value={p.margaIbu} />
              <ProfilRow label="Agama" value={p.agama} />
              <ProfilRow label="Domisili" value={p.kota} />
              <ProfilRow label="Pendidikan" value={p.pendidikan} />
              <ProfilRow label="Status Kerja" value={p.kerja} />
              {p.pekerjaan && <ProfilRow label="Pekerjaan" value={p.jabatan ? `${p.jabatan} — ${p.pekerjaan}` : p.pekerjaan} />}
              {p.tinggiBadan && <ProfilRow label="Tinggi/Berat" value={`${p.tinggiBadan} cm${p.beratBadan ? ` · ${p.beratBadan}` : ""}`} />}
            </div>
            <div>
              <ProfilRow label="Ibadah" value={p.ibadah} />
              <ProfilRow label="Rokok" value={p.rokok} />
              <ProfilRow label="Alkohol" value={p.alkohol} />
              <ProfilRow label="Siap Pindah" value={p.pindah} />
              <ProfilRow label="LDR" value={p.ldr} />
              <ProfilRow label="Target Nikah" value={p.timeline} />
              <ProfilRow label="Tabungan" value={p.tabungan} />
              <ProfilRow label="Rencana Anak" value={p.anak} />
              <ProfilRow label="Tinggal Bersama" value={p.ortu} />
            </div>
          </div>
          {p.minat && p.minat.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {p.minat.map((m) => (
                <span key={m} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{m}</span>
              ))}
            </div>
          )}
          {p.catatan && (
            <p className="mt-3 text-sm text-muted-foreground italic">&quot;{p.catatan}&quot;</p>
          )}
        </div>
      )}
    </div>
  );
}

function ProfilMatchDetail({ profil }: { profil?: ProfilMatch }) {
  if (!profil) return null;
  return (
    <div className="border-t border-border px-6 py-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detail Profil</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
        <ProfilRow label="Agama" value={profil.agama} />
        <ProfilRow label="Marga Ibu" value={profil.margaIbu} />
        <ProfilRow label="Pendidikan" value={profil.pendidikan} />
        <ProfilRow label="Status Kerja" value={profil.kerja} />
        <ProfilRow label="Ibadah" value={profil.ibadah} />
        <ProfilRow label="Rokok" value={profil.rokok} />
        <ProfilRow label="Siap Pindah" value={profil.pindah} />
        <ProfilRow label="LDR" value={profil.ldr} />
        <ProfilRow label="Target Nikah" value={profil.timeline} />
        <ProfilRow label="Rencana Anak" value={profil.anak} />
      </div>
    </div>
  );
}

function BioSection({ bio }: { bio?: Bio }) {
  if (!bio) return null;
  const hasAny =
    bio.pekerjaan || bio.jabatan || bio.tinggiBadan || bio.beratBadan ||
    (bio.minat && bio.minat.length > 0) ||
    bio.sosmedLinkedIn || bio.sosmedInstagram || bio.sosmedTikTok;
  if (!hasAny) return null;

  return (
    <div className="border-t border-border px-6 py-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bio Profil</p>
      <div className="flex flex-wrap gap-2">
        {bio.pekerjaan && (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
            💼 {bio.jabatan ? `${bio.jabatan} — ${bio.pekerjaan}` : bio.pekerjaan}
          </span>
        )}
        {bio.tinggiBadan && (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
            📏 {bio.tinggiBadan} cm {bio.beratBadan ? `· ${bio.beratBadan}` : ""}
          </span>
        )}
        {bio.minat?.map((m) => (
          <span key={m} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
            {m}
          </span>
        ))}
        {bio.sosmedLinkedIn && (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">in {bio.sosmedLinkedIn}</span>
        )}
        {bio.sosmedInstagram && (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">@{bio.sosmedInstagram}</span>
        )}
        {bio.sosmedTikTok && (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">TikTok: {bio.sosmedTikTok}</span>
        )}
      </div>
    </div>
  );
}

export default function HasilClient({ kode }: { kode: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<HasilData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [snapReady, setSnapReady] = useState(false);
  const [showPaketModal, setShowPaketModal] = useState(false);
  const [chatLoading, setChatLoading] = useState<string | null>(null);
  const [chatError, setChatError] = useState("");
  const [candidatePhotoPreview, setCandidatePhotoPreview] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/matching/${kode}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Data tidak ditemukan");
        return;
      }
      setData(await res.json());
    } catch {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [kode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      loadData();
    }
  }, [searchParams, loadData]);

  async function handleUpgrade(paket: PaketId) {
    if (!snapReady || !window.snap) {
      setPayError("Sistem pembayaran belum siap, coba lagi sebentar.");
      return;
    }
    setPayLoading(true);
    setPayError("");
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode, paket }),
      });
      const result = await res.json();
      if (!res.ok) {
        setPayError(result.error || "Gagal membuat transaksi");
        return;
      }
      window.snap.pay(result.snapToken, {
        onSuccess: () => { setShowPaketModal(false); loadData(); },
        onPending: () => setPayError("Pembayaran menunggu konfirmasi."),
        onError: () => setPayError("Pembayaran gagal. Silakan coba lagi."),
        onClose: () => setPayLoading(false),
      });
    } catch {
      setPayError("Gagal menghubungi server pembayaran.");
    } finally {
      setPayLoading(false);
    }
  }

  async function bukaChat(lawanKode: string) {
    setChatLoading(lawanKode);
    setChatError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode, lawanKode }),
      });
      const result = await res.json();
      if (!res.ok) {
        setChatError(result.error || "Gagal membuka chat");
        return;
      }
      router.push(`/chat/${result.id}?kode=${kode}`);
    } catch {
      setChatError("Gagal menghubungi server chat.");
    } finally {
      setChatLoading(null);
    }
  }

  async function handleKeluar() {
    await fetch("/api/keluar", { method: "POST" });
    router.push("/masuk");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Memuat hasil...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <p className="text-lg font-semibold text-foreground">
          {error || "Data tidak ditemukan"}
        </p>
        <Link href="/" className="mt-4 text-sm text-primary hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const { peserta, top3 } = data;
  const now = new Date();

  const isTrialActive = !!(peserta.trialEndsAt && new Date(peserta.trialEndsAt) > now);
  const isPaidPremium =
    !!(peserta.premium && (!peserta.premiumExpiry || new Date(peserta.premiumExpiry) > now));
  // Full access = either trial active OR paid premium active
  const isPremium = isTrialActive || isPaidPremium;

  // Days remaining in trial
  const trialDaysLeft = isTrialActive && peserta.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(peserta.trialEndsAt).getTime() - now.getTime()) / 86400000))
    : 0;

  // Trial just expired (has trialEndsAt but expired, no paid premium)
  const trialExpired = !!(peserta.trialEndsAt && !isTrialActive && !isPaidPremium);

  const expiryLabel = peserta.premiumExpiry
    ? new Date(peserta.premiumExpiry).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Script
        src={SNAP_JS}
        data-client-key={CLIENT_KEY}
        strategy="lazyOnload"
        onLoad={() => setSnapReady(true)}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js"
        strategy="lazyOnload"
      />

      {/* Preview foto kandidat */}
      {candidatePhotoPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setCandidatePhotoPreview(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center text-xl hover:bg-white/30"
            onClick={() => setCandidatePhotoPreview(null)}
          >✕</button>
          <img
            src={candidatePhotoPreview}
            alt="Preview"
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Paket / Paywall Modal */}
      {showPaketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            {trialExpired ? (
              <>
                <div className="mb-5 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-3xl">⏰</div>
                  <h3 className="font-heading text-xl font-bold text-foreground">Trial Gratis Telah Berakhir</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Masa trial 7 hari kamu sudah habis. Pilih paket berlangganan untuk tetap bisa mengakses semua fitur PARIBAN Premium.
                  </p>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-heading text-xl font-bold text-foreground">Pilih Paket Premium</h3>
                <p className="mt-1 text-sm text-muted-foreground mb-5">Akses penuh semua hasil matching tanpa batas</p>
              </>
            )}

            <div className={`space-y-3 ${trialExpired ? "" : "mt-0"}`}>
              {PAKET.map((pk) => (
                <button
                  key={pk.id}
                  onClick={() => handleUpgrade(pk.id)}
                  disabled={payLoading}
                  className={`w-full flex items-center justify-between rounded-xl border px-5 py-4 hover:border-accent/40 hover:bg-accent/5 transition-colors text-left disabled:opacity-60 ${
                    pk.badge === "Paling Hemat"
                      ? "border-accent/50 bg-accent/5"
                      : "border-border bg-secondary/50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{pk.nama}</p>
                      {pk.badge && (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold leading-tight ${
                          pk.badge === "Paling Hemat"
                            ? "bg-accent text-white"
                            : "bg-primary/10 text-primary"
                        }`}>
                          {pk.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{pk.deskripsi}</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    {pk.hargaCoret && (
                      <p className="text-xs text-muted-foreground line-through">
                        Rp {pk.hargaCoret.toLocaleString("id-ID")}
                      </p>
                    )}
                    <p className="font-bold text-primary">Rp {pk.harga.toLocaleString("id-ID")}</p>
                    {pk.perBulan && (
                      <p className="text-[10px] text-muted-foreground">
                        Rp {pk.perBulan.toLocaleString("id-ID")}/bln
                      </p>
                    )}
                    {pk.hemat && <p className="text-xs text-green-600 font-medium">{pk.hemat}</p>}
                  </div>
                </button>
              ))}
            </div>

            {payError && <p className="mt-3 text-sm text-red-600">{payError}</p>}

            <button
              onClick={() => { setShowPaketModal(false); setPayError(""); }}
              className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold tracking-[0.15em] text-primary">
            PARIBAN
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Hasil Pencocokan</span>
            <button
              onClick={handleKeluar}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Peserta Header */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-5">
            <Avatar fotoUrl={peserta.fotoUrl} inisial={peserta.inisial} size="lg" />
            <div className="flex-1">
              <h1 className="mt-1 font-heading text-3xl font-bold leading-tight text-foreground">
                {peserta.inisial}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {peserta.gender === "Perempuan" ? "♀" : "♂"} {peserta.gender} ·{" "}
                {peserta.usia} tahun · {peserta.marga} · {peserta.kota}
              </p>
            </div>
            {isPaidPremium && (
              <div className="text-right">
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent border border-accent/30">
                  ★ PREMIUM
                </span>
                {expiryLabel && (
                  <p className="mt-1 text-xs text-muted-foreground">s/d {expiryLabel}</p>
                )}
              </div>
            )}
            {isTrialActive && (
              <div className="text-right">
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary border border-primary/30">
                  ✦ TRIAL GRATIS
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  {trialDaysLeft === 0 ? "Berakhir hari ini" : `Tersisa ${trialDaysLeft} hari`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Banner trial aktif */}
        {isTrialActive && (
          <div className={`mb-6 rounded-xl border p-4 flex items-center gap-4 ${
            trialDaysLeft <= 2
              ? "border-orange-300 bg-orange-50/50 dark:bg-orange-900/10"
              : "border-primary/20 bg-primary/5"
          }`}>
            <span className="text-2xl shrink-0">{trialDaysLeft <= 2 ? "⏰" : "✦"}</span>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${trialDaysLeft <= 2 ? "text-orange-700 dark:text-orange-400" : "text-primary"}`}>
                {trialDaysLeft <= 2
                  ? `Trial gratis berakhir dalam ${trialDaysLeft === 0 ? "kurang dari 24 jam" : `${trialDaysLeft} hari`}!`
                  : `Trial Premium — tersisa ${trialDaysLeft} hari`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {trialDaysLeft <= 2
                  ? "Berlangganan sekarang agar akses tidak terputus."
                  : "Kamu menikmati akses penuh selama periode trial. Berlangganan agar tidak terputus."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPaketModal(true)}
              className={`shrink-0 inline-flex h-9 items-center rounded-lg px-4 text-xs font-semibold text-white transition-colors ${
                trialDaysLeft <= 2 ? "bg-orange-500 hover:bg-orange-600" : "bg-primary hover:bg-primary/90"
              }`}
            >
              Berlangganan
            </button>
          </div>
        )}

        {/* Banner trial expired — paywall */}
        {trialExpired && (
          <div className="mb-6 rounded-xl border border-orange-300 bg-orange-50/50 dark:bg-orange-900/10 p-5">
            <div className="flex items-start gap-4">
              <span className="text-2xl">⏰</span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Masa Trial Gratis Kamu Sudah Berakhir</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Trial 7 hari telah habis. Pilih paket berlangganan untuk tetap bisa mengakses semua fitur, termasuk chat dengan kandidat saling cocok.
                </p>
                {payError && <p className="mt-2 text-sm text-red-600">{payError}</p>}
                <button
                  type="button"
                  onClick={() => setShowPaketModal(true)}
                  className="mt-3 inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  Pilih Paket Berlangganan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Banner upgrade untuk non-trial user */}
        {!isPremium && !trialExpired && !isTrialActive && top3.some((m) => m.skor > PREMIUM_THRESHOLD) && (
          <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 p-5">
            <div className="flex items-start gap-4">
              <span className="text-2xl">🔒</span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Ada kecocokan tinggi yang tersembunyi</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Beberapa kandidat memiliki skor di atas 90. Pilih paket berlangganan untuk melihat hasil lengkap.
                </p>
                {payError && <p className="mt-2 text-sm text-red-600">{payError}</p>}
                <button
                  type="button"
                  onClick={() => setShowPaketModal(true)}
                  className="mt-3 inline-flex h-9 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
                >
                  Lihat Paket Premium
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Galeri Foto */}
        <FotoGaleri
          kode={peserta.kode}
          fotoUrl={peserta.fotoUrl}
          fotoLiveVerified={peserta.fotoLiveVerified}
        />

        {/* Profil Lengkap Saya */}
        <ProfilLengkapSaya p={peserta} />

        {/* Heading */}
        <div className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">Hasil Pencocokan</p>
          <h2 className="font-heading text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            Top 3 Kecocokan
          </h2>
        </div>

        {chatError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {chatError}
          </div>
        )}

        {top3.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-lg font-bold text-foreground">Belum ada kandidat yang cocok</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Sistem pencocokan berjalan otomatis — hasil muncul segera setelah ada peserta lain yang memenuhi kriteria agama, usia, dan adat.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {top3.map((m, i) => {
              return (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl border bg-card ${
                    m.saling ? "border-accent/40" : "border-border"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between p-6 pb-0">
                      <div className="flex items-start gap-4">
                        <button
                          type="button"
                          onClick={() => m.fotoUrl && setCandidatePhotoPreview(m.fotoUrl)}
                          className={m.fotoUrl ? "cursor-zoom-in" : "cursor-default"}
                          title={m.fotoUrl ? "Klik untuk perbesar foto" : undefined}
                        >
                          <Avatar fotoUrl={m.fotoUrl} inisial={m.nama} size="md" />
                        </button>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-muted-foreground">Peringkat {i + 1}</span>
                            {m.saling && (
                              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-bold text-accent">
                                SALING COCOK ♥
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1 text-xl font-bold text-foreground">{m.nama}</h3>
                          <p className="text-sm text-muted-foreground">
                            {m.gender === "Perempuan" ? "♀" : "♂"} {m.usia} tahun · {m.marga} · {m.kota}
                          </p>
                          {m.bio?.catatan && (
                            <p className="mt-1.5 text-sm text-muted-foreground italic line-clamp-2">
                              &quot;{m.bio.catatan.length > 100 ? m.bio.catatan.slice(0, 100) + "…" : m.bio.catatan}&quot;
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                        <span className="text-2xl font-bold text-primary">{m.skor}</span>
                      </div>
                    </div>

                    <div className="px-6 py-4">
                      <StatusAdatBadge status={m.adat.status} label={m.adat.label} />
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {m.adat.alasan}
                      </p>
                    </div>

                    <ProfilMatchDetail profil={m.profil} />
                    <BioSection bio={m.bio} />

                    <div className="border-t border-border px-6 py-5">
                      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Breakdown Skor
                      </p>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {PILAR.map((p) => (
                          <div key={p.key} className="text-center">
                            <p className={`text-2xl font-bold ${p.text}`}>{m.rinci[p.key]}</p>
                            <div className="mx-auto mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                              <div
                                className={`h-full rounded-full ${p.color}`}
                                style={{ width: `${(m.rinci[p.key] / p.max) * 100}%` }}
                              />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {p.label} ({p.max})
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {m.saling && (
                      <div className="border-t border-accent/20 bg-accent/5 px-6 py-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-foreground">♥ Kamu dan {m.nama} saling cocok!</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {isPremium ? "Mulai percakapan sekarang" : "Berlangganan untuk mulai chat"}
                          </p>
                        </div>
                        {isPremium ? (
                          <button
                            type="button"
                            onClick={() => bukaChat(m.kode)}
                            disabled={chatLoading === m.kode}
                            className="shrink-0 inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90 transition-colors disabled:opacity-60"
                          >
                            {chatLoading === m.kode ? "Membuka..." : "Mulai Chat"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowPaketModal(true)}
                            className="shrink-0 inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
                          >
                            🔓 Pilih Paket
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 rounded-xl bg-secondary/50 p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Status &quot;Perlu Dicek&quot; bukan larangan — artinya perlu dipastikan ke
            keluarga. Hubungi kami jika ada pertanyaan.
          </p>
        </div>
      </div>
    </div>
  );
}
