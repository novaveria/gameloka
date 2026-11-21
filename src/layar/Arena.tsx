// Arena Jawara: kuis cepat dengan mode BERTARUNG (10 detik per soal) dan LATIHAN (DESIGN.md 8.8).
import { useEffect, useRef, useState } from 'react';
import { Kerangka } from '../komponen/Kerangka.tsx';
import { Ikon } from '../komponen/Ikon.tsx';
import { Maskot } from '../komponen/Maskot.tsx';
import { SoalView, instruksi, periksa, teksJawaban, type Hasil, type Jawaban } from '../komponen/Soal.tsx';
import { KonfirmasiKeluar, PanelUmpanBalik } from '../komponen/UmpanBalik.tsx';
import { useSiswa } from '../lib/store.tsx';
import { soalArena } from '../lib/jalur.ts';
import { bisaSintetis } from '../lib/audio.ts';
import { api } from '../lib/api.ts';
import { pergi } from '../lib/rute.ts';
import { LayarNaikLevel, soalLayak, type Catatan } from './Pelajaran.tsx';
import { BATAS_CEPAT_MS, DETIK_ARENA, XP } from '../../shared/aturan.ts';
import type { Soal, StatusSiswa } from '../../shared/tipe.ts';

type Mode = 'bertarung' | 'latihan';

interface HasilArena {
  naikLevel: boolean;
  xp: number;
  benar: number;
  total: number;
  posisiSebelum: number;
  posisiSesudah: number;
  jumlahKelas: number;
}

export function Arena() {
  const [main, setMain] = useState<Mode | null>(null);
  const [putaran, setPutaran] = useState(0);
  if (main) return <Pertandingan key={putaran} mode={main} onUlang={() => setPutaran((n) => n + 1)} onSelesai={() => setMain(null)} />;
  return (
    <Kerangka tab="arena" barStatus>
      <div className="arena-mulai">
        <div className="arena-banner">
          <div className="arena-banner__teks">
            <p className="label">Arena Jawara</p>
            <h1 className="judul-layar">Kuis cepat 10 soal</h1>
          </div>
          <Maskot ekspresi="semangat" ukuran={92} />
        </div>
        <section className="kartu arena-aturan" aria-labelledby="aturan">
          <h2 id="aturan" className="instruksi">
            Aturan main
          </h2>
          <ul>
            <li>
              <Ikon nama="xp" ukuran={22} /> {XP.arenaBenar} XP untuk setiap jawaban benar.
            </li>
            <li>
              <Ikon nama="jam" ukuran={22} /> Mode Bertarung: {DETIK_ARENA} detik per soal, bonus +{XP.arenaCepat} XP kalau dijawab dalam {BATAS_CEPAT_MS / 1000} detik.
            </li>
            <li>
              <Ikon nama="buku" ukuran={22} warna="#1F6FA3" /> Mode Latihan: tanpa timer, tanpa bonus.
            </li>
            <li>
              <Ikon nama="peringkat" ukuran={22} /> XP Arena masuk ke peringkat kelas minggu ini.
            </li>
          </ul>
        </section>
        <div className="arena-tombol">
          <button type="button" className="tombol tombol--merek tombol--penuh" onClick={() => setMain('bertarung')}>
            Bertarung
          </button>
          <button type="button" className="tombol tombol--sekunder tombol--penuh" onClick={() => setMain('latihan')}>
            Latihan
          </button>
        </div>
      </div>
    </Kerangka>
  );
}

function Pertandingan({ mode, onSelesai, onUlang }: { mode: Mode; onSelesai: () => void; onUlang: () => void }) {
  const { konten, status, setStatus } = useSiswa();
  const sintetis = konten.adaDraf && bisaSintetis();
  const [soal] = useState<Soal[]>(() => soalLayak(soalArena(konten, status, 14), sintetis).slice(0, 10));
  const [i, setI] = useState(0);
  const [jawaban, setJawaban] = useState<Jawaban | null>(null);
  const [hasil, setHasil] = useState<Hasil>(null);
  const [kunci, setKunci] = useState('');
  const [catatan, setCatatan] = useState<(Catatan & { ms: number })[]>([]);
  const [sisa, setSisa] = useState(DETIK_ARENA * 1000);
  const [keluar, setKeluar] = useState(false);
  const [akhir, setAkhir] = useState<HasilArena | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [levelDilihat, setLevelDilihat] = useState(false);
  const mulaiSoal = useRef(Date.now());

  const s = soal[i];

  function cek(j: Jawaban | null, habis = false) {
    if (!s || hasil) return;
    const ms = Date.now() - mulaiSoal.current;
    const r = j === null ? { benar: false, kunci: periksa(s, s.tipe === 'pasangan' ? { salah: 99 } : '').kunci } : periksa(s, j);
    setHasil(r.benar ? 'benar' : 'salah');
    setKunci(r.kunci);
    setCatatan((c) => [...c, { soal: s, jawaban: habis ? 'Waktu habis' : teksJawaban(j), kunci: r.kunci, benar: r.benar, ms }]);
  }

  useEffect(() => {
    if (mode !== 'bertarung' || hasil || keluar || akhir) return;
    const t = setInterval(() => {
      const sisaMs = DETIK_ARENA * 1000 - (Date.now() - mulaiSoal.current);
      setSisa(Math.max(0, sisaMs));
      if (sisaMs <= 0) cek(null, true);
    }, 100);
    return () => clearInterval(t);
  });

  async function selesai() {
    try {
      const r = await api<HasilArena & { status: StatusSiswa }>('/api/arena/selesai', {
        mode,
        jawaban: catatan.map((c) => ({ benar: c.benar, ms: c.ms })),
      });
      setStatus(r.status);
      setAkhir(r);
    } catch (e) {
      setGalat(e instanceof Error ? e.message : 'Gagal menyimpan skor.');
    }
  }

  function lanjut() {
    if (i + 1 >= soal.length) {
      selesai();
      return;
    }
    setI(i + 1);
    setJawaban(null);
    setHasil(null);
    setSisa(DETIK_ARENA * 1000);
    mulaiSoal.current = Date.now();
  }

  if (galat) {
    return (
      <div className="layar tengah" style={{ justifyContent: 'center', gap: 16 }}>
        <Maskot ekspresi="cemas" />
        <p className="instruksi">{galat}</p>
        <button type="button" className="tombol" onClick={() => { setGalat(null); selesai(); }}>
          Coba kirim lagi
        </button>
      </div>
    );
  }

  if (akhir && akhir.naikLevel && !levelDilihat) return <LayarNaikLevel status={status} onLanjut={() => setLevelDilihat(true)} />;

  if (akhir) {
    const salah = catatan.filter((c) => !c.benar);
    const naik = akhir.posisiSesudah < akhir.posisiSebelum;
    const turun = akhir.posisiSesudah > akhir.posisiSebelum;
    return (
      <div className="layar">
        <div className="layar__isi tengah hasil">
          <Maskot ekspresi={akhir.benar >= 8 ? 'bangga' : akhir.benar >= 5 ? 'senang' : 'semangat'} ukuran={120} />
          <h1 className="judul-layar">
            Skor {akhir.benar}/{akhir.total}
          </h1>
          <div className="statistik statistik--dua">
            <div className="statistik__kotak statistik__kotak--xp">
              <p className="statistik__label">XP didapat</p>
              <p className="statistik__nilai">
                <Ikon nama="xp" ukuran={22} /> {akhir.xp}
              </p>
            </div>
            <div className="statistik__kotak statistik__kotak--waktu">
              <p className="statistik__label">Peringkat kelas</p>
              <p className="statistik__nilai">
                <Ikon nama={naik ? 'naik' : turun ? 'turun' : 'sama'} ukuran={22} /> #{akhir.posisiSesudah}
              </p>
            </div>
          </div>
          <p className="teks-abu">
            {status.kelas
              ? naik
                ? `Naik dari #${akhir.posisiSebelum} ke #${akhir.posisiSesudah} dari ${akhir.jumlahKelas} siswa.`
                : `Posisimu #${akhir.posisiSesudah} dari ${akhir.jumlahKelas} siswa.`
              : 'Masukkan kode kelas di Profil supaya skormu masuk peringkat kelas.'}
          </p>
          {salah.length > 0 && (
            <section className="arena-salah" aria-labelledby="judul-salah">
              <h2 id="judul-salah" className="instruksi">
                Soal yang salah
              </h2>
              <ol className="tinjau">
                {salah.map((c) => (
                  <li key={c.soal.id} className="tinjau__item tinjau__item--salah">
                    <span className="tinjau__ikon" aria-label="Salah">
                      <Ikon nama="silang" ukuran={18} warna="#FFFFFF" />
                    </span>
                    <div>
                      <p className="tinjau__soal">{c.soal.tipe === 'pilih_arti' ? c.soal.kata : c.soal.tipe === 'dengar' ? `Dengar: ${c.soal.teks}` : instruksi(c.soal)}</p>
                      <p className="teks-abu">Jawabanmu: {c.jawaban}</p>
                      <p className="tinjau__kunci">Jawaban benar: {c.kunci}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
        <div className="layar__bawah arena-akhir">
          <button type="button" className="tombol tombol--sekunder" onClick={() => { onSelesai(); pergi('arena'); }}>
            Selesai
          </button>
          <button type="button" className="tombol" onClick={onUlang} autoFocus>
            Main lagi
          </button>
        </div>
      </div>
    );
  }

  if (!s) {
    return (
      <div className="layar tengah" style={{ justifyContent: 'center', gap: 16 }}>
        <Maskot ekspresi="kaget" />
        <p className="instruksi">Belum ada soal untuk Arena.</p>
        <button type="button" className="tombol" onClick={onSelesai}>
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="layar layar--soal">
      <div className="layar__atas">
        <button type="button" className="ikon-tombol" onClick={() => setKeluar(true)} aria-label="Keluar dari Arena">
          <Ikon nama="tutup" ukuran={26} />
        </button>
        <div className="progres" role="progressbar" aria-label="Kemajuan Arena" aria-valuemin={0} aria-valuemax={soal.length} aria-valuenow={i + (hasil ? 1 : 0)}>
          <div className="progres__isi" style={{ width: `${Math.max(((i + (hasil ? 1 : 0)) / soal.length) * 100, 4)}%` }} />
        </div>
        {mode === 'bertarung' && <Timer sisa={sisa} />}
      </div>
      <div className="layar__isi" key={i}>
        <h1 className="instruksi">{instruksi(s)}</h1>
        <SoalView soal={s} hasil={hasil} onJawab={setJawaban} sintetis={sintetis} />
      </div>
      <div className="layar__bawah">
        <button type="button" className="tombol tombol--penuh" disabled={jawaban === null} onClick={() => cek(jawaban)}>
          Periksa
        </button>
      </div>
      {hasil && (
        <PanelUmpanBalik
          benar={hasil === 'benar'}
          kunci={kunci}
          contoh={s.contoh}
          soalId={s.id}
          onLanjut={lanjut}
          judulSalah={catatan[catatan.length - 1]?.jawaban === 'Waktu habis' ? 'Waktu habis. Jawabannya:' : undefined}
        />
      )}
      {keluar && <KonfirmasiKeluar pesan="Skor Arena ini tidak akan disimpan." onTetap={() => setKeluar(false)} onKeluar={onSelesai} />}
    </div>
  );
}

function Timer({ sisa }: { sisa: number }) {
  const detik = Math.ceil(sisa / 1000);
  const r = 18;
  const k = 2 * Math.PI * r;
  const genting = detik <= 3;
  return (
    <div className="timer" role="timer" aria-label={`${detik} detik tersisa`}>
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#E5E7EB" strokeWidth="6" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={genting ? '#C0392B' : '#27AE60'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={k}
          strokeDashoffset={k * (1 - sisa / (DETIK_ARENA * 1000))}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <span className={genting ? 'teks-merah' : undefined}>{detik}</span>
    </div>
  );
}
