// Pembungkus fetch dengan token siswa, percobaan ulang, dan antrean offline.
import type { StatusSiswa } from '../../shared/tipe.ts';

const KUNCI_TOKEN = 'gameloka.token';
const KUNCI_ANTREAN = 'gameloka.antrean';

function baca(kunci: string): string | null {
  try {
    return localStorage.getItem(kunci);
  } catch {
    return null;
  }
}
function tulis(kunci: string, nilai: string | null) {
  try {
    if (nilai === null) localStorage.removeItem(kunci);
    else localStorage.setItem(kunci, nilai);
  } catch {
    /* penyimpanan diblokir: sesi tetap jalan sampai halaman ditutup */
  }
}

let tokenMemori: string | null = baca(KUNCI_TOKEN);
export const token = {
  ambil: () => tokenMemori,
  simpan: (t: string | null) => {
    tokenMemori = t;
    tulis(KUNCI_TOKEN, t);
  },
};

export class GalatApi extends Error {
  status: number;
  constructor(status: number, pesan: string) {
    super(pesan);
    this.status = status;
  }
}

export async function api<T>(path: string, body?: unknown, opsi: { kodeGuru?: string } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const t = token.ambil();
  if (t) headers.authorization = `Bearer ${t}`;
  if (opsi.kodeGuru) headers['x-kode-guru'] = opsi.kodeGuru;
  if (body !== undefined) headers['content-type'] = 'application/json';
  let galatTerakhir: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(path, {
        method: body === undefined ? 'GET' : 'POST',
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new GalatApi(res.status, (data as { galat?: string }).galat ?? 'Terjadi kesalahan.');
      return data as T;
    } catch (e) {
      if (e instanceof GalatApi) throw e;
      galatTerakhir = e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw new GalatApi(0, galatTerakhir ? 'Koneksi terputus. Periksa internetmu.' : 'Terjadi kesalahan.');
}

// ---------- Antrean offline ----------
// Hasil pelajaran yang gagal terkirim disimpan dulu, lalu dikirim ulang saat koneksi kembali.

interface Tertunda {
  path: string;
  body: unknown;
}

export function antrekan(path: string, body: unknown) {
  const isi: Tertunda[] = JSON.parse(baca(KUNCI_ANTREAN) ?? '[]');
  isi.push({ path, body });
  tulis(KUNCI_ANTREAN, JSON.stringify(isi.slice(-20)));
}

export function jumlahTertunda(): number {
  try {
    return (JSON.parse(baca(KUNCI_ANTREAN) ?? '[]') as Tertunda[]).length;
  } catch {
    return 0;
  }
}

export async function kirimTertunda(): Promise<StatusSiswa | null> {
  let isi: Tertunda[];
  try {
    isi = JSON.parse(baca(KUNCI_ANTREAN) ?? '[]');
  } catch {
    isi = [];
  }
  if (!isi.length || !token.ambil()) return null;
  let status: StatusSiswa | null = null;
  const sisa: Tertunda[] = [];
  for (const t of isi) {
    try {
      const r = await api<{ status: StatusSiswa }>(t.path, t.body);
      status = r.status;
    } catch (e) {
      // Galat dari server (misalnya simpul belum terbuka) dibuang; galat koneksi disimpan lagi.
      if (e instanceof GalatApi && e.status === 0) sisa.push(t);
    }
  }
  tulis(KUNCI_ANTREAN, JSON.stringify(sisa));
  return status;
}
