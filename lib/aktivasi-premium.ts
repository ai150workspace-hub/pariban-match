import type { Peserta } from "./adat/types";
import type { PaketInfo } from "./pricing";
import { loadPeserta, updatePeserta } from "./storage";
import { hitungExpiryPremiumBaru } from "./membership";
import { klaimAktif, updateTransaksi, type Transaksi } from "./transaksi";
import { sendKonfirmasiPremium } from "./email";

/**
 * Aktifkan Premium untuk satu transaksi — dipakai bersama oleh webhook dan
 * pencocokan manual admin. Idempotent: transaksi yang sudah "aktif" tidak
 * akan mengubah apa pun ("duplikat").
 */
export async function aktifkanPremiumUntukTransaksi(
  trx: Transaksi,
  target: Peserta,
  paket: PaketInfo,
  manual?: { oleh: string },
): Promise<"ok" | "duplikat"> {
  const klaim = await klaimAktif(trx.id, {
    pesertaKode: target.kode,
    paket: paket.id,
    ...(manual && {
      dicocokkanOleh: manual.oleh,
      dicocokkanPada: new Date().toISOString(),
    }),
  });
  if (!klaim) return "duplikat";

  // Baca ulang peserta supaya sisa masa aktif yang dipakai adalah yang terbaru.
  const terbaru = (await loadPeserta()).find((p) => p.kode === target.kode) ?? target;
  const expiry = hitungExpiryPremiumBaru(terbaru, paket.durasiHari);

  try {
    await updatePeserta(target.kode, {
      premium: true,
      premiumExpiry: expiry.toISOString(),
      premiumPaket: paket.id,
    });
  } catch (e) {
    // Kembalikan status supaya notifikasi ulang / admin bisa mencoba lagi.
    await updateTransaksi(trx.id, {
      status: "gagal",
      catatan: `Gagal update peserta: ${e instanceof Error ? e.message : String(e)}`,
    }).catch(() => {});
    throw e;
  }

  console.log(
    `Premium aktif untuk ${target.kode} (${paket.id}) dari transaksi ${trx.transactionId}, expiry: ${expiry.toISOString()}`,
  );
  sendKonfirmasiPremium(target, paket.id, expiry).catch((e) =>
    console.error(`Gagal kirim email premium ke ${target.kode}:`, e),
  );
  return "ok";
}
