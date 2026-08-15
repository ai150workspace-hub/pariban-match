/**
 * Aturan adat Batak — SSOT v2
 * Sumber: PARIBAN-3-ADAT-v2.gs
 */

/** Rumpun yang melarang pernikahan sesama anggota */
export const RUMPUN_KETAT = ["PARNA", "Nai Rasaon", "Silahi Sabungan"] as const;

/** Induk marga yang melarang pernikahan sesama anggota */
export const INDUK_KETAT = ["Sonak Malela"] as const;

/** Padan dari naskah primer — memblokir pernikahan */
export const PADAN: ReadonlyArray<[string, string]> = [
  ["Marbun", "Sihotang"],
  ["Panjaitan", "Simanullang"],
  ["Tampubolon", "Sitompul"],
  ["Sitorus", "Hutajulu"],
  ["Sitorus", "Hutahaean"],
  ["Sitorus", "Aruan"],
  ["Nahampun", "Situmorang"],
  ["Banjarnahor", "Manalu"],
  ["Lumban Batu", "Purba"],
  ["Lumban Gaol", "Debataraja"],
];

/** Padan yang belum dikonfirmasi naskah — hasil PERLU DICEK, bukan blokir */
export const PADAN_CEK: ReadonlyArray<[string, string]> = [
  ["Silaban", "Hutabarat"],
  ["Purba", "Tarihoran"],
  ["Nababan", "Pasaribu"],
];

/**
 * Nama marga yang dipakai lebih dari satu garis keturunan.
 * Tanpa disambiguasi, hasil diturunkan ke PERLU DICEK.
 */
export const NAMA_KEMBAR = [
  "Habeahan",
  "Hutapea",
  "Lumban Gaol",
  "Lumban Pea",
  "Manik",
  "Pardosi",
  "Siagian",
  "Sidabutar",
] as const;
