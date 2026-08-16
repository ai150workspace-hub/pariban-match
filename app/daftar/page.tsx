"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { StepIndicator } from "@/components/daftar/step-indicator";
import { FormField } from "@/components/daftar/form-field";
import { MargaSelect } from "@/components/daftar/marga-select";

const INITIAL = {
  nama: "",
  email: "",
  wa: "",
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

export default function DaftarPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL);
  const [minat, setMinat] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kode, setKode] = useState("");
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
    if (step < 4) setStep(step + 1);
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  function toggleMinat(m: string) {
    setMinat((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : prev.length < 5 ? [...prev, m] : prev,
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...data,
        ...(minat.length > 0 && { minat }),
        ...(data.tinggiBadan && { tinggiBadan: Number(data.tinggiBadan) }),
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
          {/* Header sukses */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-adat-aman/20 text-3xl">✓</div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Pendaftaran Berhasil!</h1>
            <p className="mt-3 text-muted-foreground">
              Terima kasih, <strong>{data.nama}</strong>. Kode peserta:{" "}
              <strong className="font-mono text-primary">{kode}</strong>
            </p>
          </div>

          {fotosAllDone ? (
            /* Selesai */
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="text-lg font-semibold text-foreground mb-1">Foto berhasil diunggah ✓</p>
              <p className="text-sm text-muted-foreground mb-6">Profil Anda sudah lengkap dan siap ditemukan!</p>
              <Link
                href={`/hasil/${kode}`}
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

              {/* Kamera live */}
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

              {/* Grid foto */}
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
                      {/* Badge live */}
                      {f.isLive && (
                        <span className="absolute top-1.5 left-1.5 rounded-full bg-adat-aman text-white text-[9px] font-bold px-1.5 py-0.5 leading-tight shadow">
                          ✓ LIVE
                        </span>
                      )}
                      {/* Badge profil */}
                      {f.id === profileId && (
                        <span className="absolute bottom-1.5 inset-x-1.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold text-center py-0.5 shadow">
                          PROFIL UTAMA
                        </span>
                      )}
                      {/* Overlay action */}
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

              {/* Tombol tambah foto */}
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

              {/* Info badge */}
              <div className="rounded-lg bg-secondary/50 px-4 py-3 text-xs text-muted-foreground space-y-1">
                <p>📸 <strong>Foto Live</strong> — diambil langsung dari kamera, mendapat badge hijau "Terverifikasi". Kandidat lebih yakin ini profil nyata, bukan palsu.</p>
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
          {step === 0 && (
            <>
              <h2 className="text-2xl font-bold text-foreground">Data Pribadi</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-8">Lengkapi informasi dasar Anda</p>
              <div className="space-y-6">
                <FormField label="Nama Lengkap" name="nama" value={data.nama} onChange={set} placeholder="Masukkan nama lengkap Anda" required />
                <FormField label="Email" name="email" value={data.email} onChange={set} type="email" placeholder="contoh@email.com" required />
                <FormField label="No. WhatsApp" name="wa" value={data.wa} onChange={set} placeholder="08xxxxxxxxxx" required />
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="Jenis Kelamin" name="gender" value={data.gender} onChange={set} type="select" options={["Perempuan", "Laki-laki"]} required />
                  <FormField label="Tahun Lahir" name="tahunLahir" value={data.tahunLahir} onChange={set} type="number" placeholder="cth: 1995" required />
                </div>
                <FormField label="Kota Domisili" name="kota" value={data.kota} onChange={set} placeholder="Jakarta" required />
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="Agama" name="agama" value={data.agama} onChange={set} type="select" options={AGAMA} required />
                  <FormField label="Suku" name="suku" value={data.suku} onChange={set} type="select" options={SUKU} required />
                </div>
                <MargaSelect value={data.marga} onChange={set} required />
                <MargaSelect value={data.margaIbu} onChange={set} label="Marga Ibu" name="margaIbu" />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-foreground">Latar Belakang</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-8">Informasi keluarga dan gaya hidup</p>
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

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-foreground">Preferensi</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-8">Preferensi pasangan dan kesiapan menikah</p>
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

          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold text-foreground">Kepribadian</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-8">Karakter dan cara berkomunikasi</p>
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
                <FormField label="Deskripsi singkat diri (opsional)" name="catatan" value={data.catatan} onChange={set} type="textarea" placeholder="cth: Saya seorang yang aktif dan humoris, suka hiking dan memasak masakan Batak. Di akhir pekan saya biasanya ke gereja lalu makan siang bersama keluarga besar. Saya mencari pasangan yang hangat, takut Tuhan, dan bisa menjadi sahabat sekaligus teman hidup." />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-2xl font-bold text-foreground">Bio Profil</h2>
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
            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
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
