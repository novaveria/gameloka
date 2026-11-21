// Tab Belajar: jalur vertikal berkelok yang dibagi per bagian, setiap bagian berlatar satu lokasi (DESIGN.md 8.3).
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Kerangka } from '../komponen/Kerangka.tsx';
import { Ikon, type NamaIkon } from '../komponen/Ikon.tsx';
import { Maskot } from '../komponen/Maskot.tsx';
import { Awan, Gedung, Menara, Pohon, PohonSalak, RumahKebaya } from '../komponen/Ilustrasi.tsx';
import { useSiswa } from '../lib/store.tsx';
import { WARNA_BAGIAN, daftarSimpul, statusSimpul, type Simpul, type StatusSimpul } from '../lib/jalur.ts';
import { pergi } from '../lib/rute.ts';
import { XP } from '../../shared/aturan.ts';
import type { Bagian, Lokasi } from '../../shared/tipe.ts';

const GESER = [0, 52, 84, 52, 0, -52, -84, -52];
const JARAK = 116;

export function Belajar() {
  const { konten, status } = useSiswa();
  const simpul = daftarSimpul(konten);
  const st = statusSimpul(konten, status);
  const [terbuka, setTerbuka] = useState<string | null>(null);
  const sekarangRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    sekarangRef.current?.scrollIntoView({ block: 'center' });
  }, []);

  useEffect(() => {
    if (!terbuka) return;
    const tutup = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) {
        if (e.key === 'Escape') setTerbuka(null);
        return;
      }
      const el = e.target as HTMLElement;
      if (!el.closest('.simpul, .sembulan')) setTerbuka(null);
    };
    document.addEventListener('mousedown', tutup);
    document.addEventListener('keydown', tutup);
    return () => {
      document.removeEventListener('mousedown', tutup);
      document.removeEventListener('keydown', tutup);
    };
  }, [terbuka]);

  const semuaSelesai = simpul.length > 0 && simpul.every((s) => st.get(s.id) === 'selesai');

  if (!konten.bagian.length) {
    return (
      <Kerangka tab="belajar" barStatus>
        <div className="kartu jalur-tamat tengah">
          <Maskot ekspresi="netral" ukuran={96} />
          <h1 className="instruksi">Pelajaran sedang divalidasi</h1>
          <p className="teks-abu">Kosakata baru tampil setelah disetujui Lembaga Kebudayaan Betawi.</p>
        </div>
      </Kerangka>
    );
  }

  return (
    <Kerangka tab="belajar" barStatus>
      <h1 className="sr-only">Jalur belajar</h1>
      {konten.bagian.map((b) => (
        <BagianJalur
          key={b.id}
          bagian={b}
          simpul={simpul.filter((s) => s.bagian.id === b.id)}
          st={st}
          terbuka={terbuka}
          setTerbuka={setTerbuka}
          sekarangRef={sekarangRef}
        />
      ))}
      {semuaSelesai && (
        <div className="kartu jalur-tamat tengah">
          <Maskot ekspresi="bangga" ukuran={96} />
          <p className="instruksi">Semua bagian sudah kamu tamatkan.</p>
          <p className="teks-abu">Ulangi simpul untuk menambah bintang, atau main di Arena.</p>
        </div>
      )}
    </Kerangka>
  );
}

function BagianJalur({
  bagian, simpul, st, terbuka, setTerbuka, sekarangRef,
}: {
  bagian: Bagian;
  simpul: Simpul[];
  st: Map<string, StatusSimpul>;
  terbuka: string | null;
  setTerbuka: (id: string | null) => void;
  sekarangRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { status } = useSiswa();
  const w = WARNA_BAGIAN[bagian.warna];
  const tinggi = simpul.length * JARAK + 40;
  const selesai = simpul.filter((s) => st.get(s.id) === 'selesai').length;
  const iSekarang = simpul.findIndex((s) => st.get(s.id) === 'sekarang');

  // Titik pusat setiap simpul, dalam persen lebar (x) dan px (y), untuk menggambar jalan setapak.
  const titik = simpul.map((_, i) => ({ dx: GESER[i % GESER.length], y: 56 + i * JARAK }));

  return (
    <section className={`bagian bagian--${bagian.lokasi}`} aria-labelledby={`judul-${bagian.id}`} style={{ '--isi': w.isi, '--tepi': w.tepi, '--muda': w.muda, '--warna-teks': w.teks } as CSSProperties}>
      <header className="bagian__banner">
        <div>
          <p className="label bagian__sub">
            Bagian {bagian.nomor} · {bagian.namaLokasi}
          </p>
          <h2 id={`judul-${bagian.id}`} className="bagian__judul">
            {bagian.judul}
          </h2>
        </div>
        <span className="bagian__hitung" aria-label={`${selesai} dari ${simpul.length} selesai`}>
          {selesai}/{simpul.length}
        </span>
      </header>

      <div className="jalur" style={{ height: tinggi }}>
        <svg className="jalur__setapak" width="100%" height={tinggi} aria-hidden="true">
          <Setapak titik={titik} />
        </svg>
        <Properti lokasi={bagian.lokasi} jumlah={simpul.length} hindari={iSekarang} />

        {simpul.map((s, i) => {
          const status_ = st.get(s.id) ?? 'terkunci';
          const dx = titik[i].dx;
          return (
            <div key={s.id} className={`jalur__baris${terbuka === s.id ? ' jalur__baris--buka' : ''}`} style={{ top: titik[i].y - 40, '--dx': `${dx}px` } as CSSProperties}>
              {status_ === 'sekarang' && (
                <span className="simpul__mulai label" aria-hidden="true">
                  Mulai
                </span>
              )}
              <TombolSimpul
                simpul={s}
                status={status_}
                bintang={status.progres[s.id]?.bintang ?? 0}
                dibuka={terbuka === s.id}
                onKlik={() => setTerbuka(terbuka === s.id ? null : s.id)}
                refSekarang={status_ === 'sekarang' ? sekarangRef : undefined}
              />
              {terbuka === s.id && <Sembulan simpul={s} status={status_} urutan={i + 1} total={simpul.length} />}
            </div>
          );
        })}

        {iSekarang >= 0 && (
          <div className="jalur__maskot" style={{ top: titik[iSekarang].y - 70, '--sisi': titik[iSekarang].dx > 0 ? -1 : 1 } as CSSProperties} aria-hidden="true">
            <Maskot ekspresi="senang" ukuran={84} level={status.level.level} />
          </div>
        )}
      </div>
    </section>
  );
}

function Setapak({ titik }: { titik: { dx: number; y: number }[] }) {
  if (titik.length < 2) return null;
  // x memakai calc 50% + dx; SVG tidak bisa calc di atribut path, jadi digambar per ruas dengan <line>-kurva lewat transform.
  return (
    <g>
      {titik.slice(1).map((t, i) => {
        const a = titik[i];
        return (
          <svg key={i} x="50%" overflow="visible">
            <path
              d={`M${a.dx} ${a.y} C${a.dx} ${a.y + JARAK / 2} ${t.dx} ${t.y - JARAK / 2} ${t.dx} ${t.y}`}
              stroke="var(--jalan)"
              strokeWidth="46"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        );
      })}
    </g>
  );
}

const IKON_SIMPUL: Record<string, NamaIkon> = { bintang: 'bintang', audio: 'audio', buku: 'buku', pena: 'pena' };

function TombolSimpul({
  simpul, status, bintang, dibuka, onKlik, refSekarang,
}: {
  simpul: Simpul;
  status: StatusSimpul;
  bintang: number;
  dibuka: boolean;
  onKlik: () => void;
  refSekarang?: React.RefObject<HTMLButtonElement | null>;
}) {
  const kisah = simpul.jenis === 'kisah';
  const ikon: NamaIkon =
    status === 'terkunci' ? (kisah ? 'peti' : 'gembok') : kisah ? (status === 'selesai' ? 'peti-buka' : 'peti') : IKON_SIMPUL[simpul.pelajaran?.ikon ?? 'bintang'];
  const warnaIkon = status === 'terkunci' ? '#A6ACAF' : status === 'selesai' ? '#7D5A00' : '#FFFFFF';
  const label = `${kisah ? 'Kisah' : simpul.jenis === 'ulasan' ? 'Ulasan' : 'Pelajaran'}: ${simpul.judul}. ${
    status === 'selesai' ? `Selesai, ${bintang} bintang` : status === 'sekarang' ? 'Berikutnya' : 'Terkunci'
  }`;
  return (
    <div className="simpul-wadah">
      <button
        ref={refSekarang}
        type="button"
        className={`simpul simpul--${status}${kisah ? ' simpul--kisah' : ''}`}
        aria-label={label}
        aria-expanded={dibuka}
        onClick={onKlik}
      >
        <Ikon nama={ikon} ukuran={kisah ? 40 : 34} warna={kisah && status !== 'terkunci' ? undefined : warnaIkon} style={kisah && status === 'terkunci' ? { filter: 'grayscale(1)', opacity: 0.6 } : undefined} />
      </button>
      {status === 'selesai' && !kisah && (
        <span className="simpul__bintang" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <Ikon key={n} nama="bintang" ukuran={18} warna={n <= bintang ? undefined : '#D5D8DC'} />
          ))}
        </span>
      )}
    </div>
  );
}

function Sembulan({ simpul, status, urutan, total }: { simpul: Simpul; status: StatusSimpul; urutan: number; total: number }) {
  const kisah = simpul.jenis === 'kisah';
  const ke = () => pergi(kisah ? 'kisah' : 'pelajaran', simpul.id);
  let isi: ReactNode;
  if (status === 'terkunci') {
    isi = (
      <>
        <p className="sembulan__judul">{simpul.judul}</p>
        <p>Selesaikan simpul sebelumnya untuk membuka ini.</p>
      </>
    );
  } else if (kisah) {
    isi = (
      <>
        <p className="sembulan__judul">Kisah · {simpul.judul}</p>
        <p>{status === 'selesai' ? 'Kisah ini sudah kamu tamatkan. Main lagi kapan saja.' : `Jelajahi ${simpul.bagian.namaLokasi} dan dapatkan kartu koleksi.`}</p>
        <button type="button" className="tombol tombol--penuh sembulan__tombol" onClick={ke}>
          {status === 'selesai' ? 'Main lagi' : `Mainkan +${XP.kisah} XP`}
        </button>
      </>
    );
  } else {
    isi = (
      <>
        <p className="sembulan__judul">{simpul.judul}</p>
        <p>
          {simpul.jenis === 'ulasan' ? 'Latihan ulang' : 'Pelajaran'} · langkah {urutan} dari {total} di bagian ini
        </p>
        <button type="button" className="tombol tombol--penuh sembulan__tombol" onClick={ke}>
          {status === 'selesai' ? `Ulangi +${XP.pelajaran} XP` : `Mulai +${XP.pelajaran} XP`}
        </button>
      </>
    );
  }
  return (
    <div className={`sembulan${status === 'terkunci' ? ' sembulan--terkunci' : ''}`} role="dialog" aria-label={simpul.judul}>
      {isi}
    </div>
  );
}

function Properti({ lokasi, jumlah, hindari }: { lokasi: Lokasi; jumlah: number; hindari: number }) {
  const hasil: ReactNode[] = [];
  for (let i = 0; i < jumlah; i++) {
    const g = GESER[i % GESER.length];
    if (Math.abs(g) < 80 || i === hindari) continue;
    const kiri = g > 0;
    const y = 30 + i * JARAK;
    hasil.push(
      <svg key={i} className="properti" style={{ top: y, [kiri ? 'left' : 'right']: 0 }} width="110" height="100" viewBox="-55 -60 110 100" aria-hidden="true">
        {lokasi === 'kemayoran' && (i % 2 ? <Menara x={0} y={36} /> : <Gedung x={0} y={36} s={1.2} />)}
        {lokasi === 'condet' && <PohonSalak x={0} y={20} s={1.2} />}
        {lokasi === 'setu-babakan' && (i % 2 ? <RumahKebaya x={-45} y={-44} s={0.9} /> : <Pohon x={0} y={10} s={1.1} />)}
      </svg>,
    );
  }
  hasil.push(
    <svg key="awan" className="properti" style={{ top: 4, right: 8 }} width="80" height="40" viewBox="-40 -20 80 40" aria-hidden="true">
      <Awan x={0} y={6} s={0.9} />
    </svg>,
  );
  return <>{hasil}</>;
}
