// Peringkat kelas mingguan (DESIGN.md 8.9). Reset setiap Senin (waktu Jakarta).
import { useEffect, useState } from 'react';
import { Kerangka } from '../komponen/Kerangka.tsx';
import { Ikon } from '../komponen/Ikon.tsx';
import { Avatar } from '../komponen/Avatar.tsx';
import { Maskot } from '../komponen/Maskot.tsx';
import { toast } from '../komponen/Toast.tsx';
import { useSiswa } from '../lib/store.tsx';
import { api } from '../lib/api.ts';
import type { BarisPeringkat, StatusSiswa } from '../../shared/tipe.ts';

interface Data {
  kelas: string | null;
  awal: string;
  akhir: string;
  sisaHari: number;
  baris: BarisPeringkat[];
}

export function Peringkat() {
  const { status } = useSiswa();
  const [data, setData] = useState<Data | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  useEffect(() => {
    api<Data>('/api/peringkat').then(setData).catch((e) => setGalat(e.message));
  }, [status.kelas?.kode, status.xp]);

  return (
    <Kerangka tab="peringkat">
      <div className="peringkat">
        <header className="peringkat__kepala">
          <Ikon nama="peringkat" ukuran={56} />
          <div>
            <h1 className="judul-layar">{status.kelas ? `Peringkat ${status.kelas.nama}` : 'Peringkat kelas'}</h1>
            {data && (
              <p className="teks-abu">
                Minggu ini · reset {data.sisaHari === 1 ? 'besok' : `dalam ${data.sisaHari} hari`}
              </p>
            )}
          </div>
        </header>
        {galat && <p className="galat">{galat}</p>}
        {!status.kelas && <GabungKelas />}
        {data && status.kelas && (
          <ol className="daftar-peringkat">
            {data.baris.map((b, i) => (
              <li key={b.id} className={`baris-peringkat${b.saya ? ' baris-peringkat--saya' : ''}${i < 3 ? ` baris-peringkat--${['emas', 'perak', 'perunggu'][i]}` : ''}`}>
                <span className="baris-peringkat__no" aria-label={`Peringkat ${i + 1}`}>
                  {i + 1}
                </span>
                <Avatar nama={b.nama} ukuran={44} />
                <span className="baris-peringkat__nama">
                  {b.nama}
                  {b.saya && <span className="sr-only"> (kamu)</span>}
                </span>
                <span className="baris-peringkat__xp">{b.xp} XP</span>
              </li>
            ))}
          </ol>
        )}
        {data && status.kelas && data.baris.length === 1 && (
          <p className="teks-abu peringkat__sepi">Baru kamu yang bergabung. Bagikan kode kelas {status.kelas.kode} ke teman sekelas.</p>
        )}
      </div>
    </Kerangka>
  );
}

export function GabungKelas() {
  const { setStatus } = useSiswa();
  const [kode, setKode] = useState('');
  const [galat, setGalat] = useState<string | null>(null);
  const [kirim, setKirim] = useState(false);
  async function gabung() {
    setGalat(null);
    setKirim(true);
    try {
      const s = await api<StatusSiswa>('/api/pengaturan', { kodeKelas: kode });
      setStatus(s);
      toast(`Kamu bergabung dengan ${s.kelas?.nama}.`);
    } catch (e) {
      setGalat(e instanceof Error ? e.message : 'Gagal bergabung.');
    } finally {
      setKirim(false);
    }
  }
  return (
    <section className="kartu gabung-kelas" aria-labelledby="judul-gabung">
      <Maskot ekspresi="netral" ukuran={80} />
      <h2 id="judul-gabung" className="instruksi">
        Kamu sedang belajar mandiri
      </h2>
      <p className="teks-abu">Masukkan kode kelas dari gurumu untuk bersaing dengan teman sekelas.</p>
      <form
        className="gabung-kelas__form"
        onSubmit={(e) => {
          e.preventDefault();
          if (kode.length >= 4) gabung();
        }}
      >
        <label className="sr-only" htmlFor="gabung-kode">
          Kode kelas
        </label>
        <input
          id="gabung-kode"
          className="isian isian--kode"
          value={kode}
          onChange={(e) => setKode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          maxLength={6}
          placeholder="Kode kelas"
          autoComplete="off"
          aria-invalid={!!galat}
          aria-describedby={galat ? 'galat-gabung' : undefined}
        />
        <button type="submit" className="tombol tombol--penuh" disabled={kode.length < 4 || kirim}>
          Gabung kelas
        </button>
      </form>
      {galat && (
        <p id="galat-gabung" className="galat">
          {galat}
        </p>
      )}
    </section>
  );
}
