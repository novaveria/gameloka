// Lima tipe soal (DESIGN.md 8.4). Dipakai bersama oleh pelajaran dan Arena.
import { useEffect, useMemo, useState } from 'react';
import type { Soal, SoalDengar, SoalPantun, SoalPasangan, SoalPilihArti, SoalSusun } from '../../shared/tipe.ts';
import { acak } from '../lib/jalur.ts';
import { putar } from '../lib/audio.ts';
import { Ikon } from './Ikon.tsx';
import { Maskot, type Ekspresi } from './Maskot.tsx';

export type Jawaban = string | string[] | { salah: number };
export type Hasil = 'benar' | 'salah' | null;

interface Props<S extends Soal> {
  soal: S;
  hasil: Hasil;
  onJawab: (j: Jawaban | null) => void;
  sintetis: boolean;
}

const normal = (s: string) => s.toLowerCase().replace(/[.,!?;:"]/g, '').replace(/\s+/g, ' ').trim();

export function instruksi(soal: Soal): string {
  switch (soal.tipe) {
    case 'susun':
      return 'Terjemahkan kalimat ini';
    case 'pilih_arti':
      return 'Pilih arti yang tepat';
    case 'dengar':
      return 'Pilih yang kamu dengar';
    case 'pantun':
      return 'Lengkapi pantun ini';
    case 'pasangan':
      return 'Cocokkan pasangannya';
  }
}

export function periksa(soal: Soal, j: Jawaban): { benar: boolean; kunci: string } {
  switch (soal.tipe) {
    case 'susun':
      return { benar: normal((j as string[]).join(' ')) === normal(soal.jawaban.join(' ')), kunci: soal.jawaban.join(' ') };
    case 'pasangan':
      return { benar: (j as { salah: number }).salah <= 1, kunci: soal.pasangan.map(([a, b]) => `${a} = ${b}`).join(', ') };
    default:
      return { benar: normal(j as string) === normal(soal.jawaban), kunci: soal.jawaban };
  }
}

export function teksJawaban(j: Jawaban | null): string {
  if (j === null) return 'Tidak dijawab';
  if (Array.isArray(j)) return j.join(' ');
  if (typeof j === 'object') return j.salah ? `${j.salah} kali salah cocok` : 'Semua cocok';
  return j;
}

export function SoalView(p: Props<Soal>) {
  switch (p.soal.tipe) {
    case 'susun':
      return <Susun {...(p as Props<SoalSusun>)} />;
    case 'pilih_arti':
      return <PilihArti {...(p as Props<SoalPilihArti>)} />;
    case 'dengar':
      return <Dengar {...(p as Props<SoalDengar>)} />;
    case 'pantun':
      return <Pantun {...(p as Props<SoalPantun>)} />;
    case 'pasangan':
      return <Pasangan {...(p as Props<SoalPasangan>)} />;
  }
}

// ---------- Gelembung maskot ----------

function Gelembung({ teks, audio, ekspresi = 'senang', sintetis }: { teks: string; audio?: string | null; ekspresi?: Ekspresi; sintetis: boolean }) {
  const bisaPutar = audio !== undefined && (audio !== null || sintetis);
  return (
    <div className="gelembung-wadah">
      <Maskot ekspresi={ekspresi} ukuran={92} />
      <div className="gelembung">
        {bisaPutar && (
          <button type="button" className="tombol-audio tombol-audio--kecil" onClick={() => putar(teks, audio ?? null)} aria-label="Putar audio">
            <Ikon nama="audio" ukuran={22} />
          </button>
        )}
        <span className="gelembung__teks" lang="bew">
          {teks}
        </span>
      </div>
    </div>
  );
}

function TandaSintetis() {
  return <p className="tanda-sintetis">Suara sementara (sintetis). Rekaman penutur asli menyusul.</p>;
}

// ---------- 1. Susun kalimat ----------

function Susun({ soal, hasil, onJawab, sintetis }: Props<SoalSusun>) {
  const bank = useMemo(() => acak([...soal.jawaban, ...soal.pengecoh]), [soal]);
  const [pilih, setPilih] = useState<number[]>([]);
  const kunci = hasil !== null;

  function ketuk(i: number) {
    if (kunci) return;
    const baru = pilih.includes(i) ? pilih.filter((x) => x !== i) : [...pilih, i];
    setPilih(baru);
    onJawab(baru.length ? baru.map((x) => bank[x]) : null);
  }

  return (
    <>
      <Gelembung teks={soal.teks} audio={null} sintetis={sintetis} />
      <div className={`susun__jawaban${hasil === 'benar' ? ' memantul' : ''}`} aria-label="Jawabanmu" aria-live="polite">
        {pilih.map((i) => (
          <button key={i} type="button" className="ubin" onClick={() => ketuk(i)} disabled={kunci} aria-label={`${bank[i]}, ketuk untuk mengembalikan`}>
            {bank[i]}
          </button>
        ))}
      </div>
      <div className="susun__bank" aria-label="Bank kata">
        {bank.map((kata, i) =>
          pilih.includes(i) ? (
            <span key={i} className="ubin ubin--slot" aria-hidden="true">
              {kata}
            </span>
          ) : (
            <button key={i} type="button" className="ubin" onClick={() => ketuk(i)} disabled={kunci}>
              {kata}
            </button>
          ),
        )}
      </div>
    </>
  );
}

// ---------- Pilihan ganda bersama ----------

function DaftarPilihan({ pilihan, terpilih, hasil, jawaban, onPilih }: { pilihan: string[]; terpilih: string | null; hasil: Hasil; jawaban: string; onPilih: (s: string) => void }) {
  useEffect(() => {
    if (hasil) return;
    const f = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= pilihan.length && !(e.target instanceof HTMLInputElement)) onPilih(pilihan[n - 1]);
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [pilihan, hasil, onPilih]);
  return (
    <div className="daftar-pilihan" role="radiogroup" aria-label="Pilihan jawaban">
      {pilihan.map((p, i) => {
        const dipilih = terpilih === p;
        const kelas = hasil && dipilih ? (normal(p) === normal(jawaban) ? ' pilihan--benar memantul' : ' pilihan--salah') : '';
        return (
          <button key={p} type="button" role="radio" aria-checked={dipilih} className={`pilihan${kelas}`} onClick={() => onPilih(p)} disabled={hasil !== null}>
            <span className="pilihan__nomor" aria-hidden="true">
              {i + 1}
            </span>
            <span lang={undefined}>{p}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- 2. Pilih arti ----------

function PilihArti({ soal, hasil, onJawab, sintetis }: Props<SoalPilihArti>) {
  const pilihan = useMemo(() => acak(soal.pilihan), [soal]);
  const [terpilih, setTerpilih] = useState<string | null>(null);
  const pilih = (s: string) => {
    setTerpilih(s);
    onJawab(s);
  };
  return (
    <>
      <Gelembung teks={soal.kata} audio={null} sintetis={sintetis} ekspresi="netral" />
      <DaftarPilihan pilihan={pilihan} terpilih={terpilih} hasil={hasil} jawaban={soal.jawaban} onPilih={pilih} />
    </>
  );
}

// ---------- 3. Dengar dan pilih ----------

function Dengar({ soal, hasil, onJawab, sintetis }: Props<SoalDengar>) {
  const pilihan = useMemo(() => acak(soal.pilihan), [soal]);
  const [terpilih, setTerpilih] = useState<string | null>(null);
  useEffect(() => {
    const t = setTimeout(() => putar(soal.teks, soal.audio), 300);
    return () => clearTimeout(t);
  }, [soal]);
  const pilih = (s: string) => {
    setTerpilih(s);
    onJawab(s);
  };
  return (
    <>
      <div className="dengar">
        <button type="button" className="tombol-audio" onClick={() => putar(soal.teks, soal.audio)} aria-label="Putar audio">
          <Ikon nama="audio" ukuran={44} />
        </button>
        <button type="button" className="tombol-audio tombol-audio--pelan" onClick={() => putar(soal.teks, soal.audio, true)} aria-label="Putar pelan">
          <Ikon nama="pelan" ukuran={30} />
        </button>
      </div>
      {!soal.audio && sintetis && <TandaSintetis />}
      <DaftarPilihan pilihan={pilihan} terpilih={terpilih} hasil={hasil} jawaban={soal.jawaban} onPilih={pilih} />
    </>
  );
}

// ---------- 4. Lengkapi pantun ----------

function Pantun({ soal, hasil, onJawab }: Props<SoalPantun>) {
  const pilihan = useMemo(() => acak(soal.pilihan), [soal]);
  const [terpilih, setTerpilih] = useState<string | null>(null);
  const pilih = (s: string) => {
    if (hasil) return;
    setTerpilih(s);
    onJawab(s);
  };
  return (
    <>
      <div className="kartu kartu--krem pantun" lang="bew">
        {soal.baris.map((b, i) => {
          if (!b.includes('___')) return <p key={i}>{b}</p>;
          const [a, z] = b.split('___');
          return (
            <p key={i}>
              {a}
              <span className={`pantun__rumpang${terpilih ? ' pantun__rumpang--isi' : ''}`}>{terpilih ?? ' '}</span>
              {z}
            </p>
          );
        })}
      </div>
      <div className="susun__bank" role="radiogroup" aria-label="Pilihan kata">
        {pilihan.map((p) => (
          <button key={p} type="button" role="radio" aria-checked={terpilih === p} className="ubin" onClick={() => pilih(p)} disabled={hasil !== null}>
            {p}
          </button>
        ))}
      </div>
    </>
  );
}

// ---------- 5. Cocokkan pasangan ----------

function Pasangan({ soal, hasil, onJawab }: Props<SoalPasangan>) {
  const kiri = useMemo(() => acak(soal.pasangan.map((p) => p[0])), [soal]);
  const kanan = useMemo(() => acak(soal.pasangan.map((p) => p[1])), [soal]);
  const [pilihKiri, setPilihKiri] = useState<string | null>(null);
  const [pilihKanan, setPilihKanan] = useState<string | null>(null);
  const [cocok, setCocok] = useState<string[]>([]);
  const [keliru, setKeliru] = useState<string[]>([]);
  const [salah, setSalah] = useState(0);

  useEffect(() => {
    if (!pilihKiri || !pilihKanan) return;
    const pas = soal.pasangan.some(([a, b]) => a === pilihKiri && b === pilihKanan);
    if (pas) {
      const baru = [...cocok, pilihKiri];
      setCocok(baru);
      if (baru.length === soal.pasangan.length) onJawab({ salah });
      setPilihKiri(null);
      setPilihKanan(null);
    } else {
      setSalah((n) => n + 1);
      setKeliru([pilihKiri, pilihKanan]);
      const t = setTimeout(() => {
        setKeliru([]);
        setPilihKiri(null);
        setPilihKanan(null);
      }, 450);
      return () => clearTimeout(t);
    }
  }, [pilihKiri, pilihKanan]); // eslint-disable-line react-hooks/exhaustive-deps

  const pasanganDari = (b: string) => soal.pasangan.find((p) => p[1] === b)?.[0] ?? '';
  const ubin = (teks: string, sisi: 'kiri' | 'kanan') => {
    const selesai = sisi === 'kiri' ? cocok.includes(teks) : cocok.includes(pasanganDari(teks));
    const dipilih = sisi === 'kiri' ? pilihKiri === teks : pilihKanan === teks;
    const kelas = selesai ? ' ubin--selesai' : keliru.includes(teks) ? ' ubin--keliru' : '';
    return (
      <button
        key={teks}
        type="button"
        className={`ubin pasangan__ubin${kelas}`}
        aria-pressed={dipilih && !keliru.length}
        disabled={selesai || hasil !== null || keliru.length > 0}
        onClick={() => (sisi === 'kiri' ? setPilihKiri(dipilih ? null : teks) : setPilihKanan(dipilih ? null : teks))}
        lang={sisi === 'kiri' ? 'bew' : 'id'}
      >
        {teks}
      </button>
    );
  };
  return (
    <div className="pasangan">
      <div className="pasangan__kolom" aria-label="Kata Betawi">
        {kiri.map((t) => ubin(t, 'kiri'))}
      </div>
      <div className="pasangan__kolom" aria-label="Arti bahasa Indonesia">
        {kanan.map((t) => ubin(t, 'kanan'))}
      </div>
    </div>
  );
}
