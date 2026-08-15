-- ================================================================
-- PARIBAN — Supabase Schema
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- Tabel utama peserta
CREATE TABLE IF NOT EXISTS peserta (
  kode          TEXT PRIMARY KEY,
  nama          TEXT NOT NULL,
  email         TEXT NOT NULL,
  wa            TEXT NOT NULL,
  gender        TEXT NOT NULL CHECK (gender IN ('Perempuan', 'Laki-laki')),
  tahun_lahir   INTEGER NOT NULL,
  kota          TEXT NOT NULL,
  agama         TEXT NOT NULL,
  cari_agama    TEXT NOT NULL,
  suku          TEXT NOT NULL,
  marga         TEXT NOT NULL,
  marga_ibu     TEXT DEFAULT '',
  sub_marga     TEXT DEFAULT '',
  klg_besar     INTEGER DEFAULT 3,
  ibadah        TEXT DEFAULT '',
  rokok         TEXT DEFAULT '',
  alkohol       TEXT DEFAULT '',
  anak_ke       TEXT DEFAULT '',
  pendidikan    TEXT DEFAULT '',
  kerja         TEXT DEFAULT '',
  pindah        TEXT DEFAULT '',
  ldr           TEXT DEFAULT '',
  timeline      TEXT DEFAULT '',
  tabungan      TEXT DEFAULT '',
  anak          TEXT DEFAULT '',
  ortu          TEXT DEFAULT '',
  bahasa_kasih  TEXT DEFAULT '',
  konflik       TEXT DEFAULT '',
  introvert     INTEGER DEFAULT 3,
  boleh_hubung  TEXT DEFAULT '',
  catatan       TEXT DEFAULT '',
  inisial       TEXT NOT NULL,
  status_data   TEXT DEFAULT 'LENGKAP',
  foto             TEXT,
  premium          BOOLEAN DEFAULT FALSE,
  premium_expiry   TIMESTAMPTZ,
  premium_paket    TEXT CHECK (premium_paket IN ('trial','3bln','6bln')),
  pekerjaan        TEXT,
  jabatan          TEXT,
  tinggi_badan     INTEGER,
  berat_badan      TEXT CHECK (berat_badan IN ('Kurus','Sedang','Berisi')),
  minat            TEXT[],
  sosmed_linkedin  TEXT,
  sosmed_instagram TEXT,
  sosmed_tiktok    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query umum
CREATE INDEX IF NOT EXISTS idx_peserta_gender ON peserta (gender);
CREATE INDEX IF NOT EXISTS idx_peserta_premium ON peserta (premium);

-- RLS: matikan untuk server-side access via service key
ALTER TABLE peserta DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- Tabel chat
-- ================================================================

CREATE TABLE IF NOT EXISTS percakapan (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  peserta_a      TEXT NOT NULL REFERENCES peserta(kode),
  peserta_b      TEXT NOT NULL REFERENCES peserta(kode),
  dilaporkan     BOOLEAN DEFAULT FALSE,
  alasan_laporan TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_percakapan_a ON percakapan (peserta_a);
CREATE INDEX IF NOT EXISTS idx_percakapan_b ON percakapan (peserta_b);
ALTER TABLE percakapan DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS pesan (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  percakapan_id  UUID NOT NULL REFERENCES percakapan(id) ON DELETE CASCADE,
  pengirim       TEXT NOT NULL REFERENCES peserta(kode),
  isi            TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pesan_percakapan ON pesan (percakapan_id, created_at);
ALTER TABLE pesan DISABLE ROW LEVEL SECURITY;

-- Aktifkan Realtime untuk tabel pesan:
-- Supabase Dashboard → Database → Replication → centang tabel "pesan"

-- ================================================================
-- Storage bucket untuk foto profil
-- Lakukan di: Supabase Dashboard → Storage → New Bucket
-- Nama bucket : pariban-photos
-- Public      : YES (centang "Public bucket")
-- ================================================================
