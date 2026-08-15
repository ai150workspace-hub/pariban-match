/**
 * PARIBAN — Engine Pencocokan Adat v2
 *
 * Konversi 1:1 dari PARIBAN-3-ADAT-v2.gs (gerbangAdat_) dan
 * PARIBAN-2-MATCHING.gs (skorPasangan_, layakDasar_, topTiga_).
 */

import { indukMarga, rumpunMarga } from "./marga-db";
import { RUMPUN_KETAT, INDUK_KETAT, PADAN, PADAN_CEK, NAMA_KEMBAR } from "./aturan";
import type {
  Peserta,
  HasilAdat,
  SkorRinci,
  HasilPasangan,
  HasilTop,
} from "./types";

// ── Gerbang Adat ──

export function gerbangAdat(a: Peserta, b: Peserta): HasilAdat {
  const W = a.gender === "Perempuan" ? a : b;
  const P = a.gender === "Perempuan" ? b : a;

  if (!W.marga || !P.marga)
    return {
      status: "PERLU_DICEK",
      label: "Data adat belum lengkap",
      alasan: "Salah satu pihak belum melengkapi data marga.",
    };

  // R1 semarga
  if (W.marga === P.marga)
    return {
      status: "DIBLOKIR",
      label: "Semarga",
      alasan: `Sama-sama bermarga ${W.marga}.`,
    };

  const iW = indukMarga(W.marga);
  const iP = indukMarga(P.marga);
  const rW = rumpunMarga(W.marga);
  const rP = rumpunMarga(P.marga);

  // R2 dongan sabutuha — satu induk marga
  if (iW && iP && iW === iP)
    return {
      status: "DIBLOKIR",
      label: "Dongan sabutuha",
      alasan: `${W.marga} dan ${P.marga} sama-sama turunan ${iW}, jadi terhitung saudara satu garis ayah.`,
    };

  // R3 Ruhut Bongbong — sesama PARNA
  if (rW === "PARNA" && rP === "PARNA")
    return {
      status: "DIBLOKIR",
      label: "Ruhut Bongbong",
      alasan:
        "Keduanya turunan Nai Ambaton (PARNA). Ruhut Bongbong melarang pernikahan antarsesama marga keturunan Nai Ambaton.",
    };

  // R4-R6 rumpun dan induk berlarangan ketat
  if (
    rW &&
    rW === rP &&
    (RUMPUN_KETAT as readonly string[]).includes(rW)
  )
    return {
      status: "DIBLOKIR",
      label: "Satu rumpun berlarangan ketat",
      alasan: `${W.marga} dan ${P.marga} sama-sama turunan ${rW}.`,
    };

  if (
    iW &&
    iW === iP &&
    (INDUK_KETAT as readonly string[]).includes(iW)
  )
    return {
      status: "DIBLOKIR",
      label: "Satu induk berlarangan ketat",
      alasan: `Keduanya turunan ${iW}.`,
    };

  // R7 padan naskah primer
  for (const [x, y] of PADAN) {
    if (
      (x === W.marga && y === P.marga) ||
      (y === W.marga && x === P.marga)
    )
      return {
        status: "DIBLOKIR",
        label: "Terikat padan",
        alasan: `Ada ikrar padan antara ${x} dan ${y}. Dalam adat Batak, marga yang berpadan diperlakukan sebagai dongan sabutuha.`,
      };
  }

  const catatan: string[] = [];
  let perlu = false;

  // R8 padan belum terkonfirmasi
  for (const [p, q] of PADAN_CEK) {
    if (
      (p === W.marga && q === P.marga) ||
      (q === W.marga && p === P.marga)
    ) {
      perlu = true;
      catatan.push(
        `Ada catatan padan antara ${p} dan ${q} dalam sumber lain, tetapi tidak terkonfirmasi di naskah utama kami.`,
      );
    }
  }

  // R10 nama kembar
  if (
    (NAMA_KEMBAR as readonly string[]).includes(W.marga) ||
    (NAMA_KEMBAR as readonly string[]).includes(P.marga)
  ) {
    perlu = true;
    catatan.push(
      "Salah satu marga dipakai oleh lebih dari satu garis keturunan, sehingga posisi adatnya belum dapat dipastikan tanpa tarombo.",
    );
  }

  // R9 sesama Lontung
  if (rW === "Lontung" && rP === "Lontung") {
    perlu = true;
    catatan.push(
      "Keduanya turunan Raja Lontung. Sebagian tradisi melarang pernikahan sesama marga Lontung, sebagian memperbolehkan bila jarak generasi sudah jauh.",
    );
  }

  // R11 beda suku
  if (W.suku !== P.suku) {
    perlu = true;
    catatan.push(
      `Beda sub-suku (${W.suku} dan ${P.suku}), perlu konversi adat untuk menentukan posisi hula-hula dan boru.`,
    );
  }

  // marga di luar registry
  if (!iW || !iP) {
    perlu = true;
    catatan.push("Salah satu marga belum ada di daftar terverifikasi kami.");
  }

  // R12 marpariban — arah wajib: marga wanita = marga ibu pria
  const pariban = P.margaIbu && P.margaIbu === W.marga;
  if (W.margaIbu && W.margaIbu === P.marga) {
    perlu = true;
    catatan.push(
      "Pihak pria bermarga sama dengan marga ibu pihak wanita — artinya pria berada di posisi tulang (saudara laki-laki ibu). Hubungan ini bukan pariban, melainkan hubungan tulang-bere. Perlu dikonfirmasi ke keluarga apakah adat setempat memperbolehkan.",
    );
  }

  if (pariban && !perlu)
    return {
      status: "PARIBAN",
      label: "Marpariban",
      alasan: `Ibu ${P.nama.split(" ")[0]} bermarga ${W.marga}. Secara adat, hubungan ini dianjurkan.`,
    };

  if (perlu)
    return {
      status: "PERLU_DICEK",
      label: "Perlu dicek tarombo",
      alasan:
        catatan.join(" ") +
        " Ini bukan larangan — artinya perlu dipastikan ke keluarga, bukan bahwa hubungan ini terlarang.",
    };

  return {
    status: "AMAN",
    label: "Sesuai adat",
    alasan: `Tidak ditemukan semarga, dongan sabutuha, padan, maupun larangan rumpun antara ${W.marga} dan ${P.marga}.`,
  };
}

// ── Skor 4 Pilar ──

function dekat(arr: readonly string[], x: string, y: string): number {
  const i = arr.indexOf(x);
  const j = arr.indexOf(y);
  if (i < 0 || j < 0) return 0.5;
  return 1 - Math.abs(i - j) / (arr.length - 1);
}

const URUT_TL = ["Dalam 1 tahun", "1–2 tahun", "2–3 tahun", "Belum tahu"] as const;
const URUT_TAB = ["Sudah ada", "Sedang menabung", "Belum mulai"] as const;
const URUT_IBA = ["Setiap minggu", "Beberapa kali sebulan", "Sesekali", "Jarang"] as const;
const URUT_ROK = ["Tidak merokok", "Kadang", "Ya, rutin"] as const;
const URUT_ALK = ["Tidak sama sekali", "Sesekali di acara keluarga", "Ya, sosial"] as const;
const URUT_PEND = ["SMA/SMK", "D3", "S1", "S2", "S3"] as const;
const URUT_SED = ["Ya", "Bisa dipertimbangkan", "Tidak"] as const;

export function skorPasangan(a: Peserta, b: Peserta): SkorRinci {
  // Bibit (30)
  const klg = 1 - Math.abs(Number(a.klgBesar) - Number(b.klgBesar)) / 4;
  const iba = dekat(URUT_IBA, a.ibadah, b.ibadah);
  const rok = dekat(URUT_ROK, a.rokok, b.rokok);
  const alk = dekat(URUT_ALK, a.alkohol, b.alkohol);
  const bibit = klg * 10 + iba * 8 + rok * 6 + alk * 6;

  // Bebet (20)
  const pen = dekat(URUT_PEND, a.pendidikan, b.pendidikan);
  const ker =
    (a.kerja !== "Sedang mencari" ? 2.5 : 0) +
    (b.kerja !== "Sedang mencari" ? 2.5 : 0);
  const mob =
    (dekat(URUT_SED, a.pindah, b.pindah) +
      dekat(URUT_SED, a.ldr, b.ldr)) /
    2;
  const kota = a.kota === b.kota ? 1 : 0.45;
  const bebet = pen * 7 + ker + mob * 5 + kota * 3;

  // Bobot (30)
  const tl = dekat(URUT_TL, a.timeline, b.timeline);
  const tab = dekat(URUT_TAB, a.tabungan, b.tabungan);
  const ank =
    a.anak === b.anak
      ? 1
      : a.anak === "Belum memutuskan" || b.anak === "Belum memutuskan"
        ? 0.6
        : 0.25;
  const ort = a.ortu === b.ortu ? 1 : 0.6;
  const bobot = tl * 13 + tab * 8 + ank * 6 + ort * 3;

  // Kepribadian (20)
  const bk = a.bahasaKasih === b.bahasaKasih ? 1 : 0.55;
  const kf =
    a.konflik === b.konflik
      ? 1
      : a.konflik === "Menghindari konflik" &&
          b.konflik === "Menghindari konflik"
        ? 0.3
        : 0.6;
  let iex =
    1 - Math.abs(Number(a.introvert) - Number(b.introvert)) / 4;
  iex = 0.45 + iex * 0.55;
  const kepribadian = bk * 7 + kf * 7 + iex * 6;

  const total = bibit + bebet + bobot + kepribadian;
  return { bibit, bebet, bobot, kepribadian, total };
}

// ── Utilitas ──

export function usia(tahunLahir: number): number {
  return new Date().getFullYear() - tahunLahir;
}

export function layakDasar(a: Peserta, b: Peserta): boolean {
  if (a.gender === b.gender) return false;
  if (Math.abs(usia(a.tahunLahir) - usia(b.tahunLahir)) > 12) return false;
  if (a.cariAgama === "Harus sama dengan saya" && a.agama !== b.agama)
    return false;
  if (b.cariAgama === "Harus sama dengan saya" && a.agama !== b.agama)
    return false;
  return true;
}

export function inisial(nama: string): string {
  const w = nama.trim().split(/\s+/);
  if (w.length === 1) return w[0].charAt(0).toUpperCase() + ".";
  return w[0].charAt(0).toUpperCase() + ". " + w[w.length - 1];
}

// ── Pencocokan batch ──

export function hitungPasangan(peserta: Peserta[]): HasilPasangan[] {
  const out: HasilPasangan[] = [];
  for (let i = 0; i < peserta.length; i++) {
    for (let j = i + 1; j < peserta.length; j++) {
      const a = peserta[i];
      const b = peserta[j];
      if (!layakDasar(a, b)) continue;
      const ad = gerbangAdat(a, b);
      if (ad.status === "DIBLOKIR") {
        out.push({ a, b, adat: ad, skor: 0, blok: true });
        continue;
      }
      const s = skorPasangan(a, b);
      const total = s.total + (ad.status === "PARIBAN" ? 10 : 0);
      out.push({
        a,
        b,
        adat: ad,
        skor: Math.round(total * 10) / 10,
        rinci: s,
        blok: false,
      });
    }
  }
  return out;
}

const URUT_ADAT: Record<string, number> = {
  PARIBAN: 0,
  AMAN: 1,
  PERLU_DICEK: 2,
};

export function topTiga(
  peserta: Peserta[],
  pasangan: HasilPasangan[],
): Record<string, HasilTop[]> {
  const per: Record<string, HasilTop[]> = {};
  for (const p of peserta) per[p.kode] = [];

  for (const x of pasangan) {
    if (x.blok) continue;
    per[x.a.kode].push({ lawan: x.b, skor: x.skor, adat: x.adat, saling: false });
    per[x.b.kode].push({ lawan: x.a, skor: x.skor, adat: x.adat, saling: false });
  }

  for (const k of Object.keys(per)) {
    per[k].sort((m, n) => {
      const d =
        (URUT_ADAT[m.adat.status] ?? 3) - (URUT_ADAT[n.adat.status] ?? 3);
      if (d !== 0) return d;
      return n.skor - m.skor;
    });
    per[k] = per[k].slice(0, 3);
  }

  // tandai saling masuk top 3
  for (const k of Object.keys(per)) {
    for (const item of per[k]) {
      const lawanTop = per[item.lawan.kode] ?? [];
      item.saling = lawanTop.some((z) => z.lawan.kode === k);
    }
  }

  return per;
}
