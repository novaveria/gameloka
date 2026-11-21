// Profil: avatar, statistik, kartu streak, grafik mingguan, lencana, koleksi kartu, Cerita Kami (DESIGN.md 8.7, 8.11).
import { useEffect, useRef, useState } from 'react';
import { Kerangka } from '../komponen/Kerangka.tsx';
import { Ikon, type NamaIkon } from '../komponen/Ikon.tsx';
import { Maskot, type Ekspresi } from '../komponen/Maskot.tsx';
import { IlustrasiBudaya } from '../komponen/Ilustrasi.tsx';
import { GrafikMingguan } from '../komponen/GrafikMingguan.tsx';
import { toast } from '../komponen/Toast.tsx';
import { GabungKelas } from './Peringkat.tsx';
import { useSiswa } from '../lib/store.tsx';
import { api } from '../lib/api.ts';
import { hariMinggu, NAMA_BULAN, NAMA_HARI, TARGET_HARIAN } from '../../shared/aturan.ts';
import type { StatusSiswa } from '../../shared/tipe.ts';

export function Profil({ fokus }: { fokus?: string }) {
  const { status, konten } = useSiswa();
  const koleksiRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (fokus === 'koleksi') koleksiRef.current?.scrollIntoView({ block: 'start' });
  }, [fokus]);
  const gabung = new Date(status.bergabung);

  return (
    <Kerangka tab="profil">
      <header className="profil__kepala">
        <div className="profil__avatar">
          <Maskot ekspresi="senang" ukuran={120} level={status.level.level} label={`Avatar level ${status.level.level}`} />
        </div>
        <div>
          <h1 className="judul-layar">{status.nama}</h1>
          <p className="teks-abu">
            {status.kelas ? status.kelas.nama : 'Belajar mandiri'} · Bergabung {NAMA_BULAN[gabung.getMonth()]} {gabung.getFullYear()}
          </p>
          <p className="profil__kode">
            Kode masuk: <strong>{status.kodeMasuk}</strong>
          </p>
        </div>
      </header>

      <section aria-labelledby="judul-stat" className="profil__bagian">
        <h2 id="judul-stat" className="instruksi">
          Statistik
        </h2>
        <div className="stat-grid">
          <Stat ikon="api" nilai={status.streak} label="Hari streak" kelas="teks-jingga" />
          <Stat ikon="xp" nilai={status.xp} label="Total XP" kelas="teks-kuning" />
          <Stat ikon="lencana" nilai={status.level.level} label={status.level.nama} kelas="teks-merah" />
          <Stat ikon="kartu" nilai={status.kartu.length} label="Kartu koleksi" kelas="teks-merah" />
        </div>
      </section>

      <KartuStreak status={status} />

      <section aria-labelledby="judul-grafik" className="profil__bagian">
        <h2 id="judul-grafik" className="instruksi">
          Kemajuan minggu ini
        </h2>
        <div className="kartu kartu--isi">
          <GrafikMingguan data={status.mingguan} hariIni={status.hariIni} />
        </div>
      </section>

      <section aria-labelledby="judul-lencana" className="profil__bagian">
        <h2 id="judul-lencana" className="instruksi">
          Lencana
        </h2>
        <ul className="lencana-grid">
          {konten.bagian.map((b) => {
            const punya = status.lencana.includes(b.lencana.id);
            return (
              <li key={b.id} className={`lencana${punya ? '' : ' lencana--belum'}`}>
                <Ikon nama="lencana" ukuran={52} warna={punya ? undefined : '#D5D8DC'} style={punya ? undefined : { filter: 'grayscale(1)' }} />
                <span className="lencana__nama">{b.lencana.nama}</span>
                <span className="teks-abu lencana__ket">{punya ? `Bagian ${b.nomor} tamat` : `Tamatkan Bagian ${b.nomor}`}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section ref={koleksiRef} id="koleksi" aria-labelledby="judul-koleksi" className="profil__bagian">
        <h2 id="judul-koleksi" className="instruksi">
          Koleksi kartu · {status.kartu.length}/{konten.kartu.length}
        </h2>
        <ul className="koleksi-grid">
          {konten.kartu.map((k) => {
            const punya = status.kartu.includes(k.id);
            return (
              <li key={k.id} className={`kartu-koleksi${punya ? '' : ' kartu-koleksi--siluet'}`}>
                <IlustrasiBudaya nama={k.id} ukuran={72} siluet={!punya} />
                <span className="kartu-koleksi__nama">{punya ? k.nama : 'Belum didapat'}</span>
                {punya && <span className="teks-abu kartu-koleksi__ket">{k.keterangan}</span>}
              </li>
            );
          })}
        </ul>
      </section>

      <CeritaKami />
      <Pengaturan />
    </Kerangka>
  );
}

function Stat({ ikon, nilai, label, kelas }: { ikon: NamaIkon; nilai: number; label: string; kelas: string }) {
  return (
    <div className="kartu stat">
      <Ikon nama={ikon} ukuran={30} />
      <div>
        <p className={`angka ${kelas}`}>{nilai}</p>
        <p className="teks-abu stat__label">{label}</p>
      </div>
    </div>
  );
}

// Kartu streak berwarna penuh dengan ekspresi maskot sesuai keadaan (DESIGN.md 8.7).
function KartuStreak({ status }: { status: StatusSiswa }) {
  const sudahHariIni = status.streakTerakhir === status.hariIni;
  const keadaan: 'jalan' | 'terancam' | 'nol' =
    status.streak === 0 ? 'nol' : !sudahHariIni && status.jamJakarta >= 18 ? 'terancam' : 'jalan';
  const ekspresi: Ekspresi = keadaan === 'jalan' ? 'semangat' : keadaan === 'terancam' ? 'cemas' : 'senang';
  const pesan =
    keadaan === 'jalan'
      ? sudahHariIni
        ? 'Hari ini sudah aman. Sampai besok!'
        : 'Satu pelajaran hari ini menjaga apinya.'
      : keadaan === 'terancam'
        ? 'Streak-mu putus tengah malam nanti. Satu pelajaran cukup.'
        : 'Mulai streak baru hari ini.';
  const minggu = hariMinggu(status.hariIni);
  const aktif = new Set(status.hariAktif);
  return (
    <section className={`kartu-streak kartu-streak--${keadaan}`} aria-labelledby="judul-streak">
      <div className="kartu-streak__teks">
        <h2 id="judul-streak" className="kartu-streak__angka">
          <Ikon nama="api" ukuran={30} warna={keadaan === 'jalan' ? '#FFFFFF' : undefined} /> {status.streak} hari
        </h2>
        <p>{pesan}</p>
        <ol className="kartu-streak__pekan" aria-label="Minggu ini">
          {minggu.map((d, i) => (
            <li key={d}>
              <span>{NAMA_HARI[i].charAt(0)}</span>
              <span className={`kartu-streak__titik${aktif.has(d) ? ' kartu-streak__titik--aktif' : ''}`} aria-label={aktif.has(d) ? 'aktif' : 'belum'}>
                {aktif.has(d) && <Ikon nama="centang" ukuran={14} />}
              </span>
            </li>
          ))}
        </ol>
        {keadaan !== 'jalan' || !sudahHariIni ? (
          <a className="tombol tombol--sekunder kartu-streak__tombol" href="#/belajar">
            Mulai belajar
          </a>
        ) : null}
      </div>
      <div className="kartu-streak__maskot" aria-hidden="true">
        <Maskot ekspresi={ekspresi} ukuran={84} level={status.level.level} />
      </div>
    </section>
  );
}

// ---------- Cerita Kami ----------

interface CeritaPublik {
  id: string;
  judul: string;
  isi: string;
  nama: string;
  waktu: string;
}

const LABEL_STATUS: Record<string, string> = {
  menunggu: 'Menunggu moderasi',
  disetujui: 'Tampil',
  ditolak: 'Tidak disetujui',
};

function CeritaKami() {
  const { status, setStatus } = useSiswa();
  const [buka, setBuka] = useState(false);
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [galat, setGalat] = useState<string | null>(null);
  const [kirim, setKirim] = useState(false);
  const [publik, setPublik] = useState<CeritaPublik[]>([]);

  useEffect(() => {
    api<CeritaPublik[]>('/api/cerita').then(setPublik).catch(() => {});
  }, [status.cerita.length]);

  async function simpan() {
    setGalat(null);
    setKirim(true);
    try {
      const s = await api<StatusSiswa>('/api/cerita', { judul, isi });
      setStatus(s);
      setJudul('');
      setIsi('');
      setBuka(false);
      toast('Ceritamu terkirim dan menunggu moderasi guru.');
    } catch (e) {
      setGalat(e instanceof Error ? e.message : 'Gagal mengirim.');
    } finally {
      setKirim(false);
    }
  }

  return (
    <section aria-labelledby="judul-cerita" className="profil__bagian">
      <h2 id="judul-cerita" className="instruksi">
        Cerita Kami
      </h2>
      <p className="teks-abu">Tulis pengalamanmu tentang budaya Betawi: makanan di rumah, acara di kampung, atau cerita engkong dan nyai. Cerita tampil setelah disetujui guru.</p>
      {status.cerita.length > 0 && (
        <ul className="cerita-saya">
          {status.cerita.map((c) => (
            <li key={c.id} className="kartu cerita-saya__item">
              <span>{c.judul}</span>
              <span className={`cerita-status cerita-status--${c.status}`}>{LABEL_STATUS[c.status] ?? c.status}</span>
            </li>
          ))}
        </ul>
      )}
      {buka ? (
        <form
          className="kartu kartu--isi form-cerita"
          onSubmit={(e) => {
            e.preventDefault();
            simpan();
          }}
        >
          <label htmlFor="cerita-judul" className="form-label">
            Judul
          </label>
          <input id="cerita-judul" className="isian" value={judul} onChange={(e) => setJudul(e.target.value)} maxLength={60} required minLength={3} />
          <label htmlFor="cerita-isi" className="form-label">
            Ceritamu
          </label>
          <textarea id="cerita-isi" className="isian isian--panjang" value={isi} onChange={(e) => setIsi(e.target.value)} maxLength={1200} required minLength={20} rows={6} aria-describedby="cerita-batas" />
          <p id="cerita-batas" className="teks-abu form-catatan">
            {isi.length}/1200 huruf. Jangan tulis alamat rumah atau nomor telepon.
          </p>
          {galat && <p className="galat">{galat}</p>}
          <button type="submit" className="tombol tombol--penuh" disabled={kirim || judul.trim().length < 3 || isi.trim().length < 20}>
            Kirim cerita
          </button>
          <button type="button" className="tautan" onClick={() => setBuka(false)}>
            Batal
          </button>
        </form>
      ) : (
        <button type="button" className="tombol tombol--sekunder tombol--penuh" onClick={() => setBuka(true)}>
          Tulis cerita
        </button>
      )}
      {publik.length > 0 && (
        <ul className="cerita-publik">
          {publik.map((c) => (
            <li key={c.id} className="kartu kartu--isi">
              <p className="cerita-publik__judul">{c.judul}</p>
              <p className="teks-abu">oleh {c.nama}</p>
              <p className="cerita-publik__isi">{c.isi}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Pengaturan() {
  const { status, setStatus, keluar } = useSiswa();
  const [yakin, setYakin] = useState(false);
  async function ubahTarget(t: number) {
    try {
      setStatus(await api<StatusSiswa>('/api/pengaturan', { targetHarian: t }));
      toast(`Target harian: ${t} XP`);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal menyimpan.');
    }
  }
  return (
    <section aria-labelledby="judul-atur" className="profil__bagian">
      <h2 id="judul-atur" className="instruksi">
        Pengaturan
      </h2>
      <div className="kartu kartu--isi atur">
        <p className="form-label" id="label-target">
          Target harian
        </p>
        <div className="cip-wadah" role="radiogroup" aria-labelledby="label-target">
          {TARGET_HARIAN.map((t) => (
            <button key={t} type="button" role="radio" aria-checked={status.targetHarian === t} className="cip" onClick={() => ubahTarget(t)}>
              {t} XP
            </button>
          ))}
        </div>
      </div>
      {!status.kelas && <GabungKelas />}
      {yakin ? (
        <div className="kartu kartu--isi atur">
          <p>
            Sebelum keluar, catat kode masukmu: <strong>{status.kodeMasuk}</strong>. Tanpa kode ini, progresmu tidak bisa dibuka lagi.
          </p>
          <button type="button" className="tombol tombol--merek tombol--penuh" onClick={keluar}>
            Keluar dari perangkat ini
          </button>
          <button type="button" className="tautan" onClick={() => setYakin(false)}>
            Batal
          </button>
        </div>
      ) : (
        <button type="button" className="tautan tautan--kiri" onClick={() => setYakin(true)}>
          <Ikon nama="keluar" ukuran={20} /> Keluar
        </button>
      )}
    </section>
  );
}
