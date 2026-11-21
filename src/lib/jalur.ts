// Turunan dari konten + status: urutan simpul, status simpul, soal ulasan, dll.
import type { Bagian, Konten, Pelajaran, Soal, StatusSiswa } from '../../shared/tipe.ts';

export type StatusSimpul = 'selesai' | 'sekarang' | 'terkunci';

export interface Simpul {
  id: string;
  jenis: 'pelajaran' | 'ulasan' | 'kisah';
  bagian: Bagian;
  pelajaran?: Pelajaran;
  judul: string;
}

export function daftarSimpul(konten: Konten): Simpul[] {
  const hasil: Simpul[] = [];
  for (const b of konten.bagian) {
    for (const p of b.pelajaran) hasil.push({ id: p.id, jenis: p.jenis, bagian: b, pelajaran: p, judul: p.judul });
    const k = konten.kisah.find((x) => x.id === b.kisah);
    if (k) hasil.push({ id: k.id, jenis: 'kisah', bagian: b, judul: k.judul });
  }
  return hasil;
}

export function selesai(status: StatusSiswa, id: string): boolean {
  return Boolean(status.progres[id]) || status.kisahSelesai.includes(id);
}

export function statusSimpul(konten: Konten, status: StatusSiswa): Map<string, StatusSimpul> {
  const m = new Map<string, StatusSimpul>();
  let sekarangAda = false;
  for (const s of daftarSimpul(konten)) {
    if (selesai(status, s.id)) m.set(s.id, 'selesai');
    else if (!sekarangAda) {
      m.set(s.id, 'sekarang');
      sekarangAda = true;
    } else m.set(s.id, 'terkunci');
  }
  return m;
}

/** Status lokasi di Peta Budaya mengikuti jalur belajar. */
export function statusLokasi(konten: Konten, status: StatusSiswa, b: Bagian): 'terkunci' | 'terbuka' | 'selesai' {
  if (status.kisahSelesai.includes(b.kisah)) return 'selesai';
  const st = statusSimpul(konten, status);
  const pertama = b.pelajaran[0];
  return pertama && st.get(pertama.id) !== 'terkunci' ? 'terbuka' : 'terkunci';
}

export function acak<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Soal untuk simpul ulasan: diambil dari pelajaran lain di bagian yang sama. */
export function soalUlasan(b: Bagian, jumlah = 8): Soal[] {
  const semua = b.pelajaran.filter((p) => p.jenis === 'pelajaran').flatMap((p) => p.soal);
  return acak(semua).slice(0, jumlah);
}

/** Soal Arena: tipe pilihan cepat dari bagian yang sudah terbuka. */
export function soalArena(konten: Konten, status: StatusSiswa, jumlah = 10): Soal[] {
  const st = statusSimpul(konten, status);
  const bagian = konten.bagian.filter((b) => b.pelajaran[0] && st.get(b.pelajaran[0].id) !== 'terkunci');
  const kumpulan = (bagian.length ? bagian : konten.bagian.slice(0, 1))
    .flatMap((b) => b.pelajaran.flatMap((p) => p.soal))
    .filter((s) => s.tipe === 'pilih_arti' || s.tipe === 'dengar' || s.tipe === 'pantun');
  return acak(kumpulan).slice(0, jumlah);
}

export const WARNA_BAGIAN: Record<string, { isi: string; tepi: string; muda: string; teks: string }> = {
  merah: { isi: '#C0392B', tepi: '#922B21', muda: '#FBE4E1', teks: '#C0392B' },
  hijau: { isi: '#1E8449', tepi: '#145A32', muda: '#DDF3E5', teks: '#1E8449' },
  biru: { isi: '#1F6FA3', tepi: '#1A5A85', muda: '#DDEEF9', teks: '#1F6FA3' },
};
