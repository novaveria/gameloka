// Penyimpanan sederhana berbasis satu berkas JSON. Cukup untuk prototype dan demo satu sekolah.
// Penulisan atomik (tulis ke berkas sementara lalu rename) supaya data tidak rusak kalau server mati di tengah jalan.
import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Harian } from '../shared/tipe.ts';

export interface Siswa {
  id: string;
  token: string;
  kodeMasuk: string;
  nama: string;
  alasan: string;
  targetHarian: number;
  kelasId: string | null;
  bergabung: string;
  xp: number;
  harian: Record<string, Harian>;
  progres: Record<string, { bintang: number; kali: number }>;
  akurasi: { benar: number; total: number };
  kisahSelesai: string[];
  pustakaSelesai: string[];
  kartu: string[];
  lencana: string[];
  streak: { jumlah: number; terakhir: string | null };
  hariAktif: string[];
}

export interface Kelas {
  id: string;
  nama: string;
  kode: string;
  kodeGuru: string;
  dibuat: string;
}

export interface Laporan {
  id: string;
  soalId: string;
  siswaId: string;
  alasan: string;
  waktu: string;
  status: 'antre' | 'ditinjau';
}

export interface Cerita {
  id: string;
  siswaId: string;
  kelasId: string | null;
  judul: string;
  isi: string;
  waktu: string;
  status: 'menunggu' | 'disetujui' | 'ditolak';
}

export interface Data {
  versi: 1;
  siswa: Siswa[];
  kelas: Kelas[];
  laporan: Laporan[];
  cerita: Cerita[];
}

export function bukaDb(path: string) {
  let data: Data = { versi: 1, siswa: [], kelas: [], laporan: [], cerita: [] };
  if (existsSync(path)) {
    data = { ...data, ...JSON.parse(readFileSync(path, 'utf8')) };
  } else {
    mkdirSync(dirname(path), { recursive: true });
  }

  let timer: NodeJS.Timeout | null = null;
  function tulis() {
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, JSON.stringify(data));
    renameSync(tmp, path);
  }
  function simpan() {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      tulis();
    }, 150);
  }
  function tutup() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    tulis();
  }
  return { data, simpan, tutup };
}
