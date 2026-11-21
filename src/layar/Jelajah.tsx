// Jelajah: Peta Budaya dan Pustaka (DESIGN.md 8.10).
import { useMemo, useState } from 'react';
import { Kerangka } from '../komponen/Kerangka.tsx';
import { Ikon } from '../komponen/Ikon.tsx';
import { IlustrasiBudaya } from '../komponen/Ilustrasi.tsx';
import { useSiswa } from '../lib/store.tsx';
import { statusLokasi } from '../lib/jalur.ts';
import { pergi } from '../lib/rute.ts';
import { XP } from '../../shared/aturan.ts';
import type { Bagian } from '../../shared/tipe.ts';

export function Jelajah({ tab }: { tab: 'peta' | 'pustaka' }) {
  return (
    <Kerangka tab="jelajah">
      <h1 className="sr-only">Jelajah</h1>
      <div className="segmen" role="tablist" aria-label="Bagian Jelajah">
        <a role="tab" aria-selected={tab === 'peta'} href="#/jelajah" className="segmen__item">
          Peta Budaya
        </a>
        <a role="tab" aria-selected={tab === 'pustaka'} href="#/jelajah/pustaka" className="segmen__item">
          Pustaka
        </a>
      </div>
      {tab === 'peta' ? <PetaBudaya /> : <Pustaka />}
    </Kerangka>
  );
}

// Posisi relatif tiga lokasi di peta ilustrasi (bukan peta skala).
const POSISI: Record<string, { x: number; y: number }> = {
  kemayoran: { x: 178, y: 118 },
  condet: { x: 236, y: 268 },
  'setu-babakan': { x: 150, y: 330 },
};

function PetaBudaya() {
  const { konten, status } = useSiswa();
  const [pilih, setPilih] = useState<string | null>(null);
  const selesai = konten.bagian.filter((b) => status.kisahSelesai.includes(b.kisah)).length;
  const b = konten.bagian.find((x) => x.id === pilih);

  return (
    <div className="peta-wadah">
      <section className="kartu misi-peta" aria-label="Misi jelajah">
        <Ikon nama="jelajah" ukuran={36} />
        <div className="misi-peta__isi">
          <p className="instruksi">
            Jelajahi Jakarta {selesai}/{konten.bagian.length}
          </p>
          <div className="progres progres--tipis" role="progressbar" aria-valuemin={0} aria-valuemax={konten.bagian.length} aria-valuenow={selesai} aria-label="Lokasi selesai">
            <div className="progres__isi" style={{ width: `${(selesai / konten.bagian.length) * 100}%` }} />
          </div>
        </div>
      </section>

      <div className="peta">
        <svg viewBox="0 0 360 420" width="100%" role="img" aria-label="Peta ilustrasi Jakarta dengan lokasi budaya">
          <rect width="360" height="420" fill="#FAF3E0" />
          <path d="M0 0 H360 V54 C320 70 290 46 250 60 C210 74 180 52 140 64 C100 76 60 56 0 70 Z" fill="#85C1E9" />
          <path d="M0 0 H360 V36 C320 50 280 30 240 42 C200 54 160 34 120 46 C80 58 40 40 0 52 Z" fill="#5DADE2" />
          <text x="24" y="30" fill="#1A5A85" fontSize="14" fontWeight="800">Teluk Jakarta</text>
          <path d="M214 66 C204 120 230 160 214 210 C200 254 252 290 236 340 C226 372 244 400 238 420" stroke="#85C1E9" strokeWidth="8" fill="none" strokeLinecap="round" />
          <text x="248" y="190" fill="#1A5A85" fontSize="13" fontWeight="700">Ciliwung</text>
          <path d="M40 90 Q30 220 60 400 M320 90 Q340 240 300 400" stroke="#EFE3C2" strokeWidth="14" fill="none" />
          {konten.bagian.map((bag) => {
            const p = POSISI[bag.lokasi];
            if (!p) return null;
            const st = statusLokasi(konten, status, bag);
            const warna = st === 'selesai' ? '#F1C40F' : st === 'terbuka' ? '#16A085' : '#CFD4DA';
            return (
              <g key={bag.id}>
                <path d={`M${p.x} ${p.y + 4} c-14 -16 -20 -24 -20 -34 a20 20 0 0 1 40 0 c0 10 -6 18 -20 34z`} fill={warna} stroke="#2C3E50" strokeWidth="3" />
                {st === 'terkunci' ? (
                  <g transform={`translate(${p.x - 10} ${p.y - 40})`}>
                    <Ikon nama="gembok" ukuran={20} warna="#5D6D7E" />
                  </g>
                ) : st === 'selesai' ? (
                  <g transform={`translate(${p.x - 10} ${p.y - 40})`}>
                    <Ikon nama="centang" ukuran={20} warna="#2C3E50" />
                  </g>
                ) : (
                  <circle cx={p.x} cy={p.y - 30} r="7" fill="#FFFFFF" />
                )}
                <rect x={p.x - 52} y={p.y + 10} width="104" height="26" rx="13" fill="#FFFFFF" stroke="#2C3E50" strokeWidth="2" />
                <text x={p.x} y={p.y + 28} textAnchor="middle" fill="#2C3E50" fontSize="14" fontWeight="800">
                  {bag.namaLokasi}
                </text>
              </g>
            );
          })}
        </svg>
        {konten.bagian.map((bag) => {
          const p = POSISI[bag.lokasi];
          if (!p) return null;
          return (
            <button
              key={bag.id}
              type="button"
              className="peta__titik"
              style={{ left: `${(p.x / 360) * 100}%`, top: `${((p.y - 16) / 420) * 100}%` }}
              aria-label={`${bag.namaLokasi}: ${statusLokasi(konten, status, bag)}`}
              aria-pressed={pilih === bag.id}
              onClick={() => setPilih(pilih === bag.id ? null : bag.id)}
            />
          );
        })}
      </div>

      {b ? <KartuLokasi bagian={b} /> : <p className="teks-abu tengah">Ketuk penanda di peta untuk melihat kisah di lokasi itu.</p>}
    </div>
  );
}

function KartuLokasi({ bagian }: { bagian: Bagian }) {
  const { konten, status } = useSiswa();
  const st = statusLokasi(konten, status, bagian);
  const kisah = konten.kisah.find((k) => k.id === bagian.kisah);
  const pelajaranSisa = bagian.pelajaran.filter((p) => !status.progres[p.id]).length;
  return (
    <section className="kartu kartu-lokasi" aria-labelledby="judul-lokasi">
      <p className="label teks-abu">Bagian {bagian.nomor} · {bagian.judul}</p>
      <h2 id="judul-lokasi" className="judul-layar">
        {bagian.namaLokasi}
      </h2>
      {st === 'terkunci' && <p>Lokasi ini terbuka setelah kamu menyelesaikan bagian sebelumnya di jalur belajar.</p>}
      {st === 'terbuka' && kisah && pelajaranSisa > 0 && (
        <>
          <p>
            Kisah <strong>{kisah.judul}</strong> terbuka setelah {pelajaranSisa} pelajaran lagi di bagian ini.
          </p>
          <button type="button" className="tombol tombol--penuh" onClick={() => pergi('belajar')}>
            Lanjut belajar
          </button>
        </>
      )}
      {st === 'terbuka' && kisah && pelajaranSisa === 0 && <p>Kisah <strong>{kisah.judul}</strong> sudah terbuka.</p>}
      {st === 'selesai' && kisah && (
        <>
          <p>Kisah {kisah.judul} sudah kamu tamatkan.</p>
          <button type="button" className="tombol tombol--sekunder tombol--penuh" onClick={() => pergi('kisah', kisah.id)}>
            Main lagi
          </button>
        </>
      )}
      {st === 'terbuka' && kisah && pelajaranSisa === 0 && (
        <button type="button" className="tombol tombol--penuh" onClick={() => pergi('kisah', kisah.id)}>
          Mainkan kisah +{XP.kisah} XP
        </button>
      )}
    </section>
  );
}

const KATEGORI = ['Semua', 'Kesenian', 'Kuliner', 'Arsitektur', 'Tradisi'] as const;

function Pustaka() {
  const { konten, status } = useSiswa();
  const [kat, setKat] = useState<(typeof KATEGORI)[number]>('Semua');
  const [cari, setCari] = useState('');
  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return konten.pustaka.filter(
      (a) => (kat === 'Semua' || a.kategori === kat) && (!q || `${a.judul} ${a.ringkas} ${a.isi.join(' ')}`.toLowerCase().includes(q)),
    );
  }, [konten.pustaka, kat, cari]);

  return (
    <div className="pustaka">
      <div className="cari">
        <Ikon nama="cari" ukuran={22} warna="#5D6D7E" />
        <label className="sr-only" htmlFor="cari-pustaka">
          Cari artikel
        </label>
        <input id="cari-pustaka" className="cari__isian" type="search" placeholder="Cari artikel" value={cari} onChange={(e) => setCari(e.target.value)} />
      </div>
      <div className="cip-wadah" role="radiogroup" aria-label="Kategori">
        {KATEGORI.map((k) => (
          <button key={k} type="button" role="radio" aria-checked={kat === k} className="cip" onClick={() => setKat(k)}>
            {k}
          </button>
        ))}
      </div>
      {hasil.length === 0 && <p className="teks-abu tengah">Tidak ada artikel yang cocok.</p>}
      <ul className="daftar-artikel">
        {hasil.map((a) => {
          const sudah = status.pustakaSelesai.includes(a.id);
          return (
            <li key={a.id}>
              <a className="kartu artikel-kartu" href={`#/pustaka/${a.id}`}>
                <span className="artikel-kartu__gambar">
                  <IlustrasiBudaya nama={a.ilustrasi} ukuran={64} />
                </span>
                <span className="artikel-kartu__isi">
                  <span className="label artikel-kartu__kat">{a.kategori}</span>
                  <span className="artikel-kartu__judul">{a.judul}</span>
                  <span className="teks-abu">{a.ringkas}</span>
                </span>
                <span className={`artikel-kartu__xp${sudah ? ' artikel-kartu__xp--sudah' : ''}`}>
                  {sudah ? <Ikon nama="centang" ukuran={18} /> : <Ikon nama="xp" ukuran={18} />}
                  {sudah ? 'Selesai' : `+${XP.pustaka}`}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
