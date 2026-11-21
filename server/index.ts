// Server Gameloka: API JSON + berkas statis hasil build (dist/).
// Tanpa dependensi luar. Jalankan: node server/index.ts
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { bukaDb, type Siswa } from './db.ts';
import { muatKonten, urutanSimpul } from './konten.ts';
import {
  BATAS_CEPAT_MS, TARGET_HARIAN, XP, geserHari, hariMinggu, hitungBintang, infoLevel,
  jamJakarta, misiHariIni, tanggalJakarta,
} from '../shared/aturan.ts';
import type { BarisPeringkat, Harian, StatusSiswa } from '../shared/tipe.ts';

const AKAR = resolve(import.meta.dirname, '..');
const PRODUKSI = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT ?? 8787);
const IZINKAN_DRAF = process.env.GAMELOKA_IZINKAN_DRAF
  ? process.env.GAMELOKA_IZINKAN_DRAF === '1'
  : !PRODUKSI;

const konten = muatKonten(join(AKAR, 'konten'), IZINKAN_DRAF);
const SIMPUL = urutanSimpul(konten);
const db = bukaDb(process.env.GAMELOKA_DATA ?? join(AKAR, 'data', 'db.json'));
const D = db.data;

// ---------- Utilitas ----------

const HURUF = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function kode(n: number): string {
  const b = randomBytes(n);
  return Array.from(b, (x) => HURUF[x % HURUF.length]).join('');
}
function kodeUnik(n: number, sudahAda: (k: string) => boolean): string {
  for (;;) {
    const k = kode(n);
    if (!sudahAda(k)) return k;
  }
}

class Galat extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function kirim(res: ServerResponse, status: number, isi: unknown) {
  const body = JSON.stringify(isi);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(body);
}

async function bacaBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  let total = 0;
  const potong: Buffer[] = [];
  for await (const c of req) {
    total += (c as Buffer).length;
    if (total > 64 * 1024) throw new Galat(413, 'Data terlalu besar.');
    potong.push(c as Buffer);
  }
  if (!potong.length) return {};
  try {
    const v = JSON.parse(Buffer.concat(potong).toString('utf8'));
    return v && typeof v === 'object' ? v : {};
  } catch {
    throw new Galat(400, 'Format data tidak dikenali.');
  }
}

function teks(v: unknown, min: number, max: number, nama: string): string {
  const s = typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '';
  if (s.length < min) throw new Galat(400, `${nama} terlalu pendek.`);
  if (s.length > max) throw new Galat(400, `${nama} terlalu panjang (maksimal ${max} huruf).`);
  return s;
}

// Pembatas sederhana untuk percobaan masuk dengan kode.
const percobaan = new Map<string, { n: number; sejak: number }>();
function batasi(req: IncomingMessage, kunci: string, maks: number) {
  const ip = req.socket.remoteAddress ?? '?';
  const k = `${kunci}:${ip}`;
  const now = Date.now();
  const p = percobaan.get(k);
  if (!p || now - p.sejak > 60_000) {
    percobaan.set(k, { n: 1, sejak: now });
    return;
  }
  p.n++;
  if (p.n > maks) throw new Galat(429, 'Terlalu banyak percobaan. Tunggu satu menit.');
}

// ---------- Logika siswa ----------

function harianKosong(): Harian {
  return { xp: 0, pelajaran: 0, sempurna: 0, arena: 0, pustaka: 0, bintang3: 0, klaim: [] };
}
function hariIni(s: Siswa): Harian {
  const t = tanggalJakarta();
  return (s.harian[t] ??= harianKosong());
}
function tambahXp(s: Siswa, n: number) {
  s.xp += n;
  hariIni(s).xp += n;
}
function xpMinggu(s: Siswa, tanggal = tanggalJakarta()): number {
  return hariMinggu(tanggal).reduce((a, d) => a + (s.harian[d]?.xp ?? 0), 0);
}
function streakEfektif(s: Siswa): number {
  const t = tanggalJakarta();
  const { jumlah, terakhir } = s.streak;
  if (terakhir === t || terakhir === geserHari(t, -1)) return jumlah;
  return 0;
}
/** Dipanggil saat pelajaran selesai. Mengembalikan true kalau ini pelajaran pertama hari ini. */
function catatAktif(s: Siswa): boolean {
  const t = tanggalJakarta();
  if (s.streak.terakhir === t) return false;
  s.streak.jumlah = s.streak.terakhir === geserHari(t, -1) ? s.streak.jumlah + 1 : 1;
  s.streak.terakhir = t;
  if (!s.hariAktif.includes(t)) s.hariAktif.push(t);
  if (s.hariAktif.length > 400) s.hariAktif = s.hariAktif.slice(-400);
  return true;
}
function simpulSelesai(s: Siswa, id: string): boolean {
  return Boolean(s.progres[id]) || s.kisahSelesai.includes(id);
}
function terbuka(s: Siswa, id: string): boolean {
  const i = SIMPUL.indexOf(id);
  if (i < 0) return false;
  return SIMPUL.slice(0, i).every((x) => simpulSelesai(s, x));
}
function anggotaKelas(kelasId: string | null): Siswa[] {
  return kelasId ? D.siswa.filter((x) => x.kelasId === kelasId) : [];
}
function peringkat(s: Siswa): BarisPeringkat[] {
  const anggota = s.kelasId ? anggotaKelas(s.kelasId) : [s];
  return anggota
    .map((x) => ({ id: x.id, nama: x.nama, xp: xpMinggu(x), saya: x.id === s.id }))
    .sort((a, b) => b.xp - a.xp || a.nama.localeCompare(b.nama, 'id'));
}
function posisi(s: Siswa): number {
  return peringkat(s).findIndex((r) => r.saya) + 1;
}

function status(s: Siswa): StatusSiswa {
  const t = tanggalJakarta();
  const h = s.harian[t] ?? harianKosong();
  const kelas = s.kelasId ? D.kelas.find((k) => k.id === s.kelasId) ?? null : null;
  const anggota = anggotaKelas(s.kelasId);
  const nilaiMisi = (jenis: string) =>
    jenis === 'target' ? h.xp : (h as unknown as Record<string, number>)[jenis] ?? 0;
  return {
    id: s.id,
    nama: s.nama,
    kodeMasuk: s.kodeMasuk,
    kelas: kelas ? { nama: kelas.nama, kode: kelas.kode } : null,
    bergabung: s.bergabung,
    targetHarian: s.targetHarian,
    xp: s.xp,
    xpHariIni: h.xp,
    xpMinggu: xpMinggu(s),
    level: infoLevel(s.xp),
    streak: streakEfektif(s),
    streakTerakhir: s.streak.terakhir,
    hariAktif: s.hariAktif.slice(-62),
    progres: s.progres,
    kisahSelesai: s.kisahSelesai,
    pustakaSelesai: s.pustakaSelesai,
    kartu: s.kartu,
    lencana: s.lencana,
    misi: misiHariIni(t, s.targetHarian).map((m) => ({
      id: m.id,
      judul: m.judul,
      target: m.target,
      nilai: Math.min(m.target, nilaiMisi(m.jenis)),
      hadiah: m.hadiah,
      diklaim: h.klaim.includes(m.id),
    })),
    mingguan: hariMinggu(t).map((d) => ({
      tanggal: d,
      saya: s.harian[d]?.xp ?? 0,
      kelas: anggota.length > 1
        ? Math.round(anggota.reduce((a, x) => a + (x.harian[d]?.xp ?? 0), 0) / anggota.length)
        : null,
    })),
    hariIni: t,
    jamJakarta: jamJakarta(),
    cerita: D.cerita
      .filter((c) => c.siswaId === s.id)
      .map((c) => ({ id: c.id, judul: c.judul, status: c.status, waktu: c.waktu })),
  };
}

function siswaDari(req: IncomingMessage): Siswa {
  const h = req.headers.authorization ?? '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  const s = token ? D.siswa.find((x) => x.token === token) : undefined;
  if (!s) throw new Galat(401, 'Sesi tidak ditemukan. Masuk lagi dengan kode masukmu.');
  return s;
}

function kelasDariKode(v: unknown): string | null {
  if (v == null || v === '') return null;
  const k = String(v).trim().toUpperCase();
  const kelas = D.kelas.find((x) => x.kode === k);
  if (!kelas) throw new Galat(404, 'Kode kelas tidak ditemukan. Periksa lagi dengan gurumu.');
  return kelas.id;
}

// ---------- Rute API ----------

type Penangan = (req: IncomingMessage, body: Record<string, unknown>, param: string[]) => unknown;
const rute: { metode: string; pola: RegExp; f: Penangan }[] = [];
const on = (metode: string, pola: RegExp, f: Penangan) => rute.push({ metode, pola, f });

on('GET', /^\/api\/konten$/, () => konten);

on('POST', /^\/api\/daftar$/, (_req, b) => {
  const nama = teks(b.nama, 2, 20, 'Nama panggilan');
  const alasan = teks(b.alasan ?? 'lainnya', 1, 40, 'Alasan');
  const target = Number(b.targetHarian);
  if (!TARGET_HARIAN.includes(target as 10)) throw new Galat(400, 'Target harian tidak dikenal.');
  const kelasId = kelasDariKode(b.kodeKelas);
  const s: Siswa = {
    id: randomUUID(),
    token: randomBytes(24).toString('base64url'),
    kodeMasuk: kodeUnik(6, (k) => D.siswa.some((x) => x.kodeMasuk === k)),
    nama,
    alasan,
    targetHarian: target,
    kelasId,
    bergabung: new Date().toISOString(),
    xp: 0,
    harian: {},
    progres: {},
    akurasi: { benar: 0, total: 0 },
    kisahSelesai: [],
    pustakaSelesai: [],
    kartu: [],
    lencana: [],
    streak: { jumlah: 0, terakhir: null },
    hariAktif: [],
  };
  D.siswa.push(s);
  db.simpan();
  return { token: s.token, status: status(s) };
});

on('POST', /^\/api\/masuk$/, (req, b) => {
  batasi(req, 'masuk', 10);
  const k = String(b.kodeMasuk ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const s = D.siswa.find((x) => x.kodeMasuk === k);
  if (!s) throw new Galat(404, 'Kode masuk tidak ditemukan.');
  return { token: s.token, status: status(s) };
});

on('GET', /^\/api\/saya$/, (req) => status(siswaDari(req)));

on('POST', /^\/api\/pengaturan$/, (req, b) => {
  const s = siswaDari(req);
  if (b.nama !== undefined) s.nama = teks(b.nama, 2, 20, 'Nama panggilan');
  if (b.targetHarian !== undefined) {
    const t = Number(b.targetHarian);
    if (!TARGET_HARIAN.includes(t as 10)) throw new Galat(400, 'Target harian tidak dikenal.');
    s.targetHarian = t;
  }
  if (b.kodeKelas !== undefined) s.kelasId = kelasDariKode(b.kodeKelas);
  db.simpan();
  return status(s);
});

on('POST', /^\/api\/pelajaran\/selesai$/, (req, b) => {
  const s = siswaDari(req);
  const id = String(b.pelajaranId ?? '');
  const pel = konten.bagian.flatMap((x) => x.pelajaran).find((p) => p.id === id);
  if (!pel) throw new Galat(404, 'Pelajaran tidak ditemukan.');
  if (!terbuka(s, id)) throw new Galat(403, 'Pelajaran ini belum terbuka.');
  const total = Math.max(1, Math.min(20, Math.floor(Number(b.total) || 0)));
  const benar = Math.max(0, Math.min(total, Math.floor(Number(b.benar) || 0)));

  const levelSebelum = infoLevel(s.xp).level;
  const sempurna = benar === total;
  const bintang = hitungBintang(benar, total);
  const xp = XP.pelajaran + (sempurna ? XP.pelajaranSempurna : 0);
  tambahXp(s, xp);
  const h = hariIni(s);
  h.pelajaran++;
  if (sempurna) h.sempurna++;
  if (bintang === 3) h.bintang3++;
  s.akurasi.benar += benar;
  s.akurasi.total += total;
  const lama = s.progres[id];
  s.progres[id] = { bintang: Math.max(lama?.bintang ?? 0, bintang), kali: (lama?.kali ?? 0) + 1 };
  const streakBaru = catatAktif(s);
  db.simpan();
  return {
    xp,
    bintang,
    sempurna,
    streakBaru,
    naikLevel: infoLevel(s.xp).level > levelSebelum,
    status: status(s),
  };
});

on('POST', /^\/api\/arena\/selesai$/, (req, b) => {
  const s = siswaDari(req);
  const mode = b.mode === 'bertarung' ? 'bertarung' : 'latihan';
  const jawaban = Array.isArray(b.jawaban) ? b.jawaban.slice(0, 15) : [];
  const sebelum = posisi(s);
  const levelSebelum = infoLevel(s.xp).level;
  let xp = 0;
  let benar = 0;
  for (const j of jawaban as { benar?: unknown; ms?: unknown }[]) {
    if (j?.benar !== true) continue;
    benar++;
    xp += XP.arenaBenar;
    if (mode === 'bertarung' && Number(j.ms) <= BATAS_CEPAT_MS) xp += XP.arenaCepat;
  }
  tambahXp(s, xp);
  hariIni(s).arena += benar;
  db.simpan();
  return {
    xp,
    benar,
    total: jawaban.length,
    posisiSebelum: sebelum,
    posisiSesudah: posisi(s),
    jumlahKelas: s.kelasId ? anggotaKelas(s.kelasId).length : 1,
    naikLevel: infoLevel(s.xp).level > levelSebelum,
    status: status(s),
  };
});

on('POST', /^\/api\/kisah\/selesai$/, (req, b) => {
  const s = siswaDari(req);
  const id = String(b.kisahId ?? '');
  const kisah = konten.kisah.find((k) => k.id === id);
  if (!kisah) throw new Galat(404, 'Kisah tidak ditemukan.');
  if (!terbuka(s, id)) throw new Galat(403, 'Kisah ini belum terbuka.');
  const levelSebelum = infoLevel(s.xp).level;
  const pertama = !s.kisahSelesai.includes(id);
  let kartuBaru: string[] = [];
  let lencanaBaru: string | null = null;
  if (pertama) {
    s.kisahSelesai.push(id);
    tambahXp(s, XP.kisah);
    kartuBaru = kisah.kartu.filter((k) => !s.kartu.includes(k) && konten.kartu.some((x) => x.id === k));
    s.kartu.push(...kartuBaru);
    const bag = konten.bagian.find((x) => x.id === kisah.bagian);
    if (bag && !s.lencana.includes(bag.lencana.id)) {
      s.lencana.push(bag.lencana.id);
      lencanaBaru = bag.lencana.id;
    }
  }
  db.simpan();
  return {
    xp: pertama ? XP.kisah : 0,
    kartuBaru,
    lencanaBaru,
    naikLevel: infoLevel(s.xp).level > levelSebelum,
    status: status(s),
  };
});

on('POST', /^\/api\/pustaka\/selesai$/, (req, b) => {
  const s = siswaDari(req);
  const id = String(b.artikelId ?? '');
  if (!konten.pustaka.some((a) => a.id === id)) throw new Galat(404, 'Artikel tidak ditemukan.');
  const levelSebelum = infoLevel(s.xp).level;
  const pertama = !s.pustakaSelesai.includes(id);
  if (pertama) {
    s.pustakaSelesai.push(id);
    tambahXp(s, XP.pustaka);
    hariIni(s).pustaka++;
  }
  db.simpan();
  return {
    xp: pertama ? XP.pustaka : 0,
    naikLevel: infoLevel(s.xp).level > levelSebelum,
    status: status(s),
  };
});

on('POST', /^\/api\/misi\/klaim$/, (req, b) => {
  const s = siswaDari(req);
  const st = status(s);
  const m = st.misi.find((x) => x.id === b.misiId);
  if (!m) throw new Galat(404, 'Misi tidak ditemukan.');
  if (m.diklaim) throw new Galat(409, 'Peti ini sudah dibuka.');
  if (m.nilai < m.target) throw new Galat(409, 'Misi belum tuntas.');
  const levelSebelum = infoLevel(s.xp).level;
  hariIni(s).klaim.push(m.id);
  tambahXp(s, m.hadiah);
  db.simpan();
  return { xp: m.hadiah, naikLevel: infoLevel(s.xp).level > levelSebelum, status: status(s) };
});

on('GET', /^\/api\/peringkat$/, (req) => {
  const s = siswaDari(req);
  const t = tanggalJakarta();
  const minggu = hariMinggu(t);
  const kelas = s.kelasId ? D.kelas.find((k) => k.id === s.kelasId) : null;
  return {
    kelas: kelas ? kelas.nama : null,
    awal: minggu[0],
    akhir: minggu[6],
    sisaHari: 7 - minggu.indexOf(t),
    baris: peringkat(s),
  };
});

on('POST', /^\/api\/laporan$/, (req, b) => {
  const s = siswaDari(req);
  D.laporan.push({
    id: randomUUID(),
    soalId: teks(b.soalId, 1, 40, 'Soal'),
    siswaId: s.id,
    alasan: typeof b.alasan === 'string' ? b.alasan.slice(0, 200) : '',
    waktu: new Date().toISOString(),
    status: 'antre',
  });
  db.simpan();
  return { ok: true };
});

on('POST', /^\/api\/cerita$/, (req, b) => {
  const s = siswaDari(req);
  const menunggu = D.cerita.filter((c) => c.siswaId === s.id && c.status === 'menunggu').length;
  if (menunggu >= 3) throw new Galat(429, 'Tunggu sampai ceritamu yang lain selesai dimoderasi.');
  D.cerita.push({
    id: randomUUID(),
    siswaId: s.id,
    kelasId: s.kelasId,
    judul: teks(b.judul, 3, 60, 'Judul'),
    isi: teks(b.isi, 20, 1200, 'Cerita'),
    waktu: new Date().toISOString(),
    status: 'menunggu',
  });
  db.simpan();
  return status(s);
});

on('GET', /^\/api\/cerita$/, (req) => {
  const s = siswaDari(req);
  return D.cerita
    .filter((c) => c.status === 'disetujui' && (!s.kelasId || c.kelasId === s.kelasId))
    .slice(-20)
    .reverse()
    .map((c) => ({
      id: c.id,
      judul: c.judul,
      isi: c.isi,
      waktu: c.waktu,
      nama: D.siswa.find((x) => x.id === c.siswaId)?.nama ?? 'Siswa',
    }));
});

// ---------- Guru ----------

function kelasGuru(req: IncomingMessage) {
  batasi(req, 'guru', 30);
  const k = String(req.headers['x-kode-guru'] ?? '').trim().toUpperCase();
  const kelas = D.kelas.find((x) => x.kodeGuru === k);
  if (!kelas) throw new Galat(401, 'Kode guru tidak ditemukan.');
  return kelas;
}

on('POST', /^\/api\/guru\/kelas$/, (_req, b) => {
  const nama = teks(b.nama, 2, 40, 'Nama kelas');
  const kelas = {
    id: randomUUID(),
    nama,
    kode: kodeUnik(6, (k) => D.kelas.some((x) => x.kode === k)),
    kodeGuru: kodeUnik(8, (k) => D.kelas.some((x) => x.kodeGuru === k)),
    dibuat: new Date().toISOString(),
  };
  D.kelas.push(kelas);
  db.simpan();
  return { nama: kelas.nama, kode: kelas.kode, kodeGuru: kelas.kodeGuru };
});

on('GET', /^\/api\/guru\/ringkasan$/, (req) => {
  const kelas = kelasGuru(req);
  const bagian = konten.bagian.map((b) => ({ id: b.id, judul: b.judul, kisah: b.kisah }));
  return {
    kelas: { nama: kelas.nama, kode: kelas.kode },
    bagian,
    siswa: anggotaKelas(kelas.id)
      .map((x) => ({
        nama: x.nama,
        xp: x.xp,
        xpMinggu: xpMinggu(x),
        streak: streakEfektif(x),
        bagianSelesai: bagian.filter((b) => x.kisahSelesai.includes(b.kisah)).length,
        pelajaranSelesai: Object.keys(x.progres).length,
        akurasi: x.akurasi.total ? Math.round((x.akurasi.benar / x.akurasi.total) * 100) : null,
        terakhirAktif: x.streak.terakhir,
      }))
      .sort((a, b) => b.xpMinggu - a.xpMinggu),
    cerita: D.cerita
      .filter((c) => c.kelasId === kelas.id && c.status === 'menunggu')
      .map((c) => ({
        id: c.id,
        judul: c.judul,
        isi: c.isi,
        waktu: c.waktu,
        nama: D.siswa.find((x) => x.id === c.siswaId)?.nama ?? 'Siswa',
      })),
  };
});

on('POST', /^\/api\/guru\/cerita\/([\w-]+)$/, (req, b, [id]) => {
  const kelas = kelasGuru(req);
  const c = D.cerita.find((x) => x.id === id && x.kelasId === kelas.id);
  if (!c) throw new Galat(404, 'Cerita tidak ditemukan.');
  if (b.status !== 'disetujui' && b.status !== 'ditolak') throw new Galat(400, 'Status tidak dikenal.');
  c.status = b.status;
  db.simpan();
  return { ok: true };
});

// ---------- Berkas statis ----------

const DIST = join(AKAR, 'dist');
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
};

function statis(req: IncomingMessage, res: ServerResponse, path: string) {
  let berkas = normalize(join(DIST, decodeURIComponent(path)));
  if (!berkas.startsWith(DIST)) return kirim(res, 400, { galat: 'Alamat tidak valid.' });
  if (!existsSync(berkas) || statSync(berkas).isDirectory()) berkas = join(DIST, 'index.html');
  if (!existsSync(berkas)) {
    res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('Aplikasi belum di-build. Jalankan: npm run build');
  }
  const ext = extname(berkas);
  res.writeHead(200, {
    'content-type': MIME[ext] ?? 'application/octet-stream',
    'cache-control': path.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  if (req.method === 'HEAD') return res.end();
  createReadStream(berkas).pipe(res);
}

// ---------- Server ----------

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) {
      const r = rute.find((x) => x.metode === req.method && x.pola.test(url.pathname));
      if (!r) throw new Galat(404, 'Alamat API tidak dikenal.');
      const param = url.pathname.match(r.pola)!.slice(1);
      const body = req.method === 'POST' ? await bacaBody(req) : {};
      return kirim(res, 200, await r.f(req, body, param));
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') throw new Galat(405, 'Metode tidak didukung.');
    return statis(req, res, url.pathname);
  } catch (e) {
    if (e instanceof Galat) return kirim(res, e.status, { galat: e.message });
    console.error(e);
    return kirim(res, 500, { galat: 'Terjadi kesalahan di server.' });
  }
});

server.listen(PORT, () => {
  console.log(`Gameloka berjalan di http://localhost:${PORT}`);
  console.log(
    IZINKAN_DRAF
      ? 'Mode draf AKTIF: konten tanpa validasi LKB ikut ditampilkan (bertanda draf).'
      : 'Mode draf MATI: hanya konten tervalidasi yang ditampilkan.',
  );
});

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => {
    db.tutup();
    process.exit(0);
  });
}
