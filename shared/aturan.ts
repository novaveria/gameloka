// Aturan gamifikasi (DESIGN.md bagian 6). Dipakai server untuk menghitung, dan aplikasi untuk menampilkan.
import type { InfoLevel } from './tipe.ts';

export const XP = {
  pelajaran: 10,
  pelajaranSempurna: 5,
  arenaBenar: 10,
  arenaCepat: 5,
  pustaka: 15,
  kisah: 25,
} as const;

export const BATAS_CEPAT_MS = 5000;
export const DETIK_ARENA = 10;
export const TARGET_HARIAN = [10, 20, 30] as const;

// Nama level masih usulan. Nama final harus disetujui LKB.
export const LEVEL = [
  { level: 1, min: 0, nama: 'Bocah' },
  { level: 2, min: 200, nama: 'Jawara Muda' },
  { level: 3, min: 600, nama: 'Jago' },
  { level: 4, min: 1200, nama: 'Abang / Mpok' },
] as const;

export function infoLevel(xp: number): InfoLevel {
  let i = 0;
  for (let k = 0; k < LEVEL.length; k++) if (xp >= LEVEL[k].min) i = k;
  const l = LEVEL[i];
  return { level: l.level, nama: l.nama, min: l.min, berikut: LEVEL[i + 1]?.min ?? null };
}

/** Bintang 1–3 dari akurasi percobaan pertama. */
export function hitungBintang(benar: number, total: number): 1 | 2 | 3 {
  if (total <= 0) return 1;
  const a = benar / total;
  if (a >= 0.9) return 3;
  if (a >= 0.6) return 2;
  return 1;
}

// ---------- Misi Harian ----------

export type JenisMisi = 'target' | 'pelajaran' | 'sempurna' | 'arena' | 'pustaka' | 'bintang3';

export interface DefMisi {
  id: string;
  jenis: JenisMisi;
  target: number;
  judul: string;
  hadiah: number;
}

const POOL: DefMisi[] = [
  { id: 'pel2', jenis: 'pelajaran', target: 2, judul: 'Selesaikan 2 pelajaran', hadiah: 10 },
  { id: 'pel3', jenis: 'pelajaran', target: 3, judul: 'Selesaikan 3 pelajaran', hadiah: 15 },
  { id: 'semp1', jenis: 'sempurna', target: 1, judul: 'Selesaikan 1 pelajaran tanpa salah', hadiah: 10 },
  { id: 'semp2', jenis: 'sempurna', target: 2, judul: 'Selesaikan 2 pelajaran tanpa salah', hadiah: 20 },
  { id: 'arena5', jenis: 'arena', target: 5, judul: 'Jawab 5 soal benar di Arena', hadiah: 10 },
  { id: 'pus1', jenis: 'pustaka', target: 1, judul: 'Baca 1 artikel Pustaka sampai selesai', hadiah: 10 },
  { id: 'b3', jenis: 'bintang3', target: 1, judul: 'Raih 3 bintang di satu pelajaran', hadiah: 15 },
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Tiga misi per hari. Misi pertama selalu target harian siswa; dua lainnya dipilih tetap per tanggal. */
export function misiHariIni(tanggal: string, targetHarian: number): DefMisi[] {
  const pertama: DefMisi = {
    id: `target${targetHarian}`,
    jenis: 'target',
    target: targetHarian,
    judul: `Dapatkan ${targetHarian} XP`,
    hadiah: 10,
  };
  const sisa = [...POOL];
  const hasil: DefMisi[] = [pertama];
  let h = hash(tanggal);
  while (hasil.length < 3 && sisa.length) {
    const i = h % sisa.length;
    const m = sisa.splice(i, 1)[0];
    if (!hasil.some((x) => x.jenis === m.jenis)) hasil.push(m);
    h = hash(String(h));
  }
  return hasil;
}

// ---------- Tanggal (zona Asia/Jakarta) ----------

const fmtTanggal = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const fmtJam = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false });

/** YYYY-MM-DD menurut waktu Jakarta. */
export function tanggalJakarta(d: Date = new Date()): string {
  return fmtTanggal.format(d);
}

export function jamJakarta(d: Date = new Date()): number {
  return Number(fmtJam.format(d)) % 24;
}

export function geserHari(tanggal: string, n: number): string {
  const [y, m, d] = tanggal.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** 0 = Senin … 6 = Minggu */
export function urutanHari(tanggal: string): number {
  const [y, m, d] = tanggal.split('-').map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

export function awalMinggu(tanggal: string): string {
  return geserHari(tanggal, -urutanHari(tanggal));
}

export function hariMinggu(tanggal: string): string[] {
  const awal = awalMinggu(tanggal);
  return Array.from({ length: 7 }, (_, i) => geserHari(awal, i));
}

export const NAMA_HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
