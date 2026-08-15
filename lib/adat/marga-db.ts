/**
 * Database 255 marga Batak — SSOT v2 (naskah W. Hutagalung)
 *
 * Setiap marga dipetakan ke [induk marga, rumpun, suku].
 * Sumber: PARIBAN-3-ADAT-v2.gs MARGA_DB
 */

export type MargaInfo = [induk: string, rumpun: string, suku: string];

export const MARGA_DB: Record<string, MargaInfo> = {
  // ── Rumpun Lontung ──
  Situmorang: ["Situmorang", "Lontung", "Batak Toba"],
  "Lumban Pande": ["Situmorang", "Lontung", "Batak Toba"],
  "Lumban Nahor": ["Situmorang", "Lontung", "Batak Toba"],
  Suhutnihuta: ["Situmorang", "Lontung", "Batak Toba"],
  Siringoringo: ["Situmorang", "Lontung", "Batak Toba"],
  Sitohang: ["Situmorang", "Lontung", "Batak Toba"],
  Rumapea: ["Situmorang", "Lontung", "Batak Toba"],
  Padang: ["Situmorang", "Lontung", "Batak Toba"],
  Solin: ["Situmorang", "Lontung", "Batak Toba"],
  Sinaga: ["Sinaga", "Lontung", "Batak Toba"],
  Simanjorang: ["Sinaga", "Lontung", "Batak Toba"],
  Simandalahi: ["Sinaga", "Lontung", "Batak Toba"],
  Barutu: ["Sinaga", "Lontung", "Batak Toba"],
  Pandiangan: ["Pandiangan", "Lontung", "Batak Toba"],
  Samosir: ["Pandiangan", "Lontung", "Batak Toba"],
  Pakpahan: ["Pandiangan", "Lontung", "Batak Toba"],
  Gultom: ["Pandiangan", "Lontung", "Batak Toba"],
  Sidari: ["Pandiangan", "Lontung", "Batak Toba"],
  Sitinjak: ["Pandiangan", "Lontung", "Batak Toba"],
  Harianja: ["Pandiangan", "Lontung", "Batak Toba"],
  Nainggolan: ["Nainggolan", "Lontung", "Batak Toba"],
  Rumahombar: ["Nainggolan", "Lontung", "Batak Toba"],
  Parhusip: ["Nainggolan", "Lontung", "Batak Toba"],
  "Lumban Tungkup": ["Nainggolan", "Lontung", "Batak Toba"],
  "Lumban Siantar": ["Nainggolan", "Lontung", "Batak Toba"],
  Hutabalian: ["Nainggolan", "Lontung", "Batak Toba"],
  "Lumban Raja": ["Nainggolan", "Lontung", "Batak Toba"],
  Pusuk: ["Nainggolan", "Lontung", "Batak Toba"],
  Buaton: ["Nainggolan", "Lontung", "Batak Toba"],
  Nahulae: ["Nainggolan", "Lontung", "Batak Toba"],
  Simatupang: ["Simatupang", "Lontung", "Batak Toba"],
  Togatorop: ["Simatupang", "Lontung", "Batak Toba"],
  Sianturi: ["Simatupang", "Lontung", "Batak Toba"],
  Siburian: ["Simatupang", "Lontung", "Batak Toba"],
  Aritonang: ["Aritonang", "Lontung", "Batak Toba"],
  "Ompu Sunggu": ["Aritonang", "Lontung", "Batak Toba"],
  Rajagukguk: ["Aritonang", "Lontung", "Batak Toba"],
  Simaremare: ["Aritonang", "Lontung", "Batak Toba"],
  Siregar: ["Siregar", "Lontung", "Batak Toba"],
  Silo: ["Siregar", "Lontung", "Batak Toba"],
  Dongaran: ["Siregar", "Lontung", "Batak Toba"],
  Silali: ["Siregar", "Lontung", "Batak Toba"],
  Ritonga: ["Siregar", "Lontung", "Batak Toba"],
  Sormin: ["Siregar", "Lontung", "Batak Toba"],
  Bonor: ["Sinaga", "Toga Sinaga", "Batak Toba"],
  Dongoran: ["Siregar", "Toga Siregar", "Batak Toba"],

  // ── Rumpun Borbor ──
  Pasaribu: ["Datu Dalu", "Borbor", "Batak Toba"],
  Batubara: ["Datu Dalu", "Borbor", "Batak Toba"],
  Habeahan: ["Datu Dalu", "Borbor", "Batak Toba"],
  Bondar: ["Datu Dalu", "Borbor", "Batak Toba"],
  Gorat: ["Datu Dalu", "Borbor", "Batak Toba"],
  Tinendang: ["Datu Dalu", "Borbor", "Batak Toba"],
  Tangkar: ["Datu Dalu", "Borbor", "Batak Toba"],
  Matondang: ["Datu Dalu", "Borbor", "Batak Toba"],
  Saruksuk: ["Datu Dalu", "Borbor", "Batak Toba"],
  Tarihoran: ["Datu Dalu", "Borbor", "Batak Toba"],
  Parapat: ["Datu Dalu", "Borbor", "Batak Toba"],
  Rangkuti: ["Datu Dalu", "Borbor", "Batak Toba"],
  Sipahutar: ["Sipahutar", "Borbor", "Batak Toba"],
  Harahap: ["Harahap", "Borbor", "Batak Toba"],
  Tanjung: ["Tanjung", "Borbor", "Batak Toba"],
  Pulungan: ["Datu Pulungan", "Borbor", "Batak Toba"],
  Lubis: ["Datu Pulungan", "Borbor", "Batak Toba"],
  Hutasuhut: ["Datu Pulungan", "Borbor", "Batak Toba"],
  Simargolang: ["Simargolang", "Borbor", "Batak Toba"],

  // ── Limbong Mulana ──
  Limbong: ["Limbong", "Limbong Mulana", "Batak Toba"],
  Sihole: ["Limbong", "Limbong Mulana", "Batak Toba"],
  "Habeahan Limbong": ["Limbong", "Limbong Mulana", "Batak Toba"],

  // ── Sagala Raja & Silau Raja ──
  Sagala: ["Sagala", "Sagala Raja", "Batak Toba"],
  Malau: ["Malau", "Silau Raja", "Batak Toba"],
  Manik: ["Manik", "Silau Raja", "Batak Toba"],
  Ambarita: ["Ambarita", "Silau Raja", "Batak Toba"],
  "Lumban Pea": ["Ambarita", "Silau Raja", "Batak Toba"],
  "Lumban Pining": ["Ambarita", "Silau Raja", "Batak Toba"],
  Gurning: ["Gurning", "Silau Raja", "Batak Toba"],

  // ── Raja Uti ──
  "Raja Uti": ["Raja Uti", "Raja Uti", "Batak Toba"],

  // ── PARNA (Ruhut Bongbong — seluruh anggota dilarang saling menikah) ──
  Simbolon: ["Simbolon", "PARNA", "Batak Toba"],
  Tinambunan: ["Simbolon", "PARNA", "Batak Toba"],
  Tumanggor: ["Simbolon", "PARNA", "Batak Toba"],
  Maharaja: ["Simbolon", "PARNA", "Batak Toba"],
  Turutan: ["Simbolon", "PARNA", "Batak Toba"],
  Nahampun: ["Simbolon", "PARNA", "Batak Toba"],
  Pinayungan: ["Simbolon", "PARNA", "Batak Toba"],
  Berampu: ["Simbolon", "PARNA", "Batak Toba"],
  Pasi: ["Simbolon", "PARNA", "Batak Toba"],
  Tamba: ["Tamba", "PARNA", "Batak Toba"],
  Siallagan: ["Tamba", "PARNA", "Batak Toba"],
  Tomok: ["Tamba", "PARNA", "Batak Toba"],
  Sidabutar: ["Tamba", "PARNA", "Batak Toba"],
  Sijabat: ["Tamba", "PARNA", "Batak Toba"],
  Gusar: ["Tamba", "PARNA", "Batak Toba"],
  Siadari: ["Tamba", "PARNA", "Batak Toba"],
  Sidabolak: ["Tamba", "PARNA", "Batak Toba"],
  Rumahorbo: ["Tamba", "PARNA", "Batak Toba"],
  Napitu: ["Tamba", "PARNA", "Batak Toba"],
  Saragi: ["Saragi", "PARNA", "Batak Toba"],
  Simalango: ["Saragi", "PARNA", "Batak Toba"],
  Saing: ["Saragi", "PARNA", "Batak Toba"],
  Simarmata: ["Saragi", "PARNA", "Batak Toba"],
  Nadeak: ["Saragi", "PARNA", "Batak Toba"],
  Sidabungke: ["Saragi", "PARNA", "Batak Toba"],
  Munte: ["Munte", "PARNA", "Batak Toba"],
  "Nai Munte": ["Munte", "PARNA", "Batak Toba"],
  Dalimunte: ["Munte", "PARNA", "Batak Toba"],
  Sitanggang: ["Munte", "PARNA", "Batak Toba"],
  Manihuruk: ["Munte", "PARNA", "Batak Toba"],
  Sidauruk: ["Munte", "PARNA", "Batak Toba"],
  Turnip: ["Munte", "PARNA", "Batak Toba"],
  Sitio: ["Munte", "PARNA", "Batak Toba"],
  Sigalingging: ["Munte", "PARNA", "Batak Toba"],

  // ── Nai Rasaon ──
  Sitorus: ["Raja Mardopang", "Nai Rasaon", "Batak Toba"],
  Sirait: ["Raja Mardopang", "Nai Rasaon", "Batak Toba"],
  Butarbutar: ["Raja Mardopang", "Nai Rasaon", "Batak Toba"],
  Pane: ["Raja Mardopang", "Nai Rasaon", "Batak Toba"],
  Manurung: ["Raja Mangatur", "Nai Rasaon", "Batak Toba"],

  // ── Si Bagot ni Pohan ──
  Tampubolon: ["Tampubolon", "Si Bagot ni Pohan", "Batak Toba"],
  Barimbing: ["Tampubolon", "Si Bagot ni Pohan", "Batak Toba"],
  Silaen: ["Tampubolon", "Si Bagot ni Pohan", "Batak Toba"],
  Siahaan: ["Siahaan", "Si Bagot ni Pohan", "Batak Toba"],
  Simanjuntak: ["Siahaan", "Si Bagot ni Pohan", "Batak Toba"],
  Hutagaol: ["Siahaan", "Si Bagot ni Pohan", "Batak Toba"],
  Nasution: ["Siahaan", "Si Bagot ni Pohan", "Batak Toba"],
  Panjaitan: ["Panjaitan", "Si Bagot ni Pohan", "Batak Toba"],
  Silitonga: ["Panjaitan", "Si Bagot ni Pohan", "Batak Toba"],
  Siagian: ["Panjaitan", "Si Bagot ni Pohan", "Batak Toba"],
  Sianipar: ["Panjaitan", "Si Bagot ni Pohan", "Batak Toba"],
  Pardosi: ["Panjaitan", "Si Bagot ni Pohan", "Batak Toba"],
  Simangunsong: ["Sonak Malela", "Si Bagot ni Pohan", "Batak Toba"],
  Marpaung: ["Sonak Malela", "Si Bagot ni Pohan", "Batak Toba"],
  Napitupulu: ["Sonak Malela", "Si Bagot ni Pohan", "Batak Toba"],
  Pardede: ["Sonak Malela", "Si Bagot ni Pohan", "Batak Toba"],

  // ── Sipaettua ──
  Hutahaean: ["Hutahaean", "Sipaettua", "Batak Toba"],
  Hutajulu: ["Hutahaean", "Sipaettua", "Batak Toba"],
  Aruan: ["Hutahaean", "Sipaettua", "Batak Toba"],
  Sibarani: ["Sibarani", "Sipaettua", "Batak Toba"],
  Sibuea: ["Sibarani", "Sipaettua", "Batak Toba"],
  Sarumpaet: ["Sibarani", "Sipaettua", "Batak Toba"],
  Pangaribuan: ["Pangaribuan", "Sipaettua", "Batak Toba"],
  Hutapea: ["Pangaribuan", "Sipaettua", "Batak Toba"],

  // ── Silahi Sabungan ──
  Sihaloho: ["Sihaloho", "Silahi Sabungan", "Batak Toba"],
  Situngkir: ["Situngkir", "Silahi Sabungan", "Batak Toba"],
  Sipangkar: ["Situngkir", "Silahi Sabungan", "Batak Toba"],
  Sipayung: ["Situngkir", "Silahi Sabungan", "Batak Toba"],
  Sirumasondi: ["Sirumasondi", "Silahi Sabungan", "Batak Toba"],
  Rumasingap: ["Sirumasondi", "Silahi Sabungan", "Batak Toba"],
  Depari: ["Sirumasondi", "Silahi Sabungan", "Batak Toba"],
  "Sidabutar Silahi": [
    "Sidabutar Silahi",
    "Silahi Sabungan",
    "Batak Toba",
  ],
  Sidabariba: ["Sidabariba", "Silahi Sabungan", "Batak Toba"],
  Solia: ["Sidabariba", "Silahi Sabungan", "Batak Toba"],
  Sidebang: ["Sidebang", "Silahi Sabungan", "Batak Toba"],
  Boliala: ["Sidebang", "Silahi Sabungan", "Batak Toba"],
  Pintubatu: ["Pintubatu", "Silahi Sabungan", "Batak Toba"],
  Sigiro: ["Pintubatu", "Silahi Sabungan", "Batak Toba"],
  Tambun: ["Tambun", "Silahi Sabungan", "Batak Toba"],
  Tambunan: ["Tambun", "Silahi Sabungan", "Batak Toba"],
  Doloksaribu: ["Tambun", "Silahi Sabungan", "Batak Toba"],
  Sinurat: ["Tambun", "Silahi Sabungan", "Batak Toba"],
  Naiborhu: ["Tambun", "Silahi Sabungan", "Batak Toba"],
  Nadapdap: ["Tambun", "Silahi Sabungan", "Batak Toba"],
  Pagaraji: ["Tambun", "Silahi Sabungan", "Batak Toba"],
  Sunge: ["Tambun", "Silahi Sabungan", "Batak Toba"],
  Baruara: ["Tambun", "Silahi Sabungan", "Batak Toba"],
  "Lumban Pea Silahi": ["Tambun", "Silahi Sabungan", "Batak Toba"],
  "Lumban Gaol Silahi": ["Tambun", "Silahi Sabungan", "Batak Toba"],
  Silalahi: ["Silahi Sabungan", "Silahi Sabungan", "Batak Toba"],

  // ── Si Raja Oloan ──
  Naibaho: ["Naibaho", "Si Raja Oloan", "Batak Toba"],
  Ujung: ["Naibaho", "Si Raja Oloan", "Batak Toba"],
  Bintang: ["Naibaho", "Si Raja Oloan", "Batak Toba"],
  "Manik Oloan": ["Naibaho", "Si Raja Oloan", "Batak Toba"],
  Angkat: ["Naibaho", "Si Raja Oloan", "Batak Toba"],
  Hutadiri: ["Naibaho", "Si Raja Oloan", "Batak Toba"],
  Sinamo: ["Naibaho", "Si Raja Oloan", "Batak Toba"],
  Capa: ["Naibaho", "Si Raja Oloan", "Batak Toba"],
  Sihotang: ["Sihotang", "Si Raja Oloan", "Batak Toba"],
  Hasugian: ["Sihotang", "Si Raja Oloan", "Batak Toba"],
  Mataniari: ["Sihotang", "Si Raja Oloan", "Batak Toba"],
  Lingga: ["Sihotang", "Si Raja Oloan", "Batak Toba"],
  Bangkara: ["Bangkara", "Si Raja Oloan", "Batak Toba"],
  Sinambela: ["Sinambela", "Si Raja Oloan", "Batak Toba"],
  Dairi: ["Sinambela", "Si Raja Oloan", "Batak Toba"],
  Sihite: ["Sihite", "Si Raja Oloan", "Batak Toba"],
  Sileang: ["Sihite", "Si Raja Oloan", "Batak Toba"],
  Simanullang: ["Simanullang", "Si Raja Oloan", "Batak Toba"],

  // ── Si Raja Huta Lima ──
  Maha: ["Maha", "Si Raja Huta Lima", "Batak Toba"],
  Sambo: ["Sambo", "Si Raja Huta Lima", "Batak Toba"],
  "Pardosi Hutalima": [
    "Pardosi Hutalima",
    "Si Raja Huta Lima",
    "Batak Toba",
  ],
  "Sembiring Meliala": [
    "Pardosi Hutalima",
    "Si Raja Huta Lima",
    "Batak Toba",
  ],

  // ── Si Raja Sumba ──
  Simamora: ["Simamora", "Si Raja Sumba", "Batak Toba"],
  Rambe: ["Simamora", "Si Raja Sumba", "Batak Toba"],
  Purba: ["Simamora", "Si Raja Sumba", "Batak Toba"],
  Manalu: ["Simamora", "Si Raja Sumba", "Batak Toba"],
  Debataraja: ["Simamora", "Si Raja Sumba", "Batak Toba"],
  Girsang: ["Simamora", "Si Raja Sumba", "Batak Toba"],
  Tambak: ["Simamora", "Si Raja Sumba", "Batak Toba"],
  Siboro: ["Simamora", "Si Raja Sumba", "Batak Toba"],
  Sihombing: ["Sihombing", "Si Raja Sumba", "Batak Toba"],
  Silaban: ["Sihombing", "Si Raja Sumba", "Batak Toba"],
  "Lumban Toruan": ["Sihombing", "Si Raja Sumba", "Batak Toba"],
  Nababan: ["Sihombing", "Si Raja Sumba", "Batak Toba"],
  Hutasoit: ["Sihombing", "Si Raja Sumba", "Batak Toba"],
  Sitindaon: ["Sihombing", "Si Raja Sumba", "Batak Toba"],
  Binjori: ["Sihombing", "Si Raja Sumba", "Batak Toba"],
  Manullang: ["Simamora", "Toga Simamora", "Batak Toba"],

  // ── Si Raja Sobu ──
  Sitompul: ["Sitompul", "Si Raja Sobu", "Batak Toba"],
  Hasibuan: ["Hasibuan", "Si Raja Sobu", "Batak Toba"],
  Hutabarat: ["Hasibuan", "Si Raja Sobu", "Batak Toba"],
  Panggabean: ["Hasibuan", "Si Raja Sobu", "Batak Toba"],
  Hutagalung: ["Hasibuan", "Si Raja Sobu", "Batak Toba"],
  Hutatoruan: ["Hasibuan", "Si Raja Sobu", "Batak Toba"],
  Simorangkir: ["Hasibuan", "Si Raja Sobu", "Batak Toba"],
  "Hutapea Silindung": ["Hasibuan", "Si Raja Sobu", "Batak Toba"],
  "Lumban Tobing": ["Hasibuan", "Si Raja Sobu", "Batak Toba"],
  Mismis: ["Hasibuan", "Si Raja Sobu", "Batak Toba"],

  // ── Naipospos ──
  Marbun: ["Marbun", "Naipospos", "Batak Toba"],
  "Lumban Batu": ["Marbun", "Naipospos", "Batak Toba"],
  Banjarnahor: ["Marbun", "Naipospos", "Batak Toba"],
  "Lumban Gaol": ["Marbun", "Naipospos", "Batak Toba"],
  Meha: ["Marbun", "Naipospos", "Batak Toba"],
  Mungkur: ["Marbun", "Naipospos", "Batak Toba"],
  Saraan: ["Marbun", "Naipospos", "Batak Toba"],
  Sibagariang: ["Sipaholon", "Naipospos", "Batak Toba"],
  Hutauruk: ["Sipaholon", "Naipospos", "Batak Toba"],
  Simanungkalit: ["Sipaholon", "Naipospos", "Batak Toba"],
  Situmeang: ["Sipaholon", "Naipospos", "Batak Toba"],

  // ── Sienemkodin ──
  Tendang: ["Ompu Bada", "Sienemkodin", "Batak Toba"],
  Bunurea: ["Ompu Bada", "Sienemkodin", "Batak Toba"],
  "Manik Pakpak": ["Ompu Bada", "Sienemkodin", "Batak Toba"],
  Beringin: ["Ompu Bada", "Sienemkodin", "Batak Toba"],
  Gajah: ["Ompu Bada", "Sienemkodin", "Batak Toba"],
  Barasa: ["Ompu Bada", "Sienemkodin", "Batak Toba"],

  // ═══ BATAK KARO ═══
  Ginting: ["(tidak ada)", "Mergana Ginting", "Batak Karo"],
  Suka: ["Ginting", "Mergana Ginting", "Batak Karo"],
  Pase: ["Ginting", "Mergana Ginting", "Batak Karo"],
  "Karo-karo": ["(tidak ada)", "Mergana Karo-karo", "Batak Karo"],
  Surbakti: ["Karo-karo", "Mergana Karo-karo", "Batak Karo"],
  Sinulingga: ["Karo-karo", "Mergana Karo-karo", "Batak Karo"],
  Kaban: ["Karo-karo", "Mergana Karo-karo", "Batak Karo"],
  Sembiring: ["(tidak ada)", "Mergana Sembiring", "Batak Karo"],
  Kembaren: ["Sembiring", "Mergana Sembiring", "Batak Karo"],
  Brahmana: ["Sembiring", "Mergana Sembiring", "Batak Karo"],
  Meliala: ["Sembiring", "Mergana Sembiring", "Batak Karo"],
  Pandia: ["Sembiring", "Mergana Sembiring", "Batak Karo"],
  Tarigan: ["(tidak ada)", "Mergana Tarigan", "Batak Karo"],
  Sibero: ["Tarigan", "Mergana Tarigan", "Batak Karo"],
  "Perangin-angin": [
    "(tidak ada)",
    "Mergana Perangin-angin",
    "Batak Karo",
  ],
  Bangun: ["Perangin-angin", "Mergana Perangin-angin", "Batak Karo"],
  Sebayang: ["Perangin-angin", "Mergana Perangin-angin", "Batak Karo"],

  // ═══ BATAK MANDAILING ═══
  Parinduri: ["Rangkuti", "Datu Parulas", "Batak Mandailing"],

  // ═══ BATAK ANGKOLA ═══
  "Siregar Dongoran": ["Siregar", "Toga Siregar", "Batak Angkola"],

  // ═══ BATAK PAKPAK ═══
  Banurea: ["(tidak ada)", "Sua Simsim", "Batak Pakpak"],
  Berutu: ["(tidak ada)", "Sua Simsim", "Batak Pakpak"],
  Tumangger: ["(tidak ada)", "Klasen", "Batak Pakpak"],
  Boangmanalu: ["(tidak ada)", "Sua Simsim", "Batak Pakpak"],
  Anakampun: ["(tidak ada)", "Klasen", "Batak Pakpak"],
  Capah: ["(tidak ada)", "Keppas", "Batak Pakpak"],
};

export function infoMarga(m: string): MargaInfo | null {
  return MARGA_DB[m] ?? null;
}

export function indukMarga(m: string): string | null {
  const d = infoMarga(m);
  return d ? d[0] : null;
}

export function rumpunMarga(m: string): string | null {
  const d = infoMarga(m);
  return d ? d[1] : null;
}

export function sukuMarga(m: string): string | null {
  const d = infoMarga(m);
  return d ? d[2] : null;
}

/** Sorted list of all clan names for dropdowns */
export function semuaMarga(): string[] {
  return Object.keys(MARGA_DB).sort((a, b) => a.localeCompare(b, "id"));
}
