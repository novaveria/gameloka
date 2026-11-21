// Onboarding lima langkah, satu pertanyaan per layar (DESIGN.md 8.1).
// Tidak meminta email, nomor telepon, umur, atau foto. Pengguna adalah anak di bawah umur.
import { useState, type ReactNode } from 'react';
import { useApp } from '../lib/store.tsx';
import { api, GalatApi, token } from '../lib/api.ts';
import { pergi } from '../lib/rute.ts';
import { Ikon, type NamaIkon } from '../komponen/Ikon.tsx';
import { Maskot } from '../komponen/Maskot.tsx';
import type { StatusSiswa } from '../../shared/tipe.ts';

const ALASAN: { id: string; teks: string; ikon: NamaIkon; warna?: string }[] = [
  { id: 'sekolah', teks: 'Tugas sekolah', ikon: 'pena', warna: '#C0392B' },
  { id: 'budaya', teks: 'Kenal budaya Jakarta', ikon: 'belajar' },
  { id: 'keluarga', teks: 'Ngobrol sama keluarga', ikon: 'profil' },
  { id: 'penasaran', teks: 'Penasaran aja', ikon: 'cari', warna: '#1F6FA3' },
];

const TARGET = [
  { xp: 10, nama: 'Santai', ket: 'Sekitar 1 pelajaran sehari' },
  { xp: 20, nama: 'Biasa', ket: 'Sekitar 2 pelajaran sehari' },
  { xp: 30, nama: 'Serius', ket: 'Sekitar 3 pelajaran sehari' },
];

export function Onboarding({ masuk = false }: { masuk?: boolean }) {
  const { setStatus } = useApp();
  const [langkah, setLangkah] = useState(0);
  const [alasan, setAlasan] = useState<string | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [nama, setNama] = useState('');
  const [kodeKelas, setKodeKelas] = useState('');
  const [galat, setGalat] = useState<string | null>(null);
  const [kirim, setKirim] = useState(false);
  const [baru, setBaru] = useState<StatusSiswa | null>(null);

  if (masuk) return <Masuk />;

  async function daftar(denganKode: boolean) {
    setGalat(null);
    setKirim(true);
    try {
      const r = await api<{ token: string; status: StatusSiswa }>('/api/daftar', {
        nama,
        alasan,
        targetHarian: target,
        kodeKelas: denganKode ? kodeKelas : null,
      });
      token.simpan(r.token);
      setBaru(r.status);
    } catch (e) {
      setGalat(e instanceof Error ? e.message : 'Gagal mendaftar.');
    } finally {
      setKirim(false);
    }
  }

  if (baru) {
    return (
      <Langkah
        progres={1}
        judul="Simpan kode masukmu"
        tombol={
          <button type="button" className="tombol tombol--penuh" onClick={() => setStatus(baru)} autoFocus>
            Mulai belajar
          </button>
        }
      >
        <div className="kode-masuk" aria-label={`Kode masuk ${baru.kodeMasuk.split('').join(' ')}`}>
          {baru.kodeMasuk}
        </div>
        <p>Pakai kode ini untuk membuka akunmu di HP atau komputer lain. XP dan streak-mu ikut pindah.</p>
        <p className="teks-abu">Catat di buku tulis. Kode ini juga ada di halaman Profil.</p>
      </Langkah>
    );
  }

  if (langkah === 0) {
    return (
      <div className="sambutan">
        <div className="sambutan__atas">
          <Maskot ekspresi="senang" ukuran={190} />
        </div>
        <div className="sambutan__bawah">
          <p className="sambutan__logo">gameloka</p>
          <h1 className="sambutan__ajakan">Belajar bahasa Betawi sambil keliling Jakarta.</h1>
          <div className="sambutan__tombol">
            <button type="button" className="tombol tombol--merek tombol--penuh" onClick={() => setLangkah(1)}>
              Mulai
            </button>
            <button type="button" className="tombol tombol--sekunder tombol--penuh" onClick={() => pergi('masuk')}>
              Sudah punya akun
            </button>
          </div>
          <a className="tautan sambutan__guru" href="#/guru">
            Untuk guru: dasbor kelas
          </a>
        </div>
      </div>
    );
  }

  const kembali = () => setLangkah(0);

  if (langkah === 1)
    return (
      <Langkah progres={0.2} judul="Kenapa kamu belajar bahasa Betawi?" onTutup={kembali} tombol={<Lanjut aktif={!!alasan} onKlik={() => setLangkah(2)} />}>
        <div className="daftar-pilihan" role="radiogroup" aria-label="Alasan belajar">
          {ALASAN.map((a) => (
            <button key={a.id} type="button" role="radio" aria-checked={alasan === a.id} className="pilihan pilihan--besar" onClick={() => setAlasan(a.id)}>
              <span className="pilihan__gambar">
                <Ikon nama={a.ikon} ukuran={32} warna={a.warna} />
              </span>
              {a.teks}
            </button>
          ))}
        </div>
      </Langkah>
    );

  if (langkah === 2)
    return (
      <Langkah progres={0.4} judul="Mau belajar berapa banyak per hari?" onTutup={kembali} tombol={<Lanjut aktif={!!target} onKlik={() => setLangkah(3)} />}>
        <div className="daftar-pilihan" role="radiogroup" aria-label="Target harian">
          {TARGET.map((t) => (
            <button key={t.xp} type="button" role="radio" aria-checked={target === t.xp} className="pilihan pilihan--besar" onClick={() => setTarget(t.xp)}>
              <span className="pilihan__gambar">
                <Ikon nama="xp" ukuran={30} />
              </span>
              <span className="pilihan__dua">
                <span>
                  {t.nama} · {t.xp} XP
                </span>
                <span className="teks-abu pilihan__ket">{t.ket}</span>
              </span>
            </button>
          ))}
        </div>
      </Langkah>
    );

  if (langkah === 3) {
    const sah = nama.trim().length >= 2;
    return (
      <Langkah progres={0.6} judul="Siapa nama panggilanmu?" onTutup={kembali} tombol={<Lanjut aktif={sah} onKlik={() => setLangkah(4)} />}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (sah) setLangkah(4);
          }}
        >
          <label className="sr-only" htmlFor="nama">
            Nama panggilan
          </label>
          <input id="nama" className="isian" value={nama} onChange={(e) => setNama(e.target.value)} maxLength={20} autoComplete="off" autoFocus placeholder="Nama panggilan" enterKeyHint="next" />
        </form>
        <p className="teks-abu">Cukup nama panggilan. Nama ini terlihat oleh teman sekelas di peringkat.</p>
      </Langkah>
    );
  }

  const sahKode = kodeKelas.trim().length >= 4;
  return (
    <Langkah
      progres={0.8}
      judul="Masukkan kode kelas dari gurumu"
      onTutup={kembali}
      tombol={
        <button type="button" className="tombol tombol--penuh" disabled={!sahKode || kirim} onClick={() => daftar(true)}>
          {kirim ? 'Menyimpan…' : 'Lanjut'}
        </button>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (sahKode) daftar(true);
        }}
      >
        <label className="sr-only" htmlFor="kode-kelas">
          Kode kelas
        </label>
        <input
          id="kode-kelas"
          className="isian isian--kode"
          value={kodeKelas}
          onChange={(e) => setKodeKelas(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          maxLength={6}
          autoComplete="off"
          autoCapitalize="characters"
          autoFocus
          placeholder="Contoh: K7M2QP"
          aria-invalid={!!galat}
          aria-describedby={galat ? 'galat-kode' : undefined}
        />
      </form>
      {galat && (
        <p id="galat-kode" className="galat">
          {galat}
        </p>
      )}
      <button type="button" className="tautan tautan--kiri" onClick={() => daftar(false)} disabled={kirim}>
        Belum punya kode? Belajar mandiri dulu
      </button>
    </Langkah>
  );
}

function Lanjut({ aktif, onKlik }: { aktif: boolean; onKlik: () => void }) {
  return (
    <button type="button" className="tombol tombol--penuh" disabled={!aktif} onClick={onKlik}>
      Lanjut
    </button>
  );
}

function Langkah({ progres, judul, onTutup, tombol, children }: { progres: number; judul: string; onTutup?: () => void; tombol: ReactNode; children: ReactNode }) {
  return (
    <div className="layar">
      <div className="layar__atas">
        {onTutup ? (
          <button type="button" className="ikon-tombol" onClick={onTutup} aria-label="Tutup">
            <Ikon nama="tutup" ukuran={26} />
          </button>
        ) : (
          <span style={{ width: 44 }} />
        )}
        <div className="progres" role="progressbar" aria-label="Langkah pendaftaran" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progres * 100)}>
          <div className="progres__isi" style={{ width: `${progres * 100}%` }} />
        </div>
      </div>
      <div className="layar__isi">
        <h1 className="judul-layar">{judul}</h1>
        {children}
      </div>
      <div className="layar__bawah">{tombol}</div>
    </div>
  );
}

function Masuk() {
  const { setStatus } = useApp();
  const [kode, setKode] = useState('');
  const [galat, setGalat] = useState<string | null>(null);
  const [kirim, setKirim] = useState(false);
  async function masuk() {
    setGalat(null);
    setKirim(true);
    try {
      const r = await api<{ token: string; status: StatusSiswa }>('/api/masuk', { kodeMasuk: kode });
      token.simpan(r.token);
      setStatus(r.status);
      pergi('belajar');
    } catch (e) {
      setGalat(e instanceof GalatApi ? e.message : 'Gagal masuk.');
      setKirim(false);
    }
  }
  const sah = kode.length === 6;
  return (
    <Langkah
      progres={0.5}
      judul="Masukkan kode masukmu"
      onTutup={() => pergi('')}
      tombol={
        <button type="button" className="tombol tombol--penuh" disabled={!sah || kirim} onClick={masuk}>
          {kirim ? 'Memeriksa…' : 'Masuk'}
        </button>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (sah) masuk();
        }}
      >
        <label className="sr-only" htmlFor="kode-masuk">
          Kode masuk
        </label>
        <input
          id="kode-masuk"
          className="isian isian--kode"
          value={kode}
          onChange={(e) => setKode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          maxLength={6}
          autoComplete="off"
          autoCapitalize="characters"
          autoFocus
          placeholder="6 huruf dan angka"
          aria-invalid={!!galat}
          aria-describedby={galat ? 'galat-masuk' : undefined}
        />
      </form>
      {galat && (
        <p id="galat-masuk" className="galat">
          {galat}
        </p>
      )}
      <p className="teks-abu">Kode masuk ada di halaman Profil di perangkat yang pertama kamu pakai.</p>
    </Langkah>
  );
}
