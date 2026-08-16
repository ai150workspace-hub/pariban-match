import { NextResponse } from "next/server";
import { loadPeserta } from "@/lib/storage";

export async function GET() {
  const peserta = await loadPeserta();
  const tahun = new Date().getFullYear();

  // Gender
  const pria = peserta.filter((p) => p.gender === "Laki-laki").length;
  const wanita = peserta.filter((p) => p.gender === "Perempuan").length;

  // Usia
  const usiaDist: Record<string, number> = { "20-25": 0, "26-30": 0, "31-35": 0, "35+": 0 };
  peserta.forEach((p) => {
    const usia = tahun - p.tahunLahir;
    if (usia <= 25) usiaDist["20-25"]++;
    else if (usia <= 30) usiaDist["26-30"]++;
    else if (usia <= 35) usiaDist["31-35"]++;
    else usiaDist["35+"]++;
  });

  // Top pekerjaan (kerja field)
  const kerjaCounts: Record<string, number> = {};
  peserta.forEach((p) => {
    if (p.kerja) kerjaCounts[p.kerja] = (kerjaCounts[p.kerja] ?? 0) + 1;
  });
  const topPekerjaan = Object.entries(kerjaCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  // Top pendidikan
  const pendidikanCounts: Record<string, number> = {};
  peserta.forEach((p) => {
    if (p.pendidikan) pendidikanCounts[p.pendidikan] = (pendidikanCounts[p.pendidikan] ?? 0) + 1;
  });
  const topPendidikan = Object.entries(pendidikanCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([label, count]) => ({ label, count }));

  return NextResponse.json({
    total: peserta.length,
    genderRatio: { pria, wanita },
    usiaDist,
    topPekerjaan,
    topPendidikan,
  });
}
