// Layar pelajaran → umpan balik per soal → layar hasil → layar streak → naik level (DESIGN.md 5, 8.4–8.7).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSiswa } from '../lib/store.tsx';
import { soalUlasan } from '../lib/jalur.ts';
import { bisaSintetis } from '../lib/audio.ts';
import { api, antrekan, GalatApi } from '../lib/api.ts';
import { pergi } from '../lib/rute.ts';
import { Ikon } from '../komponen/Ikon.tsx';
import { Maskot, type Ekspresi } from '../komponen/Maskot.tsx';
import { SoalView, instruksi, periksa, teksJawaban, type Hasil, type Jawaban } from '../komponen/Soal.tsx';
import { KonfirmasiKeluar, PanelUmpanBalik } from '../komponen/UmpanBalik.tsx';
import { XP, hitungBintang, hariMinggu, NAMA_HARI } from '../../shared/aturan.ts';
import type { Soal, StatusSiswa } from '../../shared/tipe.ts';

interface Butir {
  soal: Soal;
  ulang: boolean;
}

export interface Catatan {
  soal: Soal;
  jawaban: string;
  kunci: string;
  benar: boolean;
}

/** Soal yang bisa ditampilkan: soal dengar butuh rekaman, atau suara sintetis di mode draf. */
export function soalLayak(soal: Soal[], sintetis: boolean): Soal[] {
  return soal.filter((s) => s.tipe !== 'dengar' || s.audio || sintetis);
}

export function Pelajaran({ id }: { id: string }) {
  const { konten, status, setStatus } = useSiswa();
  const bagian = konten.bagian.find((b) => b.pelajaran.some((p) => p.id === id));
  const pel = bagian?.pelajaran.find((p) => p.id === id);
  const sintetis = konten.adaDraf && bisaSintetis();

  const awal = useMemo<Butir[]>(() => {
    if (!pel || !bagian) return [];
    const daftar = pel.jenis === 'ulasan' ? soalUlasan(bagian) : pel.soal;
    return soalLayak(daftar, sintetis).map((soal) => ({ soal, ulang: false }));
  }, [pel, bagian, sintetis]);

  const [antrean, setAntrean] = useState<Butir[]>(awal);
  const [i, setI] = useState(0);
  const [jawaban, setJawaban] = useState<Jawaban | null>(null);
  const [hasil, setHasil] = useState<Hasil>(null);
  const [kunci, setKunci] = useState('');
  const [kombo, setKombo] = useState(0);
  const [benarPertama, setBenarPertama] = useState(0);
  const [catatan, setCatatan] = useState<Catatan[]>([]);
  const [keluar, setKeluar] = useState(false);
  const [akhir, setAkhir] = useState<null | { xp: number; bintang: number; sempurna: boolean; streakBaru: boolean; naikLevel: boolean; tertunda: boolean; detik: number }>(null);
  const [langkah, setLangkah] = useState<'hasil' | 'streak' | 'level'>('hasil');
  const [mengirim, setMengirim] = useState(false);
  const mulai = useRef(Date.now());

  const butir = antrean[i];
  const totalAwal = awal.length;

  const cek = useCallback(() => {
    if (!butir || jawaban === null || hasil) return;
    const r = periksa(butir.soal, jawaban);
    setHasil(r.benar ? 'benar' : 'salah');
    setKunci(r.kunci);
    setCatatan((c) => [...c, { soal: butir.soal, jawaban: teksJawaban(jawaban), kunci: r.kunci, benar: r.benar }]);
    if (r.benar) {
      setKombo((k) => k + 1);
      if (!butir.ulang) setBenarPertama((n) => n + 1);
    } else {
      setKombo(0);
      // Soal yang salah diulang sekali di akhir pelajaran.
      if (!butir.ulang) setAntrean((a) => [...a, { soal: butir.soal, ulang: true }]);
    }
  }, [butir, jawaban, hasil]);

  async function selesai() {
    if (!pel) return;
    setMengirim(true);
    const detik = Math.round((Date.now() - mulai.current) / 1000);
    const body = { pelajaranId: pel.id, benar: benarPertama, total: totalAwal };
    try {
      const r = await api<{ xp: number; bintang: number; sempurna: boolean; streakBaru: boolean; naikLevel: boolean; status: StatusSiswa }>('/api/pelajaran/selesai', body);
      setStatus(r.status);
      setAkhir({ ...r, tertunda: false, detik });
    } catch (e) {
      if (e instanceof GalatApi && e.status === 0) {
        antrekan('/api/pelajaran/selesai', body);
        const sempurna = benarPertama === totalAwal;
        setAkhir({ xp: XP.pelajaran + (sempurna ? XP.pelajaranSempurna : 0), bintang: hitungBintang(benarPertama, totalAwal), sempurna, streakBaru: false, naikLevel: false, tertunda: true, detik });
      } else {
        alert(e instanceof Error ? e.message : 'Gagal menyimpan hasil.');
        pergi('belajar');
      }
    } finally {
      setMengirim(false);
    }
  }

  function lanjut() {
    if (i + 1 >= antrean.length) {
      selesai();
      return;
    }
    setI(i + 1);
    setJawaban(null);
    setHasil(null);
  }

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || akhir || keluar) return;
      if (e.target instanceof HTMLButtonElement) return;
      if (hasil) lanjut();
      else cek();
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  });

  if (!pel || !bagian || !awal.length) {
    return (
      <div className="layar tengah" style={{ justifyContent: 'center', gap: 16 }}>
        <Maskot ekspresi="kaget" />
        <p className="instruksi">Pelajaran ini belum tersedia.</p>
        <button type="button" className="tombol" onClick={() => pergi('belajar')}>
          Kembali ke jalur
        </button>
      </div>
    );
  }

  if (akhir) {
    const keJalur = () => pergi('belajar');
    if (langkah === 'hasil')
      return (
        <LayarHasil
          judul={pel.jenis === 'ulasan' ? 'Ulasan selesai!' : 'Pelajaran selesai!'}
          xp={akhir.xp}
          akurasi={Math.round((benarPertama / totalAwal) * 100)}
          detik={akhir.detik}
          bintang={akhir.bintang}
          catatan={catatan}
          tertunda={akhir.tertunda}
          onLanjut={() => (akhir.streakBaru ? setLangkah('streak') : akhir.naikLevel ? setLangkah('level') : keJalur())}
        />
      );
    if (langkah === 'streak') return <LayarStreak status={status} onLanjut={() => (akhir.naikLevel ? setLangkah('level') : keJalur())} />;
    return <LayarNaikLevel status={status} onLanjut={keJalur} />;
  }

  const progres = (i + (hasil ? 1 : 0)) / antrean.length;

  return (
    <div className="layar layar--soal">
      <div className="layar__atas">
        <button type="button" className="ikon-tombol" onClick={() => setKeluar(true)} aria-label="Keluar dari pelajaran">
          <Ikon nama="tutup" ukuran={26} />
        </button>
        <div className="progres-wadah">
          {kombo >= 3 && (
            <span className="kombo" key={kombo}>
              <Ikon nama="api" ukuran={16} /> {kombo} berturut-turut
            </span>
          )}
          <div className="progres" role="progressbar" aria-label="Kemajuan pelajaran" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progres * 100)}>
            <div className="progres__isi" style={{ width: `${Math.max(progres * 100, 4)}%` }} />
          </div>
        </div>
      </div>

      <div className="layar__isi" key={`${i}-${butir.soal.id}`}>
        {butir.ulang && <p className="label soal__ulang">Ulangi soal yang tadi salah</p>}
        <h1 className="instruksi">{instruksi(butir.soal)}</h1>
        <SoalView soal={butir.soal} hasil={hasil} onJawab={setJawaban} sintetis={sintetis} />
      </div>

      <div className="layar__bawah">
        <button type="button" className="tombol tombol--penuh" disabled={jawaban === null || mengirim} onClick={cek}>
          Periksa
        </button>
      </div>

      {hasil && <PanelUmpanBalik benar={hasil === 'benar'} kunci={kunci} contoh={butir.soal.contoh} soalId={butir.soal.id} onLanjut={lanjut} />}
      {keluar && (
        <KonfirmasiKeluar
          pesan="Kemajuan di pelajaran ini belum tersimpan. Kamu harus mengulang dari awal."
          onTetap={() => setKeluar(false)}
          onKeluar={() => pergi('belajar')}
        />
      )}
    </div>
  );
}

// ---------- Layar hasil ----------

export function LayarHasil({
  judul, xp, akurasi, detik, bintang, catatan, tertunda, onLanjut,
}: {
  judul: string;
  xp: number;
  akurasi: number;
  detik: number;
  bintang?: number;
  catatan: Catatan[];
  tertunda?: boolean;
  onLanjut: () => void;
}) {
  const [tinjau, setTinjau] = useState(false);
  const ekspresi: Ekspresi = akurasi >= 90 ? 'bangga' : akurasi >= 60 ? 'senang' : 'semangat';
  const waktu = `${Math.floor(detik / 60)}:${String(detik % 60).padStart(2, '0')}`;
  const unik = useMemo(() => {
    // Satu baris per soal; kalau diulang, tampilkan hasil percobaan pertama.
    const lihat = new Set<string>();
    return catatan.filter((c) => (lihat.has(c.soal.id) ? false : (lihat.add(c.soal.id), true)));
  }, [catatan]);

  return (
    <div className="layar">
      <div className="layar__isi tengah hasil">
        <div className="hasil__maskot">
          <Maskot ekspresi={ekspresi} ukuran={140} />
        </div>
        <h1 className="judul-layar">{judul}</h1>
        {bintang !== undefined && (
          <div className="hasil__bintang" aria-label={`${bintang} dari 3 bintang`}>
            {[1, 2, 3].map((n) => (
              <span key={n} className="hasil__bintang-satu" style={{ animationDelay: `${n * 140}ms` }}>
                <Ikon nama="bintang" ukuran={44} warna={n <= bintang ? undefined : '#D5D8DC'} />
              </span>
            ))}
          </div>
        )}
        <div className="statistik">
          <div className="statistik__kotak statistik__kotak--xp">
            <p className="statistik__label">Total XP</p>
            <p className="statistik__nilai">
              <Ikon nama="xp" ukuran={22} /> {xp}
            </p>
          </div>
          <div className="statistik__kotak statistik__kotak--akurasi">
            <p className="statistik__label">Akurasi</p>
            <p className="statistik__nilai">
              <Ikon nama="target" ukuran={22} /> {akurasi}%
            </p>
          </div>
          <div className="statistik__kotak statistik__kotak--waktu">
            <p className="statistik__label">Waktu</p>
            <p className="statistik__nilai">
              <Ikon nama="jam" ukuran={22} /> {waktu}
            </p>
          </div>
        </div>
        {tertunda && <p className="catatan-draf">Koneksi terputus. Hasil ini disimpan di perangkat dan dikirim otomatis saat online.</p>}

        <button type="button" className="tautan" aria-expanded={tinjau} onClick={() => setTinjau(!tinjau)}>
          {tinjau ? 'Tutup tinjauan' : 'Tinjau jawaban'}
        </button>
        {tinjau && (
          <ol className="tinjau">
            {unik.map((c) => (
              <li key={c.soal.id} className={`tinjau__item tinjau__item--${c.benar ? 'benar' : 'salah'}`}>
                <span className="tinjau__ikon" aria-label={c.benar ? 'Benar' : 'Salah'}>
                  <Ikon nama={c.benar ? 'centang' : 'silang'} ukuran={18} warna="#FFFFFF" />
                </span>
                <div>
                  <p className="tinjau__soal">{ringkasSoal(c.soal)}</p>
                  <p className="teks-abu">Jawabanmu: {c.jawaban}</p>
                  {!c.benar && <p className="tinjau__kunci">Jawaban benar: {c.kunci}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="layar__bawah">
        <button type="button" className="tombol tombol--penuh" onClick={onLanjut} autoFocus>
          Lanjut
        </button>
      </div>
    </div>
  );
}

function ringkasSoal(s: Soal): string {
  switch (s.tipe) {
    case 'susun':
      return s.teks;
    case 'pilih_arti':
      return s.kata;
    case 'dengar':
      return `Dengar: ${s.teks}`;
    case 'pantun':
      return s.baris.find((b) => b.includes('___')) ?? 'Pantun';
    case 'pasangan':
      return 'Cocokkan pasangan';
  }
}

// ---------- Layar streak ----------

export function LayarStreak({ status, onLanjut }: { status: StatusSiswa; onLanjut: () => void }) {
  const minggu = hariMinggu(status.hariIni);
  const aktif = new Set(status.hariAktif);
  const n = status.streak;
  return (
    <div className="layar">
      <div className="layar__isi tengah layar-streak">
        <div className="layar-streak__api">
          <Ikon nama="api" ukuran={150} />
          <span className="layar-streak__angka">{n}</span>
        </div>
        <h1 className="judul-layar">{n} hari berturut-turut!</h1>
        <ol className="pekan" aria-label="Hari aktif minggu ini">
          {minggu.map((d, i) => (
            <li key={d} className={`pekan__hari${d === status.hariIni ? ' pekan__hari--ini' : ''}`}>
              <span className="pekan__nama">{NAMA_HARI[i]}</span>
              <span className={`pekan__titik${aktif.has(d) ? ' pekan__titik--aktif' : ''}`} aria-label={aktif.has(d) ? 'Aktif' : 'Belum aktif'}>
                {aktif.has(d) && <Ikon nama="centang" ukuran={18} warna="#FFFFFF" />}
              </span>
            </li>
          ))}
        </ol>
        <p className="teks-abu layar-streak__pesan">
          {n <= 1
            ? 'Hari pertama sudah tercatat. Belajar lagi besok supaya apinya tetap menyala.'
            : `Kamu belajar ${n} hari tanpa putus. Satu pelajaran besok sudah cukup untuk menjaganya.`}
        </p>
      </div>
      <div className="layar__bawah">
        <button type="button" className="tombol tombol--penuh" onClick={onLanjut} autoFocus>
          Lanjut
        </button>
      </div>
    </div>
  );
}

// ---------- Naik level ----------

export function LayarNaikLevel({ status, onLanjut }: { status: StatusSiswa; onLanjut: () => void }) {
  return (
    <div className="layar-gradien">
      <div className="layar">
        <div className="layar__isi tengah naik-level">
          <div className="kartu naik-level__kartu">
            <div className="naik-level__lencana">
              <Ikon nama="lencana" ukuran={96} />
            </div>
            <p className="label teks-abu">Naik level</p>
            <h1 className="judul-layar">
              Level {status.level.level} · {status.level.nama}
            </h1>
            <Maskot ekspresi="bangga" ukuran={110} level={status.level.level} />
            <p className="teks-abu">Avatarmu mendapat aksesori baru. Lihat di Profil.</p>
          </div>
        </div>
        <div className="layar__bawah layar__bawah--transparan">
          <button type="button" className="tombol tombol--penuh tombol--sekunder" onClick={onLanjut} autoFocus>
            Lanjut
          </button>
        </div>
      </div>
    </div>
  );
}

