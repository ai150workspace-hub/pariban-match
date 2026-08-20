"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { StepIndicator } from "@/components/daftar/step-indicator";
import { FormField } from "@/components/daftar/form-field";
import { MargaSelect } from "@/components/daftar/marga-select";
import { KOTA_PER_PROVINSI, PROVINSI_LIST } from "@/lib/wilayah";

const INITIAL = {
  nama: "",
  email: "",
  wa: "",
  password: "",
  confirmPassword: "",
  gender: "",
  tahunLahir: "",
  kota: "",
  agama: "",
  cariAgama: "",
  suku: "",
  marga: "",
  margaIbu: "",
  subMarga: "",
  klgBesar: "",
  ibadah: "",
  rokok: "",
  alkohol: "",
  anakKe: "",
  pendidikan: "",
  kerja: "",
  pindah: "",
  ldr: "",
  timeline: "",
  tabungan: "",
  anak: "",
  ortu: "",
  bahasaKasih: "",
  konflik: "",
  introvert: "",
  bolehHubung: "",
  catatan: "",
  // Bio opsional
  pekerjaan: "",
  jabatan: "",
  tinggiBadan: "",
  beratBadan: "",
  sosmedLinkedIn: "",
  sosmedInstagram: "",
  sosmedTikTok: "",
};

const AGAMA = [
  "Kristen Protestan",
  "Kristen Katolik",
  "Islam",
  "Buddha",
  "Hindu",
  "Lainnya",
] as const;

const SUKU = [
  "Batak Toba",
  "Batak Simalungun",
  "Batak Karo",
  "Batak Pakpak/Dairi",
  "Batak Angkola/Mandailing",
  "Lainnya",
] as const;

const CARI_AGAMA = ["Harus sama dengan saya", "Terbuka"] as const;
const IBADAH = ["Setiap minggu", "Beberapa kali sebulan", "Sesekali", "Jarang"] as const;
const ROKOK = ["Tidak merokok", "Kadang", "Ya, rutin"] as const;
const ALKOHOL = ["Tidak sama sekali", "Sesekali di acara keluarga", "Ya, sosial"] as const;
const ANAK_KE = ["Anak sulung", "Anak tengah", "Anak bungsu", "Anak tunggal"] as const;
const PENDIDIKAN = ["SMA/SMK", "D3", "S1", "S2", "S3"] as const;
const KERJA = ["Karyawan swasta", "Wiraswasta/Pengusaha/Entrepreneur", "Profesional/Freelance", "PNS/TNI/Polri", "Sedang mencari"] as const;
const SEDIA = ["Ya", "Bisa dipertimbangkan", "Tidak"] as const;
const TIMELINE = ["Dalam 1 tahun", "1–2 tahun", "2–3 tahun", "Belum tahu"] as const;
const TABUNGAN = ["Sudah ada", "Sedang menabung", "Belum mulai"] as const;
const ANAK_OPT = ["Ingin 1–2 anak", "Ingin 3+ anak", "Belum memutuskan"] as const;
const ORTU = ["Berdua dengan pasangan", "Bersama orang tua"] as const;
const BAHASA_KASIH = ["Quality Time", "Acts of Service", "Physical Touch", "Words of Affirmation", "Receiving Gifts"] as const;
const KONFLIK = ["Bicara segera", "Butuh waktu dulu", "Menghindari konflik"] as const;
const BOLEH_HUBUNG = ["Ya, silakan hubungkan", "Saya ingin pertimbangkan dulu", "Tidak, hanya ingin tahu hasil"] as const;
const KLG = ["1", "2", "3", "4", "5", ">5"] as const;
const INTRO = ["1", "2", "3", "4", "5"] as const;
const BERAT_BADAN = ["Kurus", "Sedang", "Berisi"] as const;
const MINAT_OPTIONS = [
  "Travelling", "Musik", "Olahraga", "Memasak", "Membaca",
  "Fotografi", "Gaming", "Hiking", "Film & Series", "Seni",
  "Teknologi", "Berkebun", "Yoga", "Kuliner", "Volunteering",
] as const;

// ── Banner motivasi untuk steps 2-4 ──────────────────────────────────────
function MotivationBanner() {
  return (
    <div className="mb-8 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <span className="text-lg shrink-0">😊</span>
      <p className="text-sm text-foreground leading-relaxed">
        Lewat pertanyaan ini, calon Pariban bisa mengenal Anda dengan baik, dan juga sebaliknya.
      </p>
    </div>
  );
}

// ── Validasi per step ─────────────────────────────────────────────────────
function isStepValid(step: number, data: typeof INITIAL, fromOAuth: boolean): boolean {
  switch (step) {
    case 0:
      if (fromOAuth) return !!data.nama.trim() && !!data.email.trim();
      return false; // Step 0 direct: user must click OAuth button
    case 1:
      return (
        !!data.wa.trim() &&
        !!data.password && data.password.length >= 8 &&
        !!data.confirmPassword && data.password === data.confirmPassword &&
        !!data.gender &&
        !!data.tahunLahir &&
        !!data.kota &&
        !!data.agama &&
        !!data.suku &&
        !!data.marga
      );
    case 2:
      return (
        !!data.klgBesar &&
        !!data.ibadah &&
        !!data.rokok &&
        !!data.alkohol &&
        !!data.anakKe &&
        !!data.pendidikan &&
        !!data.kerja
      );
    case 3:
      return (
        !!data.cariAgama &&
        !!data.pindah &&
        !!data.ldr &&
        !!data.timeline &&
        !!data.tabungan &&
        !!data.anak &&
        !!data.ortu
      );
    case 4:
      return !!data.bahasaKasih && !!data.konflik && !!data.introvert && !!data.bolehHubung;
    default:
      return true; // step 5 semua opsional
  }
}

function DaftarForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL);
  const [provinsi, setProvinsi] = useState("");
  const [fromOAuth, setFromOAuth] = useState(false);

  useEffect(() => {
    const emailFromOAuth = searchParams.get("email");
    const namaFromOAuth = searchParams.get("nama");
    if (emailFromOAuth) {
      setFromOAuth(true);
      setData((prev) => ({
        ...prev,
        email: emailFromOAuth,
        ...(namaFromOAuth ? { nama: namaFromOAuth } : {}),
      }));
      // Jika sudah ada email dari OAuth + consent, langsung ke step 1
      setStep(1);
    }
  }, [searchParams]);

  const [minat, setMinat] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kode, setKode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null);
  type FotoEntry = { id: string; preview: string; isLive: boolean; uploaded: boolean; blob?: Blob };
  const [fotos, setFotos] = useState<FotoEntry[]>([]);
  const [profileId, setProfileId] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const [fotoError, setFotoError] = useState("");
  const [fotoUploadLoading, setFotoUploadLoading] = useState(false);
  const [fotosAllDone, setFotosAllDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Log sekali per sesi — hindari double count dari refresh
    if (sessionStorage.getItem("daftar_logged")) return;
    sessionStorage.setItem("daftar_logged", "1");
    fetch("/api/daftar/log", { method: "POST" }).catch(() => {});
  }, []);

  function set(name: string, value: string) {
    setData((prev) => ({ ...prev, [name]: value }));
  }

  function next() {
    if (step < 5) setStep(step + 1);
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  function toggleMinat(m: string) {
    setMinat((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : prev.length < 5 ? [...prev, m] : prev,
    );
  }

  async function handleOAuth(provider: "google" | "facebook") {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl: "/oauth/callback" });
    setOauthLoading(null);
  }

  async function handleSubmit() {
    if (data.password && data.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (data.password && data.password !== data.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        ...data,
        ...(minat.length > 0 && { minat }),
        ...(data.tinggiBadan && { tinggiBadan: Number(data.tinggiBadan) }),
        ...(data.password && { password: data.password }),
      };
      const res = await fetch("/api/peserta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Terjadi kesalahan");
        return;
      }
      setKode(result.kode);
      setSubmitted(true);
    } catch {
      setError("Gagal mengirim data. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  }

  function addFotoFromFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (fotos.length + files.length > 5) {
      setFotoError("Maksimal 5 foto");
      return;
    }
    setFotoError("");
    files.forEach((file) => {
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
        setFotoError("Format harus JPG, PNG, atau WebP");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFotoError("Ukuran maksimal 5MB per foto");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const id = `g_${Date.now()}_${Math.random()}`;
        setFotos((prev) => {
          const entry: FotoEntry = { id, preview: ev.target?.result as string, isLive: false, uploaded: false, blob: file };
          const next = [...prev, entry];
          if (!profileId && next.length === 1) setProfileId(id);
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      setFotoError("Kamera tidak dapat diakses. Gunakan pilih dari galeri.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  }

  function captureFromCamera() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const preview = canvas.toDataURL("image/jpeg");
      const id = `live_${Date.now()}`;
      setFotos((prev) => {
        const entry: FotoEntry = { id, preview, isLive: true, uploaded: false, blob };
        const next = [...prev, entry];
        if (!profileId && next.length === 1) setProfileId(id);
        return next;
      });
    }, "image/jpeg", 0.92);
    stopCamera();
  }

  function removeFoto(id: string) {
    setFotos((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (profileId === id && next.length > 0) setProfileId(next[0].id);
      if (next.length === 0) setProfileId("");
      return next;
    });
  }

  async function uploadAllFotos() {
    if (!kode || fotos.length < 3) return;
    setFotoUploadLoading(true);
    setFotoError("");
    try {
      let index = 1;
      for (const entry of fotos) {
        const isProfile = entry.id === profileId;
        const fd = new FormData();
        const blob = entry.blob ?? await (await fetch(entry.preview)).blob();
        fd.append("foto", blob, `foto_${index}.jpg`);
        fd.append("index", String(index));
        fd.append("isProfile", isProfile ? "true" : "false");
        fd.append("isLive", entry.isLive ? "true" : "false");
        const res = await fetch(`/api/photos/${kode}`, { method: "POST", body: fd });
        if (!res.ok) {
          let errMsg = "Gagal upload foto";
          try { const r = await res.json(); errMsg = r.error || errMsg; } catch {}
          setFotoError(errMsg);
          return;
        }
        index++;
      }
      setFotosAllDone(true);
    } catch {
      setFotoError("Gagal upload foto. Periksa koneksi Anda.");
    } finally {
      setFotoUploadLoading(false);
    }
  }

  if (submitted) {
    const MIN_FOTO = 3;
    const MAX_FOTO = 5;
    const siapUpload = fotos.length >= MIN_FOTO && !!profileId;

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <nav className="border-b border-border bg-card">
          <div className="mx-auto flex h-14 max-w-6xl items-center px-6">
            <Link href="/" className="text-xl font-bold tracking-[0.15em] text-primary">PARIBAN</Link>
          </div>
        </nav>

        <div className="mx-auto w-full max-w-lg px-6 py-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-adat-aman/20 text-3xl">✓</div>
            <h1 className="font-heading text-3xl font-bold leading-tight text-foreground">Pendaftaran Berhasil!</h1>
            <p className="mt-3 text-muted-foreground">
              Terima kasih, <strong>{data.nama}</strong>. Kode peserta:{" "}
              <strong className="font-mono text-primary">{kode}</strong>
            </p>
          </div>

          {fotosAllDone ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="text-lg font-semibold text-foreground mb-1">Foto berhasil diunggah ✓</p>
              <p className="text-sm text-muted-foreground mb-6">Profil Anda sudah lengkap dan siap ditemukan!</p>
              <Link
                href="/hasil"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Lihat Hasil Matching →
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <div>
                <h2 className="font-semibold text-foreground">Foto Profil</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Wajib unggah <strong>minimal 3 foto</strong>. Peserta lain hanya mau chat jika ada foto nyata.
                  Pilih 1 sebagai foto utama profil.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, (fotos.length / MIN_FOTO) * 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${fotos.length >= MIN_FOTO ? "text-adat-aman" : "text-muted-foreground"}`}>
                    {fotos.length}/{MIN_FOTO} foto
                  </span>
                </div>
              </div>

              {showCamera && (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-xl bg-black aspect-[4/3]">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={captureFromCamera}
                        className="h-12 w-12 rounded-full bg-white border-4 border-primary shadow-lg flex items-center justify-center text-xl"
                      >📸</button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="h-10 w-10 rounded-full bg-black/60 text-white flex items-center justify-center text-sm"
                      >✕</button>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Foto live-camera akan mendapat badge "Terverifikasi Live"</p>
                </div>
              )}

              {fotos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {fotos.map((f) => (
                    <div key={f.id} className="relative group">
                      <img
                        src={f.preview}
                        alt="foto"
                        className={`aspect-square w-full rounded-xl object-cover border-2 transition-all ${
                          f.id === profileId ? "border-primary" : "border-border"
                        }`}
                      />
                      {f.isLive && (
                        <span className="absolute top-1.5 left-1.5 rounded-full bg-adat-aman text-white text-[9px] font-bold px-1.5 py-0.5 leading-tight shadow">
                          ✓ LIVE
                        </span>
                      )}
                      {f.id === profileId && (
                        <span className="absolute bottom-1.5 inset-x-1.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold text-center py-0.5 shadow">
                          PROFIL UTAMA
                        </span>
                      )}
                      <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/40 transition-all flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                        {f.id !== profileId && (
                          <button
                            type="button"
                            onClick={() => setProfileId(f.id)}
                            className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow"
                          >
                            Jadikan Profil
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFoto(f.id)}
                          className="rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {fotos.length < MAX_FOTO && !showCamera && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-foreground hover:border-primary/50 hover:bg-secondary/30 transition-colors"
                  >
                    <span className="text-xl">📸</span>
                    <span>Ambil Foto Live</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Dapat badge Terverifikasi</span>
                  </button>
                  <label className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-foreground hover:border-primary/50 hover:bg-secondary/30 transition-colors cursor-pointer">
                    <span className="text-xl">🖼️</span>
                    <span>Dari Galeri</span>
                    <span className="text-[10px] text-muted-foreground font-normal">JPG, PNG, WebP · max 5MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={addFotoFromFile}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <div className="rounded-lg bg-secondary/50 px-4 py-3 text-xs text-muted-foreground space-y-1">
                <p>📸 <strong>Foto Live</strong> — diambil langsung dari kamera, mendapat badge hijau "Terverifikasi". Kandidat lebih yakin ini profil nyata.</p>
                <p>🖼️ <strong>Dari Galeri</strong> — upload foto dari ponsel/komputer, tanpa badge verifikasi.</p>
              </div>

              {fotoError && <p className="text-sm text-red-600">{fotoError}</p>}

              <button
                type="button"
                onClick={uploadAllFotos}
                disabled={!siapUpload || fotoUploadLoading}
                className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {fotoUploadLoading
                  ? "Mengunggah foto..."
                  : !siapUpload
                    ? `Tambahkan ${MIN_FOTO - fotos.length} foto lagi`
                    : "Selesai & Upload Foto"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const canNext = isStepValid(step, data, fromOAuth);
  const kotaList = provinsi ? (KOTA_PER_PROVINSI[provinsi] ?? []) : [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <nav className="border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold tracking-[0.15em] text-primary">
            PARIBAN
          </Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <div className="mb-10">
          <StepIndicator current={step} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
          {/* ── STEP 0: Buat Akun ──────────────────────────────────────────── */}
          {step === 0 && (
            <>
              {fromOAuth ? (
                /* Mode OAuth: email sudah ada, hanya perlu nama */
                <>
                  <h2 className="text-2xl font-bold leading-tight text-foreground">Konfirmasi Akun</h2>
                  <p className="mt-1 text-sm text-muted-foreground mb-6">
                    Akun Anda telah terverifikasi via Google/Facebook.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                      <input
                        type="email"
                        value={data.email}
                        readOnly
                        className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <FormField
                      label="Nama Lengkap"
                      name="nama"
                      value={data.nama}
                      onChange={set}
                      placeholder="Masukkan nama lengkap Anda"
                      required
                    />
                  </div>
                </>
              ) : (
                /* Mode langsung: hanya tampilkan tombol OAuth */
                <>
                  <h2 className="text-2xl font-bold leading-tight text-foreground">Buat Akun</h2>
                  <p className="mt-1 text-sm text-muted-foreground mb-6">
                    Daftar dengan akun Google atau Facebook Anda
                  </p>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleOAuth("google")}
                      disabled={oauthLoading !== null}
                      className="w-full inline-flex h-12 items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      {oauthLoading === "google" ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      Masuk via Gmail (Google)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOAuth("facebook")}
                      disabled={oauthLoading !== null}
                      className="w-full inline-flex h-12 items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      {oauthLoading === "facebook" ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1877F2] border-t-transparent" />
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      )}
                      Masuk via Facebook
                    </button>
                  </div>

                  <p className="mt-6 text-center text-sm text-muted-foreground">
                    Sudah punya akun?{" "}
                    <Link href="/masuk" className="font-medium text-primary hover:underline">
                      Masuk di sini
                    </Link>
                  </p>
                </>
              )}
            </>
          )}

          {/* ── STEP 1: Info Detail ─────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold leading-tight text-foreground">Info Detail</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-8">Informasi kontak dan latar belakang Batak Anda</p>
              <div className="space-y-6">
                <FormField label="No. WhatsApp" name="wa" value={data.wa} onChange={set} placeholder="08xxxxxxxxxx" required />

                {/* Password */}
                <div className="space-y-4">
                  <div className="relative">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Password <span className="text-primary">*</span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={data.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="Masukkan password akun Anda"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 bottom-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      )}
                    </button>
                    {data.password && data.password.length < 8 && (
                      <p className="mt-1 text-xs text-red-600">Password minimal 8 karakter</p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Konfirmasi Password <span className="text-primary">*</span>
                    </label>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={data.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      placeholder="Ulangi password Anda"
                      autoComplete="new-password"
                      className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background ${
                        data.confirmPassword && data.password !== data.confirmPassword
                          ? "border-red-400 bg-red-50/50 dark:bg-red-900/10"
                          : "border-border"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 bottom-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      )}
                    </button>
                    {data.confirmPassword && data.password !== data.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">Password tidak cocok</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="Jenis Kelamin" name="gender" value={data.gender} onChange={set} type="select" options={["Perempuan", "Laki-laki"]} required />
                  <FormField label="Tahun Lahir" name="tahunLahir" value={data.tahunLahir} onChange={set} type="number" placeholder="cth: 1995" required />
                </div>

                {/* Cascading Dropdown Provinsi → Kota */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      Provinsi <span className="text-primary">*</span>
                    </label>
                    <select
                      value={provinsi}
                      onChange={(e) => {
                        setProvinsi(e.target.value);
                        set("kota", ""); // reset kota saat provinsi berubah
                      }}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">— Pilih Provinsi —</option>
                      {PROVINSI_LIST.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      Kota / Kabupaten <span className="text-primary">*</span>
                    </label>
                    <select
                      value={data.kota}
                      onChange={(e) => set("kota", e.target.value)}
                      disabled={!provinsi}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">— Pilih Kota/Kabupaten —</option>
                      {kotaList.map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                    {!provinsi && (
                      <p className="text-xs text-muted-foreground">Pilih provinsi terlebih dahulu</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="Agama" name="agama" value={data.agama} onChange={set} type="select" options={AGAMA} required />
                  <FormField label="Suku" name="suku" value={data.suku} onChange={set} type="select" options={SUKU} required />
                </div>
                <MargaSelect value={data.marga} onChange={set} required />
                <MargaSelect value={data.margaIbu} onChange={set} label="Marga Ibu" name="margaIbu" />
              </div>
            </>
          )}

          {/* ── STEP 2: Latar Belakang ──────────────────────────────────────── */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold leading-tight text-foreground">Latar Belakang</h2>
              <p className="mt-1 text-sm text-muted-foreground">Informasi keluarga dan gaya hidup</p>
              <MotivationBanner />
              <div className="space-y-6">
                <FormField label="Jumlah saudara kandung (termasuk Anda)" name="klgBesar" value={data.klgBesar} onChange={set} type="select" options={KLG} required />
                <FormField label="Frekuensi ibadah" name="ibadah" value={data.ibadah} onChange={set} type="select" options={IBADAH} required />
                <FormField label="Merokok?" name="rokok" value={data.rokok} onChange={set} type="select" options={ROKOK} required />
                <FormField label="Konsumsi alkohol?" name="alkohol" value={data.alkohol} onChange={set} type="select" options={ALKOHOL} required />
                <FormField label="Posisi dalam keluarga" name="anakKe" value={data.anakKe} onChange={set} type="select" options={ANAK_KE} required />
                <FormField label="Pendidikan terakhir" name="pendidikan" value={data.pendidikan} onChange={set} type="select" options={PENDIDIKAN} required />
                <FormField label="Status pekerjaan" name="kerja" value={data.kerja} onChange={set} type="select" options={KERJA} required />
              </div>
            </>
          )}

          {/* ── STEP 3: Preferensi ──────────────────────────────────────────── */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold leading-tight text-foreground">Preferensi</h2>
              <p className="mt-1 text-sm text-muted-foreground">Preferensi pasangan dan kesiapan menikah</p>
              <MotivationBanner />
              <div className="space-y-6">
                <FormField label="Preferensi agama pasangan" name="cariAgama" value={data.cariAgama} onChange={set} type="select" options={CARI_AGAMA} required />
                <FormField label="Bersedia pindah kota?" name="pindah" value={data.pindah} onChange={set} type="select" options={SEDIA} required />
                <FormField label="Bersedia LDR?" name="ldr" value={data.ldr} onChange={set} type="select" options={SEDIA} required />
                <FormField label="Rencana menikah" name="timeline" value={data.timeline} onChange={set} type="select" options={TIMELINE} required />
                <FormField label="Tabungan nikah" name="tabungan" value={data.tabungan} onChange={set} type="select" options={TABUNGAN} required />
                <FormField label="Rencana anak" name="anak" value={data.anak} onChange={set} type="select" options={ANAK_OPT} required />
                <FormField label="Tinggal bersama orang tua setelah nikah?" name="ortu" value={data.ortu} onChange={set} type="select" options={ORTU} required />
              </div>
            </>
          )}

          {/* ── STEP 4: Kepribadian ─────────────────────────────────────────── */}
          {step === 4 && (
            <>
              <h2 className="text-2xl font-bold leading-tight text-foreground">Kepribadian</h2>
              <p className="mt-1 text-sm text-muted-foreground">Karakter dan cara berkomunikasi</p>
              <MotivationBanner />
              <div className="space-y-6">
                <FormField label="Bahasa kasih utama" name="bahasaKasih" value={data.bahasaKasih} onChange={set} type="select" options={BAHASA_KASIH} required />
                <FormField label="Cara menangani konflik" name="konflik" value={data.konflik} onChange={set} type="select" options={KONFLIK} required />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Skala introvert-ekstrovert (1 = sangat introvert, 5 = sangat ekstrovert)
                    <span className="ml-1 text-primary">*</span>
                  </label>
                  <div className="flex gap-3">
                    {INTRO.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set("introvert", n)}
                        className={`flex h-12 w-12 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                          data.introvert === n
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:bg-secondary"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <FormField label="Jika cocok, boleh dihubungkan?" name="bolehHubung" value={data.bolehHubung} onChange={set} type="select" options={BOLEH_HUBUNG} required />
                <FormField label="Deskripsi singkat diri (opsional)" name="catatan" value={data.catatan} onChange={set} type="textarea" placeholder="cth: Saya seorang yang aktif dan humoris, suka hiking dan memasak masakan Batak..." />
              </div>
            </>
          )}

          {/* ── STEP 5: Bio Profil (opsional) ──────────────────────────────── */}
          {step === 5 && (
            <>
              <h2 className="text-2xl font-bold leading-tight text-foreground">Bio Profil</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-2">Semua isian di bawah bersifat opsional</p>
              <p className="mb-8 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-4 py-2.5">
                Semakin lengkap profil Anda, semakin percaya kandidat lain. Anda bisa melewati langkah ini.
              </p>
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Pekerjaan" name="pekerjaan" value={data.pekerjaan} onChange={set} placeholder="cth: Dokter, Software Engineer" />
                  <FormField label="Jabatan" name="jabatan" value={data.jabatan} onChange={set} placeholder="cth: Senior Manager" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Tinggi Badan (cm)" name="tinggiBadan" value={data.tinggiBadan} onChange={set} type="number" placeholder="cth: 168" />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Berat Badan</label>
                    <div className="flex gap-3">
                      {BERAT_BADAN.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => set("beratBadan", data.beratBadan === b ? "" : b)}
                          className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
                            data.beratBadan === b
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-foreground hover:bg-secondary"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Minat & Hobi{" "}
                    <span className="text-muted-foreground font-normal">(pilih maks. 5)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MINAT_OPTIONS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMinat(m)}
                        className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                          minat.includes(m)
                            ? "bg-primary text-primary-foreground"
                            : minat.length >= 5
                              ? "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                              : "bg-secondary text-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  {minat.length > 0 && (
                    <p className="text-xs text-muted-foreground">{minat.length}/5 dipilih</p>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-foreground">Media Sosial</p>
                  <FormField label="LinkedIn" name="sosmedLinkedIn" value={data.sosmedLinkedIn} onChange={set} placeholder="username LinkedIn" />
                  <FormField label="Instagram" name="sosmedInstagram" value={data.sosmedInstagram} onChange={set} placeholder="@username" />
                  <FormField label="TikTok" name="sosmedTikTok" value={data.sosmedTikTok} onChange={set} placeholder="@username" />
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-10 flex justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={prev}
                className="inline-flex h-10 items-center rounded-lg border border-border px-6 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                ← Kembali
              </button>
            ) : (
              <div />
            )}

            {step === 0 && !fromOAuth ? (
              /* Step 0 direct: tidak ada tombol next karena user harus klik OAuth */
              <div />
            ) : step < 5 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canNext}
                title={!canNext ? "Lengkapi semua field yang bertanda * terlebih dahulu" : undefined}
                className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Lanjutkan →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex h-10 items-center rounded-lg bg-accent px-8 text-sm font-semibold text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Mengirim..." : "Kirim Pendaftaran"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DaftarPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <DaftarForm />
    </Suspense>
  );
}
