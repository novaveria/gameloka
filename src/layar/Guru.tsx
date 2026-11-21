// Dasbor guru (DESIGN.md 11, opsional untuk prototype): buat kelas, lihat progres siswa, moderasi Cerita Kami.
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.ts';
import { Ikon } from '../komponen/Ikon.tsx';
import { toast } from '../komponen/Toast.tsx';

interface Ringkasan {
  kelas: { nama: string; kode: string };
  bagian: { id: string; judul: string }[];
  siswa: {
    nama: string;
    xp: number;
    xpMinggu: number;
    streak: number;
    bagianSelesai: number;
    pelajaranSelesai: number;
    akurasi: number | null;
    terakhirAktif: string | null;
  }[];
  cerita: { id: string; judul: string; isi: string; nama: string; waktu: string }[];
}

const KUNCI = 'gameloka.kodeGuru';
const baca = () => {
  try {
    return localStorage.getItem(KUNCI) ?? '';
  } catch {
    return '';
  }
};

export function Guru() {
  const [kodeGuru, setKodeGuru] = useState(baca);
  const [data, setData] = useState<Ringkasan | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [isian, setIsian] = useState('');
  const [namaKelas, setNamaKelas] = useState('');
  const [baru, setBaru] = useState<{ nama: string; kode: string; kodeGuru: string } | null>(null);

  const muat = useCallback(async (kode: string) => {
    setGalat(null);
    try {
      const r = await api<Ringkasan>('/api/guru/ringkasan', undefined, { kodeGuru: kode });
      setData(r);
      try {
        localStorage.setItem(KUNCI, kode);
      } catch {
        /* abaikan */
      }
    } catch (e) {
      setGalat(e instanceof Error ? e.message : 'Gagal memuat.');
      setData(null);
    }
  }, []);

  useEffect(() => {
    if (kodeGuru) muat(kodeGuru);
  }, [kodeGuru, muat]);

  async function buatKelas() {
    try {
      const r = await api<{ nama: string; kode: string; kodeGuru: string }>('/api/guru/kelas', { nama: namaKelas });
      setBaru(r);
    } catch (e) {
      setGalat(e instanceof Error ? e.message : 'Gagal membuat kelas.');
    }
  }

  async function moderasi(id: string, status: 'disetujui' | 'ditolak') {
    try {
      await api(`/api/guru/cerita/${id}`, { status }, { kodeGuru });
      toast(status === 'disetujui' ? 'Cerita ditampilkan untuk kelas.' : 'Cerita tidak ditampilkan.');
      muat(kodeGuru);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal menyimpan.');
    }
  }

  function keluar() {
    try {
      localStorage.removeItem(KUNCI);
    } catch {
      /* abaikan */
    }
    setKodeGuru('');
    setData(null);
  }

  return (
    <div className="guru">
      <header className="guru__kepala">
        <a href="#/" className="logo logo--kecil">
          gameloka
        </a>
        <span className="label teks-abu">Dasbor guru</span>
      </header>

      {!data && (
        <div className="guru__masuk">
          <section className="kartu kartu--isi" aria-labelledby="judul-masuk-guru">
            <h1 id="judul-masuk-guru" className="judul-layar">
              Buka dasbor kelas
            </h1>
            <form
              className="form-baris"
              onSubmit={(e) => {
                e.preventDefault();
                setKodeGuru(isian);
              }}
            >
              <label htmlFor="kode-guru" className="form-label">
                Kode guru
              </label>
              <input id="kode-guru" className="isian isian--kode" value={isian} onChange={(e) => setIsian(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} maxLength={8} autoComplete="off" aria-invalid={!!galat} aria-describedby={galat ? 'galat-guru' : undefined} />
              <button type="submit" className="tombol tombol--penuh" disabled={isian.length < 8}>
                Buka dasbor
              </button>
            </form>
            {galat && (
              <p id="galat-guru" className="galat">
                {galat}
              </p>
            )}
          </section>

          <section className="kartu kartu--isi" aria-labelledby="judul-buat-kelas">
            <h2 id="judul-buat-kelas" className="instruksi">
              Belum punya kelas?
            </h2>
            {baru ? (
              <div className="kelas-baru">
                <p>
                  Kelas <strong>{baru.nama}</strong> dibuat.
                </p>
                <p className="form-label">Kode kelas, bagikan ke siswa</p>
                <p className="kode-masuk">{baru.kode}</p>
                <p className="form-label">Kode guru, simpan sendiri</p>
                <p className="kode-masuk kode-masuk--rahasia">{baru.kodeGuru}</p>
                <p className="teks-abu">Kode guru membuka data siswa. Jangan dibagikan.</p>
                <button type="button" className="tombol tombol--penuh" onClick={() => setKodeGuru(baru.kodeGuru)}>
                  Buka dasbor kelas ini
                </button>
              </div>
            ) : (
              <form
                className="form-baris"
                onSubmit={(e) => {
                  e.preventDefault();
                  buatKelas();
                }}
              >
                <label htmlFor="nama-kelas" className="form-label">
                  Nama kelas
                </label>
                <input id="nama-kelas" className="isian" value={namaKelas} onChange={(e) => setNamaKelas(e.target.value)} maxLength={40} placeholder="Contoh: 7A SMPN 1" />
                <button type="submit" className="tombol tombol--merek tombol--penuh" disabled={namaKelas.trim().length < 2}>
                  Buat kelas
                </button>
              </form>
            )}
          </section>
        </div>
      )}

      {data && (
        <main className="guru__isi">
          <div className="guru__judul">
            <div>
              <h1 className="judul-layar">{data.kelas.nama}</h1>
              <p className="teks-abu">
                Kode kelas untuk siswa: <strong>{data.kelas.kode}</strong> · {data.siswa.length} siswa
              </p>
            </div>
            <div className="guru__aksi">
              <button type="button" className="tombol tombol--sekunder" onClick={() => muat(kodeGuru)}>
                Muat ulang
              </button>
              <button type="button" className="tautan" onClick={keluar}>
                Tutup dasbor
              </button>
            </div>
          </div>

          {data.siswa.length === 0 ? (
            <p className="kartu kartu--isi">Belum ada siswa. Minta siswa memasukkan kode {data.kelas.kode} saat mendaftar.</p>
          ) : (
            <div className="tabel-wadah kartu">
              <table className="tabel">
                <thead>
                  <tr>
                    <th scope="col">Nama</th>
                    <th scope="col">XP minggu ini</th>
                    <th scope="col">Bagian selesai</th>
                    <th scope="col">Pelajaran</th>
                    <th scope="col">Akurasi</th>
                    <th scope="col">Streak</th>
                    <th scope="col">Terakhir aktif</th>
                  </tr>
                </thead>
                <tbody>
                  {data.siswa.map((s, i) => (
                    <tr key={i}>
                      <th scope="row">{s.nama}</th>
                      <td>{s.xpMinggu}</td>
                      <td>
                        {s.bagianSelesai}/{data.bagian.length}
                      </td>
                      <td>{s.pelajaranSelesai}</td>
                      <td>{s.akurasi === null ? '–' : `${s.akurasi}%`}</td>
                      <td>{s.streak}</td>
                      <td>{s.terakhirAktif ?? 'Belum'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <section aria-labelledby="judul-moderasi" className="guru__moderasi">
            <h2 id="judul-moderasi" className="instruksi">
              Cerita Kami menunggu moderasi · {data.cerita.length}
            </h2>
            {data.cerita.length === 0 && <p className="teks-abu">Tidak ada cerita yang menunggu.</p>}
            {data.cerita.map((c) => (
              <article key={c.id} className="kartu kartu--isi moderasi">
                <h3 className="cerita-publik__judul">{c.judul}</h3>
                <p className="teks-abu">oleh {c.nama}</p>
                <p className="cerita-publik__isi">{c.isi}</p>
                <div className="moderasi__aksi">
                  <button type="button" className="tombol" onClick={() => moderasi(c.id, 'disetujui')}>
                    <Ikon nama="centang" ukuran={18} /> Tampilkan
                  </button>
                  <button type="button" className="tombol tombol--sekunder" onClick={() => moderasi(c.id, 'ditolak')}>
                    Tolak
                  </button>
                </div>
              </article>
            ))}
          </section>
        </main>
      )}
    </div>
  );
}
