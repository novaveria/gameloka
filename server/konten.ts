// Memuat konten dari folder konten/ dan menyaring butir yang belum divalidasi LKB.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Artikel, Bagian, FrasaUI, Kartu, Kisah, Konten, Validasi } from '../shared/tipe.ts';

export function tervalidasi(x: Validasi): boolean {
  return Boolean(x.validator && x.tanggal_validasi);
}

function baca<T>(dir: string, berkas: string): T {
  return JSON.parse(readFileSync(join(dir, berkas), 'utf8')) as T;
}

/**
 * izinkanDraf = true hanya untuk pengembangan dan uji coba sebelum validasi.
 * Saat false, butir tanpa validator dan tanggal_validasi tidak dikirim ke aplikasi sama sekali.
 */
export function muatKonten(dir: string, izinkanDraf: boolean): Konten {
  const lolos = <T extends Validasi>(x: T) => izinkanDraf || tervalidasi(x);
  const mentah = {
    bagian: baca<{ bagian: Bagian[] }>(dir, 'bagian.json').bagian,
    kisah: baca<{ kisah: Kisah[] }>(dir, 'kisah.json').kisah,
    kartu: baca<{ kartu: Kartu[] }>(dir, 'kartu.json').kartu,
    pustaka: baca<{ pustaka: Artikel[] }>(dir, 'pustaka.json').pustaka,
    pujian: baca<{ pujian: FrasaUI[] }>(dir, 'ui.json').pujian,
  };

  let adaDraf = false;
  const tandai = <T extends Validasi>(x: T) => {
    if (!tervalidasi(x)) adaDraf = true;
    return lolos(x);
  };

  const bagian = mentah.bagian
    .map((b) => ({
      ...b,
      pelajaran: b.pelajaran
        .map((p) => ({ ...p, soal: p.soal.filter(tandai) }))
        // Ulasan tidak punya soal sendiri; pelajaran biasa butuh minimal 3 soal tervalidasi.
        .filter((p) => p.jenis === 'ulasan' || p.soal.length >= 3),
    }))
    .filter((b) => b.pelajaran.some((p) => p.jenis === 'pelajaran'));

  const kisah = mentah.kisah.filter(tandai);
  const kartu = mentah.kartu.filter(tandai);
  const pustaka = mentah.pustaka
    .filter(tandai)
    .map((a) => ({ ...a, soal: a.soal.filter(tandai) }))
    .filter((a) => a.soal.length === 2);
  const pujian = mentah.pujian.filter(tandai);

  return { bagian, kisah, kartu, pustaka, pujian, adaDraf: izinkanDraf && adaDraf };
}

/** Urutan simpul jalur: pelajaran setiap bagian, lalu kisahnya. */
export function urutanSimpul(konten: Konten): string[] {
  const hasil: string[] = [];
  for (const b of konten.bagian) {
    for (const p of b.pelajaran) hasil.push(p.id);
    if (konten.kisah.some((k) => k.id === b.kisah)) hasil.push(b.kisah);
  }
  return hasil;
}
