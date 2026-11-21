// Tipe data bersama antara server dan aplikasi.
// Konten disimpan sebagai JSON di folder konten/. Setiap butir punya validator dan tanggal_validasi.

export interface Validasi {
  validator: string | null;
  tanggal_validasi: string | null;
}

export type Lokasi = 'kemayoran' | 'condet' | 'setu-babakan';
export type WarnaBagian = 'merah' | 'hijau' | 'biru';

interface SoalDasar extends Validasi {
  id: string;
  /** Contoh kalimat yang ditampilkan saat jawaban salah. */
  contoh?: string;
}

export interface SoalSusun extends SoalDasar {
  tipe: 'susun';
  /** Kalimat Betawi yang diterjemahkan. */
  teks: string;
  /** Urutan ubin jawaban yang benar (bahasa Indonesia). */
  jawaban: string[];
  pengecoh: string[];
}

export interface SoalPilihArti extends SoalDasar {
  tipe: 'pilih_arti';
  kata: string;
  pilihan: string[];
  jawaban: string;
}

export interface SoalDengar extends SoalDasar {
  tipe: 'dengar';
  /** Berkas audio penutur asli. null kalau belum direkam. */
  audio: string | null;
  teks: string;
  pilihan: string[];
  jawaban: string;
}

export interface SoalPantun extends SoalDasar {
  tipe: 'pantun';
  /** Empat baris; tepat satu baris berisi "___". */
  baris: string[];
  pilihan: string[];
  jawaban: string;
}

export interface SoalPasangan extends SoalDasar {
  tipe: 'pasangan';
  /** [Betawi, Indonesia] */
  pasangan: [string, string][];
}

export type Soal = SoalSusun | SoalPilihArti | SoalDengar | SoalPantun | SoalPasangan;

export interface Pelajaran {
  id: string;
  judul: string;
  jenis: 'pelajaran' | 'ulasan';
  ikon: 'bintang' | 'audio' | 'buku' | 'pena';
  soal: Soal[];
}

export interface Bagian {
  id: string;
  nomor: number;
  judul: string;
  lokasi: Lokasi;
  namaLokasi: string;
  warna: WarnaBagian;
  pelajaran: Pelajaran[];
  kisah: string;
  lencana: { id: string; nama: string };
}

export interface AdeganKisah {
  karakter: string;
  teks: string;
  arti: string;
  pilihan?: { teks: string; arti: string; balasan: string; balasanArti: string; tepat: boolean }[];
}

export interface Kisah extends Validasi {
  id: string;
  judul: string;
  lokasi: Lokasi;
  bagian: string;
  adegan: AdeganKisah[];
  kartu: string[];
}

export interface Kartu extends Validasi {
  id: string;
  nama: string;
  kategori: string;
  keterangan: string;
}

export interface Artikel extends Validasi {
  id: string;
  judul: string;
  kategori: 'Kesenian' | 'Kuliner' | 'Arsitektur' | 'Tradisi';
  ringkas: string;
  ilustrasi: string;
  isi: string[];
  soal: SoalPilihArti[];
}

export interface FrasaUI extends Validasi {
  id: string;
  teks: string;
  arti: string;
}

export interface Konten {
  bagian: Bagian[];
  kisah: Kisah[];
  kartu: Kartu[];
  pustaka: Artikel[];
  pujian: FrasaUI[];
  /** true kalau server menampilkan konten yang belum divalidasi (mode draf). */
  adaDraf: boolean;
}

// ---------- Status siswa ----------

export interface Harian {
  xp: number;
  pelajaran: number;
  sempurna: number;
  arena: number;
  pustaka: number;
  bintang3: number;
  klaim: string[];
}

export interface MisiStatus {
  id: string;
  judul: string;
  target: number;
  nilai: number;
  hadiah: number;
  diklaim: boolean;
}

export interface StatusSiswa {
  id: string;
  nama: string;
  kodeMasuk: string;
  kelas: { nama: string; kode: string } | null;
  bergabung: string;
  targetHarian: number;
  xp: number;
  xpHariIni: number;
  xpMinggu: number;
  level: InfoLevel;
  streak: number;
  streakTerakhir: string | null;
  hariAktif: string[];
  progres: Record<string, { bintang: number; kali: number }>;
  kisahSelesai: string[];
  pustakaSelesai: string[];
  kartu: string[];
  lencana: string[];
  misi: MisiStatus[];
  mingguan: { tanggal: string; saya: number; kelas: number | null }[];
  hariIni: string;
  jamJakarta: number;
  cerita: { id: string; judul: string; status: string; waktu: string }[];
}

export interface InfoLevel {
  level: number;
  nama: string;
  min: number;
  berikut: number | null;
}

export interface BarisPeringkat {
  id: string;
  nama: string;
  xp: number;
  saya: boolean;
}
