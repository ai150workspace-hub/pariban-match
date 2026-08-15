import { describe, it, expect } from "vitest";
import { gerbangAdat, skorPasangan, layakDasar } from "./engine";
import type { Peserta } from "./types";

/** Helper: buat peserta minimal untuk testing adat */
function buat(
  override: Partial<Peserta> & { marga: string; gender: Peserta["gender"] },
): Peserta {
  return {
    kode: "T001",
    nama: "Test User",
    email: "test@test.com",
    wa: "08123456789",
    tahunLahir: 1993,
    kota: "Jakarta",
    agama: "Kristen Protestan",
    cariAgama: "Terbuka",
    suku: "Batak Toba",
    margaIbu: "",
    subMarga: "",
    klgBesar: 3,
    ibadah: "Setiap minggu",
    rokok: "Tidak merokok",
    alkohol: "Tidak sama sekali",
    anakKe: "Anak sulung",
    pendidikan: "S1",
    kerja: "Karyawan tetap",
    pindah: "Ya",
    ldr: "Ya",
    timeline: "Dalam 1 tahun",
    tabungan: "Sudah ada",
    anak: "Ingin 1–2 anak",
    ortu: "Saya sendiri",
    bahasaKasih: "Quality Time",
    konflik: "Bicara segera",
    introvert: 3,
    bolehHubung: "Ya, silakan hubungkan",
    catatan: "",
    inisial: "T. User",
    statusData: "LENGKAP",
    ...override,
  };
}

// ═══════════════════════════════════════════
// 22 ATURAN ADAT — semuanya harus lulus
// ═══════════════════════════════════════════

describe("Gerbang Adat v2", () => {
  // ── R1: Semarga ──
  it("R1: semarga → DIBLOKIR", () => {
    const W = buat({ marga: "Sinaga", gender: "Perempuan" });
    const P = buat({ marga: "Sinaga", gender: "Laki-laki" });
    const h = gerbangAdat(W, P);
    expect(h.status).toBe("DIBLOKIR");
    expect(h.label).toBe("Semarga");
  });

  // ── R2: Dongan sabutuha (satu induk) ──
  it("R2: dongan sabutuha (Sitohang & Situmorang, induk Situmorang) → DIBLOKIR", () => {
    const W = buat({ marga: "Sitohang", gender: "Perempuan" });
    const P = buat({ marga: "Situmorang", gender: "Laki-laki" });
    const h = gerbangAdat(W, P);
    expect(h.status).toBe("DIBLOKIR");
    expect(h.label).toBe("Dongan sabutuha");
  });

  it("R2b: dongan sabutuha (Gultom & Pakpahan, induk Pandiangan) → DIBLOKIR", () => {
    const W = buat({ marga: "Gultom", gender: "Perempuan" });
    const P = buat({ marga: "Pakpahan", gender: "Laki-laki" });
    const h = gerbangAdat(W, P);
    expect(h.status).toBe("DIBLOKIR");
    expect(h.label).toBe("Dongan sabutuha");
  });

  // ── R3: Ruhut Bongbong (PARNA) ──
  it("R3: Ruhut Bongbong (Simbolon & Tamba, sesama PARNA) → DIBLOKIR", () => {
    const W = buat({ marga: "Simbolon", gender: "Perempuan" });
    const P = buat({ marga: "Tamba", gender: "Laki-laki" });
    const h = gerbangAdat(W, P);
    expect(h.status).toBe("DIBLOKIR");
    expect(h.label).toBe("Ruhut Bongbong");
  });

  it("R3b: Ruhut Bongbong (Nadeak & Sigalingging, sesama PARNA) → DIBLOKIR", () => {
    const W = buat({ marga: "Nadeak", gender: "Perempuan" });
    const P = buat({ marga: "Sigalingging", gender: "Laki-laki" });
    const h = gerbangAdat(W, P);
    expect(h.status).toBe("DIBLOKIR");
    expect(h.label).toBe("Ruhut Bongbong");
  });

  // ── R4: Rumpun ketat — Nai Rasaon ──
  it("R4: Nai Rasaon (Sitorus & Manurung) → DIBLOKIR", () => {
    const W = buat({ marga: "Sitorus", gender: "Perempuan" });
    const P = buat({ marga: "Manurung", gender: "Laki-laki" });
    const h = gerbangAdat(W, P);
    expect(h.status).toBe("DIBLOKIR");
  });

  // ── R5: Rumpun ketat — Silahi Sabungan ──
  it("R5: Silahi Sabungan (Tambunan & Sihaloho) → DIBLOKIR", () => {
    const W = buat({ marga: "Tambunan", gender: "Perempuan" });
    const P = buat({ marga: "Sihaloho", gender: "Laki-laki" });
    const h = gerbangAdat(W, P);
    expect(h.status).toBe("DIBLOKIR");
  });

  // ── R6: Induk ketat — Sonak Malela ──
  it("R6: Sonak Malela (Simangunsong & Pardede) → DIBLOKIR", () => {
    const W = buat({ marga: "Simangunsong", gender: "Perempuan" });
    const P = buat({ marga: "Pardede", gender: "Laki-laki" });
    const h = gerbangAdat(W, P);
    expect(h.status).toBe("DIBLOKIR");
    expect(h.label).toBe("Dongan sabutuha");
  });

  // ── R7: Padan naskah primer (10 padan) ──
  it("R7a: padan Marbun ↔ Sihotang → DIBLOKIR", () => {
    const h = gerbangAdat(
      buat({ marga: "Marbun", gender: "Perempuan" }),
      buat({ marga: "Sihotang", gender: "Laki-laki" }),
    );
    expect(h.status).toBe("DIBLOKIR");
    expect(h.label).toBe("Terikat padan");
  });

  it("R7b: padan Panjaitan ↔ Simanullang → DIBLOKIR", () => {
    const h = gerbangAdat(
      buat({ marga: "Panjaitan", gender: "Perempuan" }),
      buat({ marga: "Simanullang", gender: "Laki-laki" }),
    );
    expect(h.status).toBe("DIBLOKIR");
  });

  it("R7c: padan Tampubolon ↔ Sitompul → DIBLOKIR", () => {
    const h = gerbangAdat(
      buat({ marga: "Tampubolon", gender: "Perempuan" }),
      buat({ marga: "Sitompul", gender: "Laki-laki" }),
    );
    expect(h.status).toBe("DIBLOKIR");
  });

  it("R7d: padan Sitorus ↔ Hutajulu → DIBLOKIR", () => {
    const h = gerbangAdat(
      buat({ marga: "Sitorus", gender: "Perempuan" }),
      buat({ marga: "Hutajulu", gender: "Laki-laki" }),
    );
    expect(h.status).toBe("DIBLOKIR");
  });

  it("R7e: padan Nahampun ↔ Situmorang → DIBLOKIR", () => {
    const h = gerbangAdat(
      buat({ marga: "Nahampun", gender: "Perempuan" }),
      buat({ marga: "Situmorang", gender: "Laki-laki" }),
    );
    expect(h.status).toBe("DIBLOKIR");
  });

  it("R7f: padan Banjarnahor ↔ Manalu → DIBLOKIR", () => {
    const h = gerbangAdat(
      buat({ marga: "Banjarnahor", gender: "Perempuan" }),
      buat({ marga: "Manalu", gender: "Laki-laki" }),
    );
    expect(h.status).toBe("DIBLOKIR");
  });

  // ── R8: Padan belum terkonfirmasi ──
  it("R8: padan belum konfirmasi (Silaban ↔ Hutabarat) → PERLU_DICEK", () => {
    const h = gerbangAdat(
      buat({ marga: "Silaban", gender: "Perempuan" }),
      buat({ marga: "Hutabarat", gender: "Laki-laki" }),
    );
    expect(h.status).toBe("PERLU_DICEK");
    expect(h.alasan).toContain("padan");
  });

  // ── R9: Sesama Lontung ──
  it("R9: sesama Lontung (Sinaga & Nainggolan) → PERLU_DICEK", () => {
    const h = gerbangAdat(
      buat({ marga: "Sinaga", gender: "Perempuan" }),
      buat({ marga: "Nainggolan", gender: "Laki-laki" }),
    );
    expect(h.status).toBe("PERLU_DICEK");
    expect(h.alasan).toContain("Lontung");
  });

  // ── R10: Nama kembar ──
  it("R10: nama kembar (Manik) → PERLU_DICEK", () => {
    const h = gerbangAdat(
      buat({ marga: "Manik", gender: "Perempuan" }),
      buat({ marga: "Hutabarat", gender: "Laki-laki" }),
    );
    expect(h.status).toBe("PERLU_DICEK");
    expect(h.alasan).toContain("lebih dari satu garis keturunan");
  });

  // ── R11: Beda suku ──
  it("R11: beda suku (Toba ↔ Karo) → PERLU_DICEK", () => {
    const h = gerbangAdat(
      buat({ marga: "Hutabarat", gender: "Perempuan", suku: "Batak Toba" }),
      buat({ marga: "Ginting", gender: "Laki-laki", suku: "Batak Karo" }),
    );
    expect(h.status).toBe("PERLU_DICEK");
    expect(h.alasan).toContain("Beda sub-suku");
  });

  // ── R12: Marpariban ──
  it("R12: marpariban (marga wanita = marga ibu pria) → PARIBAN", () => {
    const W = buat({ marga: "Sirait", gender: "Perempuan" });
    const P = buat({ marga: "Hutabarat", gender: "Laki-laki", margaIbu: "Sirait" });
    const h = gerbangAdat(W, P);
    expect(h.status).toBe("PARIBAN");
    expect(h.label).toBe("Marpariban");
  });

  // ── Hubungan terbalik → PERLU_DICEK ──
  it("R12b: hubungan terbalik (marga pria = marga ibu wanita) → PERLU_DICEK", () => {
    const W = buat({ marga: "Sirait", gender: "Perempuan", margaIbu: "Hutabarat" });
    const P = buat({ marga: "Hutabarat", gender: "Laki-laki" });
    const h = gerbangAdat(W, P);
    expect(h.status).toBe("PERLU_DICEK");
    expect(h.alasan).toContain("membalik posisi hula-hula");
  });

  // ── Pasangan AMAN ──
  it("Pasangan aman (Hutabarat & Siregar, beda rumpun, tidak ada padan) → AMAN", () => {
    const W = buat({ marga: "Hutabarat", gender: "Perempuan" });
    const P = buat({ marga: "Siregar", gender: "Laki-laki" });
    const h = gerbangAdat(W, P);
    expect(h.status).toBe("AMAN");
    expect(h.label).toBe("Sesuai adat");
  });
});

describe("Skor Pasangan", () => {
  it("identik → skor mendekati 100", () => {
    const a = buat({ marga: "Hutabarat", gender: "Perempuan" });
    const b = buat({ marga: "Siregar", gender: "Laki-laki" });
    const s = skorPasangan(a, b);
    expect(s.total).toBeGreaterThan(90);
    expect(s.bibit).toBeGreaterThan(0);
    expect(s.bebet).toBeGreaterThan(0);
    expect(s.bobot).toBeGreaterThan(0);
    expect(s.kepribadian).toBeGreaterThan(0);
  });
});

describe("Layak Dasar", () => {
  it("gender sama → false", () => {
    const a = buat({ marga: "Sinaga", gender: "Laki-laki" });
    const b = buat({ marga: "Siregar", gender: "Laki-laki" });
    expect(layakDasar(a, b)).toBe(false);
  });

  it("selisih usia > 12 → false", () => {
    const a = buat({ marga: "Sinaga", gender: "Perempuan", tahunLahir: 1970 });
    const b = buat({ marga: "Siregar", gender: "Laki-laki", tahunLahir: 2000 });
    expect(layakDasar(a, b)).toBe(false);
  });

  it("agama wajib sama, tapi beda → false", () => {
    const a = buat({
      marga: "Sinaga",
      gender: "Perempuan",
      agama: "Islam",
      cariAgama: "Harus sama dengan saya",
    });
    const b = buat({
      marga: "Siregar",
      gender: "Laki-laki",
      agama: "Kristen Protestan",
      cariAgama: "Terbuka",
    });
    expect(layakDasar(a, b)).toBe(false);
  });
});
