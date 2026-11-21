// Memeriksa struktur konten dan status validasinya.
// Jalankan: npm run cek
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Artikel, Bagian, FrasaUI, Kartu, Kisah, Soal, Validasi } from '../shared/tipe.ts';

const DIR = resolve(import.meta.dirname, '..', 'konten');
const baca = <T>(f: string): T => JSON.parse(readFileSync(join(DIR, f), 'utf8'));

const bagian = baca<{ bagian: Bagian[] }>('bagian.json').bagian;
const kisah = baca<{ kisah: Kisah[] }>('kisah.json').kisah;
const kartu = baca<{ kartu: Kartu[] }>('kartu.json').kartu;
const pustaka = baca<{ pustaka: Artikel[] }>('pustaka.json').pustaka;
const pujian = baca<{ pujian: FrasaUI[] }>('ui.json').pujian;

const galat: string[] = [];
const id = new Set<string>();
let total = 0;
let sah = 0;

function butir(x: Validasi & { id: string }, tempat: string) {
  total++;
  // id cukup unik per koleksi (kartu dan artikel boleh memakai id yang sama, misalnya "kerak-telor").
  const kunci = `${tempat.split('/').length === 2 ? tempat.split('/')[0] : 'soal'}:${x.id}`;
  if (id.has(kunci)) galat.push(`${tempat}: id ganda ${x.id}`);
  id.add(kunci);
  if (!('validator' in x) || !('tanggal_validasi' in x)) galat.push(`${tempat}: kolom validator/tanggal_validasi tidak ada`);
  if (x.validator && x.tanggal_validasi) {
    sah++;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(x.tanggal_validasi)) galat.push(`${tempat}: tanggal_validasi harus YYYY-MM-DD`);
  }
}

function soal(s: Soal, tempat: string) {
  butir(s, tempat);
  switch (s.tipe) {
    case 'pilih_arti':
    case 'dengar':
    case 'pantun':
      if (!s.pilihan.includes(s.jawaban)) galat.push(`${tempat}: jawaban "${s.jawaban}" tidak ada di pilihan`);
      if (new Set(s.pilihan).size !== s.pilihan.length) galat.push(`${tempat}: pilihan ganda`);
      if (s.tipe === 'pantun' && s.baris.filter((b) => b.includes('___')).length !== 1) galat.push(`${tempat}: pantun harus punya tepat satu "___"`);
      if (s.tipe === 'dengar' && !s.audio) galat.push(`${tempat}: (peringatan) belum ada rekaman audio penutur asli`);
      break;
    case 'susun':
      if (s.jawaban.some((k) => s.pengecoh.includes(k))) galat.push(`${tempat}: pengecoh sama dengan kata jawaban`);
      break;
    case 'pasangan':
      if (s.pasangan.length < 3) galat.push(`${tempat}: pasangan minimal 3`);
      if (new Set(s.pasangan.map((p) => p[1])).size !== s.pasangan.length) galat.push(`${tempat}: arti ganda di pasangan`);
      break;
  }
}

for (const b of bagian) {
  for (const p of b.pelajaran) p.soal.forEach((s) => soal(s, `${b.id}/${p.id}/${s.id}`));
  if (!kisah.some((k) => k.id === b.kisah)) galat.push(`${b.id}: kisah ${b.kisah} tidak ada`);
}
for (const k of kisah) {
  butir(k, `kisah/${k.id}`);
  for (const c of k.kartu) if (!kartu.some((x) => x.id === c)) galat.push(`kisah/${k.id}: kartu ${c} tidak ada`);
}
kartu.forEach((k) => butir(k, `kartu/${k.id}`));
for (const a of pustaka) {
  butir(a, `pustaka/${a.id}`);
  if (a.soal.length !== 2) galat.push(`pustaka/${a.id}: harus 2 soal`);
  a.soal.forEach((s) => soal(s, `pustaka/${a.id}/${s.id}`));
}
pujian.forEach((x) => butir(x, `ui/${x.id}`));

const peringatan = galat.filter((g) => g.includes('(peringatan)'));
const fatal = galat.filter((g) => !g.includes('(peringatan)'));
console.log(`Butir konten: ${total}. Tervalidasi LKB: ${sah}. Belum: ${total - sah}.`);
if (peringatan.length) console.log(`\n${peringatan.length} peringatan:\n  ${peringatan.join('\n  ')}`);
if (fatal.length) {
  console.error(`\n${fatal.length} galat:\n  ${fatal.join('\n  ')}`);
  process.exit(1);
}
console.log('\nStruktur konten valid.');
